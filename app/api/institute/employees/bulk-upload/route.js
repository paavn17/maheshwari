import { db } from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(req) {
  try {
    // Verify token and check admin role
    const token = req.cookies.get('token')?.value;
    if (!token) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== 'institution admin')
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });

    const admin_id = payload.id;

    // Get institution_id for admin
    const [[admin]] = await db.query(
      'SELECT institution_id FROM institution_admins WHERE id = ?',
      [admin_id]
    );

    if (!admin) return new Response(JSON.stringify({ error: 'Invalid admin' }), { status: 403 });
    const institution_id = admin.institution_id;

    // Parse employees from request body
    const body = await req.json();
    const employees = body.employees || [];

    if (!employees.length) {
      return new Response(JSON.stringify({ success: false, error: 'No employee data received' }));
    }

    for (let i = 0; i < employees.length; i++) {
      const emp = employees[i];
      const {
        name = '',
        father_name = '',
        emp_id = '',
        pf_no = '',
        designation = '',
        department = '',
        doj = null,
        dob = null,
        gender = '',
        mobile = '',
        email = '',
        adhaar_no = '',
        blood_group = '',
        identification = '',
        address = '',
        profile_pic = '',
      } = emp;

      // Check mandatory fields for ID card + photo, send error for first failing row
      if (!name || !emp_id || !mobile || !dob || !blood_group) {
        return new Response(
          JSON.stringify({
            success: false,
            error: `Missing mandatory fields in row ${i + 2}`,
          }),
          { status: 400 }
        );
      }

      if (!profile_pic || !profile_pic.startsWith('data:image')) {
        return new Response(
          JSON.stringify({
            success: false,
            error: `Profile photo is required and must be a valid image (row ${i + 2})`,
          }),
          { status: 400 }
        );
      }

      // Convert base64 image to Buffer for DB storage
      const base64 = profile_pic.split(',')[1];
      const profileBuffer = Buffer.from(base64, 'base64');

      await db.query(
        `INSERT INTO employees (
          admin_id, institution_id, name, father_name, emp_id, pf_no, designation, department,
          doj, dob, gender, mobile, email, adhaar_no, blood_group,
          identification, address, profile_pic
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          admin_id,
          institution_id,
          name,
          father_name,
          emp_id,
          pf_no,
          designation,
          department,
          doj || null,
          dob || null,
          gender,
          mobile,
          email,
          adhaar_no,
          blood_group,
          identification,
          address,
          profileBuffer,
        ]
      );
    }

    return new Response(JSON.stringify({ success: true }));
  } catch (err) {
    console.error('Bulk upload error:', err);
    return new Response(JSON.stringify({ success: false, error: 'Server error' }), { status: 500 });
  }
}
