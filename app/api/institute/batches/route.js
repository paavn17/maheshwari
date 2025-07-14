import { db } from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET(req) {
  try {
    const token = req.cookies.get('token')?.value;
    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (payload.role !== 'institution admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    const [adminRows] = await db.query(
      'SELECT institution_id FROM institution_admins WHERE id = ?',
      [payload.id]
    );
    const institutionId = adminRows[0]?.institution_id;
    if (!institutionId) {
      return new Response(JSON.stringify({ error: 'Institution not found' }), { status: 404 });
    }

    const [batches] = await db.query(
      'SELECT DISTINCT start_year, end_year FROM students WHERE institution_id = ? ORDER BY start_year DESC',
      [institutionId]
    );

    return Response.json({ batches });
  } catch (err) {
    console.error('Batch fetch error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
