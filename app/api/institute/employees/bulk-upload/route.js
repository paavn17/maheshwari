import { db } from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(req) {
  try {
    // ✅ 1. Verify token and get admin_id
    const token = req.cookies.get('token')?.value;
    if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const admin_id = payload.id;

    // ✅ 2. Get institution_id from admin
    const [[admin]] = await db.query(
      'SELECT institution_id FROM institution_admins WHERE id = ?',
      [admin_id]
    );

    if (!admin) return Response.json({ error: 'Invalid admin' }, { status: 403 });
    const institution_id = admin.institution_id;

    // ✅ 3. Parse employee list
    const body = await req.json();
    const employees = body.employees || [];

    if (!employees.length) {
      return Response.json({ success: false, error: 'No employee data received' });
    }

    // ✅ 4. Insert employees one by one
    for (const emp of employees) {
      const {
        name = '', father_name = '', emp_id = '', pf_no = '', designation = '', department = '',
        doj = null, dob = null, gender = '', mobile = '', email = '', adhaar_no = '',
        blood_group = '', identification = '', address = '', profile_pic = ''
      } = emp;

      // Skip if required fields are missing
      if (!name || !emp_id || !mobile) continue;

      // ✅ Convert base64 image to Buffer if exists
      let profileBuffer = null;
      if (profile_pic?.startsWith?.('data:image')) {
        const base64 = profile_pic.split(',')[1];
        profileBuffer = Buffer.from(base64, 'base64');
      }

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
          profileBuffer
        ]
      );
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error('Bulk upload error:', err);
    return Response.json({ success: false, error: 'Server error' });
  }
}
