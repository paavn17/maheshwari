import { db } from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(request) {
  try {
    // Get the JWT token from cookies
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Verify JWT and extract payload
    const { payload } = await jwtVerify(token, JWT_SECRET);
    // No role check (per your setup)
    const institution_id = payload.institution_id;
    if (!institution_id) {
      return new Response(JSON.stringify({ error: 'Institution ID missing in token' }), { status: 400 });
    }

    // Parse and validate POST body
    const body = await request.json();
    const { request_id, decision } = body;
    if (!request_id || !['approve', 'reject'].includes(decision)) {
      return new Response(JSON.stringify({ error: 'Invalid request data' }), { status: 400 });
    }

    // Retrieve the change request
    const [rows] = await db.query('SELECT * FROM change_requests WHERE request_id = ?', [request_id]);
    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Request not found' }), { status: 404 });
    }
    const req = rows[0];

    // Confirm the request belongs to this institution
    if (req.institution_id !== institution_id) {
      return new Response(JSON.stringify({ error: 'Unauthorized for this institution' }), { status: 403 });
    }

    if (decision === 'approve') {
      // Update the student record
      await db.query(
        `UPDATE students SET ?? = ? WHERE institution_id = ? AND roll_no = ? AND section = ? AND class = ?`,
        [req.field_name, req.new_value, req.institution_id, req.roll_no, req.section, req.class]
      );
      // Set status to admin_approved, reviewer ID
      await db.query(
        `UPDATE change_requests SET status = 'admin_approved', reviewed_by_admin = ? WHERE request_id = ?`,
        [payload.id, request_id]
      );
    } else {
      // Set status to rejected, reviewer ID
      await db.query(
        `UPDATE change_requests SET status = 'rejected', reviewed_by_admin = ? WHERE request_id = ?`,
        [payload.id, request_id]
      );
    }

    return new Response(JSON.stringify({ message: `Request ${decision}d successfully.` }), { status: 200 });
  } catch (err) {
    console.error('Error reviewing institute change request:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
