import { db } from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(req) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (payload.role !== 'institution admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    const adminId = payload.id;

    // ✅ Get the correct institution_id from the admin's record
    const [adminRows] = await db.query(
      'SELECT institution_id FROM institution_admins WHERE id = ?',
      [adminId]
    );

    if (adminRows.length === 0) {
      return new Response(JSON.stringify({ error: 'Institution not found for admin' }), {
        status: 404,
      });
    }

    const institutionId = adminRows[0].institution_id;

    const body = await req.json();

    // ✅ Validate required fields
    const required = ['name', 'roll_no', 'mobile', 'student_type'];
    for (const field of required) {
      if (!body[field] || body[field].trim() === '') {
        return new Response(JSON.stringify({ error: `Missing required field: ${field}` }), {
          status: 400,
        });
      }
    }

    // ✅ Attach both admin_id and institution_id
    body.admin_id = adminId;
    body.institution_id = institutionId;

    await db.query('INSERT INTO students SET ?', [body]);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('Upload student error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
