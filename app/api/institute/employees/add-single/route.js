import { db } from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(req) {
  try {
    // ✅ 1. Get JWT token and verify
    const token = req.cookies.get('token')?.value;
    if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const admin_id = payload.id; // 👈 this is your institution admin's ID

    // ✅ 2. Lookup institution_id from institution_admins
    const [[admin]] = await db.query(
      'SELECT institution_id FROM institution_admins WHERE id = ?',
      [admin_id]
    );

    if (!admin) return Response.json({ error: 'Invalid admin' }, { status: 403 });

    const institution_id = admin.institution_id;

    // ✅ 3. Parse request body
    const body = await req.json();

    // ✅ 4. Convert base64 to buffer if profile_pic exists
    let profile_pic = null;
    if (body.profile_pic?.startsWith('data:image')) {
      const base64 = body.profile_pic.split(',')[1];
      profile_pic = Buffer.from(base64, 'base64');
    }

    // ✅ 5. Insert employee
    await db.query(
      `INSERT INTO employees (
        admin_id, institution_id, name, father_name, emp_id, pf_no,
        designation, department, doj, dob, gender, mobile, email,
        adhaar_no, blood_group, identification, address, profile_pic
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        admin_id,
        institution_id,
        body.name,
        body.father_name ?? '',
        body.emp_id,
        body.pf_no ?? '',
        body.designation ?? '',
        body.department ?? '',
        body.doj ?? null,
        body.dob ?? null,
        body.gender ?? '',
        body.mobile,
        body.email ?? '',
        body.adhaar_no ?? '',
        body.blood_group ?? '',
        body.identification ?? '',
        body.address ?? '',
        profile_pic
      ]
    );

    return Response.json({ success: true });
  } catch (err) {
    console.error('Employee add error:', err);
    return Response.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
