import { db } from '@/lib/db';

export async function POST(req) {
  try {
    const { institution_id } = await req.json();
    if (!institution_id) return Response.json({ error: 'Institution ID required' }, { status: 400 });

    const [students] = await db.query(
      `SELECT id, name, roll_no, mobile, email, branch, start_year, end_year
       FROM students
       WHERE institution_id = ?
       ORDER BY name`,
      [institution_id]
    );

    return Response.json({ success: true, students });
  } catch (err) {
    console.error('Fetch students error:', err);
    return Response.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
