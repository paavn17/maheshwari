import { db } from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET(request) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Removed role check but institution_id must exist
    const institution_id = payload.institution_id;
    if (!institution_id) {
      return new Response(JSON.stringify({ error: 'Institution ID missing in token' }), { status: 400 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'pending';

    // Fetch change requests joined with student info & branch from students table
    const [requests] = await db.query(
      `SELECT
        cr.request_id, cr.field_name, cr.old_value, cr.new_value, cr.status, cr.requested_at,
        cr.roll_no, cr.section, cr.class,
        s.name AS student_name,
        s.branch
      FROM change_requests cr
      JOIN students s 
        ON cr.institution_id = s.institution_id 
       AND cr.roll_no = s.roll_no 
       AND cr.section = s.section 
       AND cr.class = s.class
      WHERE cr.institution_id = ? AND cr.status = ?
      ORDER BY cr.requested_at DESC`,
      [institution_id, status]
    );

    return new Response(JSON.stringify({ requests }), { status: 200 });
  } catch (err) {
    console.error('Error fetching institute change requests:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
