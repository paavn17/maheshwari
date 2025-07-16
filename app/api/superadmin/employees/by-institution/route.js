// /app/api/superadmin/employees/by-institution/route.js
import { db } from '@/lib/db';

export async function POST(req) {
  try {
    const { institution_id } = await req.json();
    if (!institution_id) return Response.json({ error: 'Institution ID required' }, { status: 400 });

    const [employees] = await db.query(
      `SELECT id, name, emp_id, mobile, email, designation, department FROM employees
       WHERE institution_id = ? ORDER BY name`,
      [institution_id]
    );

    return Response.json({ success: true, employees });
  } catch (err) {
    console.error('Fetch employees error:', err);
    return Response.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
