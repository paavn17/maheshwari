import { db } from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(req) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const adminId = payload.id;

    if (payload.role !== 'institution admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [[admin]] = await db.query(
      'SELECT institution_id FROM institution_admins WHERE id = ?',
      [adminId]
    );
    if (!admin) return Response.json({ error: 'Institution not found' }, { status: 404 });
    const institutionId = admin.institution_id;

    const { students } = await req.json();
    if (!Array.isArray(students) || students.length === 0)
      return Response.json({ error: 'No students provided' }, { status: 400 });

    const requiredFields = ['name', 'roll_no', 'mobile', 'student_type'];

    for (let i = 0; i < students.length; i++) {
      const student = students[i];

      for (const field of requiredFields) {
        if (!student[field] || student[field].toString().trim() === '')
          return Response.json(
            { error: `Missing required field "${field}" in row ${i + 2}` },
            { status: 400 }
          );
      }

      student.admin_id = adminId;
      student.institution_id = institutionId;

      if (student.batch) {
        const [start, end] = student.batch.split('-').map((s) => s.trim());
        student.start_year = start;
        student.end_year = end;
        delete student.batch;
      }

      // Convert Base64 to Buffer
      let profileBuffer = null;
      if (student.profile_pic?.startsWith?.('data:image')) {
        const base64 = student.profile_pic.split(',')[1]; // remove "data:image/jpeg;base64,"
        profileBuffer = Buffer.from(base64, 'base64');
        student.profile_pic = profileBuffer;
      } else {
        delete student.profile_pic;
      }

      const cleanStudent = Object.fromEntries(
        Object.entries(student).filter(([_, v]) => v !== undefined && v !== null)
      );

      await db.query('INSERT INTO students SET ?', [cleanStudent]);
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error('Student bulk upload error:', err);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
