import { db } from '@/lib/db';

function bufferToBase64(buffer) {
  if (!buffer) return null;
  return `data:image/jpeg;base64,${buffer.toString('base64')}`;
}

export async function POST(req) {
  try {
    const { institution_id } = await req.json();
    if (!institution_id) {
      return Response.json({ success: false, error: 'Institution ID required' }, { status: 400 });
    }

    const [employees] = await db.query(
      `SELECT id, name, emp_id, mobile, email, designation, department, profile_pic
       FROM employees
       WHERE institution_id = ?
       ORDER BY name`,
      [institution_id]
    );

    // Convert buffer profile_pic to base64 string with data URI
    const employeesWithPics = employees.map((emp) => ({
      ...emp,
      profile_pic: bufferToBase64(emp.profile_pic),
    }));

    return Response.json({ success: true, employees: employeesWithPics });
  } catch (err) {
    console.error('Fetch employees error:', err);
    return Response.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
