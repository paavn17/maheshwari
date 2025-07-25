import { db } from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(req) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== 'institution admin') {
      return new Response(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403 }
      );
    }

    const adminId = payload.id;

    // Get institution_id from admin record
    const [[admin]] = await db.query(
      'SELECT institution_id FROM institution_admins WHERE id = ?',
      [adminId]
    );
    if (!admin) {
      return new Response(
        JSON.stringify({ error: 'Institution not found' }),
        { status: 404 }
      );
    }
    const institutionId = admin.institution_id;

    const { students } = await req.json();

    if (!Array.isArray(students) || students.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No students provided' }),
        { status: 400 }
      );
    }

    for (let i = 0; i < students.length; i++) {
      const student = students[i];

      const institutionType = (student.institution_type || '').toLowerCase();

      if (institutionType !== 'school' && institutionType !== 'college') {
        return new Response(
          JSON.stringify({ error: `Invalid or missing institution type in row ${i + 2}` }),
          { status: 400 }
        );
      }

      const requiredAlways = ['name', 'roll_no', 'mobile', 'dob', 'blood_group'];
      const requiredFields = [...requiredAlways];

      if (institutionType === 'school') {
        requiredFields.push('class', 'section');
        // branch NOT required
      } else if (institutionType === 'college') {
        requiredFields.push('branch');
        // class & section NOT required
      }

      for (const field of requiredFields) {
        if (!student[field] || student[field].toString().trim() === '') {
          return new Response(
            JSON.stringify({ error: `Missing required field "${field}" in row ${i + 2}` }),
            { status: 400 }
          );
        }
      }

      if (!student.profile_pic || !student.profile_pic.startsWith('data:image')) {
        return new Response(
          JSON.stringify({ error: `Profile photo is required in row ${i + 2}` }),
          { status: 400 }
        );
      }

      student.admin_id = adminId;
      student.institution_id = institutionId;

      if (student.profile_pic.startsWith('data:image')) {
        const base64 = student.profile_pic.split(',')[1];
        student.profile_pic = Buffer.from(base64, 'base64');
      }

      delete student.institution_type;

      const cleanStudent = Object.fromEntries(
        Object.entries(student).filter(([_, v]) => v !== undefined && v !== null)
      );

      await db.query('INSERT INTO students SET ?', [cleanStudent]);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('Student bulk upload error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
