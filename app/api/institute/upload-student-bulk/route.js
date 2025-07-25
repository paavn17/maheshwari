import { db } from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(req) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== 'institution admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    const adminId = payload.id;

    // fetch institution id for this admin
    const [[admin]] = await db.query(
      'SELECT institution_id FROM institution_admins WHERE id = ?',
      [adminId]
    );
    if (!admin) {
      return new Response(JSON.stringify({ error: 'Institution not found' }), { status: 404 });
    }
    const institutionId = admin.institution_id;

    const { students } = await req.json();
    if (!Array.isArray(students) || students.length === 0) {
      return new Response(JSON.stringify({ error: 'No students provided' }), { status: 400 });
    }

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const rowNum = i + 2;

      const instType = (student.institution_type || '').toLowerCase();
      if (instType !== 'school' && instType !== 'college') {
        return new Response(
          JSON.stringify({ error: `Invalid or missing institution type in row ${rowNum}` }),
          { status: 400 }
        );
      }

      const requiredAlways = ['name', 'roll_no', 'mobile', 'dob', 'blood_group'];
      const requiredFields = [...requiredAlways];

      if (instType === 'school') {
        requiredFields.push('class', 'section');
      } else {
        requiredFields.push('branch');
      }

      for (const field of requiredFields) {
        if (!student[field] || student[field].toString().trim() === '') {
          return new Response(
            JSON.stringify({ error: `Missing required field "${field}" in row ${rowNum}` }),
            { status: 400 }
          );
        }
      }

      if (!student.profile_pic || !student.profile_pic.startsWith('data:image')) {
        return new Response(
          JSON.stringify({ error: `Profile photo is required in row ${rowNum}` }),
          { status: 400 }
        );
      }

      // Utilize start_year and end_year if provided, else derive from batch
      if (student.start_year && student.end_year) {
        const startInt = parseInt(student.start_year, 10);
        const endInt = parseInt(student.end_year, 10);
        if (
          isNaN(startInt) ||
          isNaN(endInt) ||
          startInt.toString().length !== 4 ||
          endInt.toString().length !== 4
        ) {
          return new Response(
            JSON.stringify({ error: `Invalid start_year or end_year in row ${rowNum}` }),
            { status: 400 }
          );
        }
        student.start_year = startInt;
        student.end_year = endInt;
      } else if (student.batch) {
        const parts = student.batch.split('-').map((s) => s.trim());
        if (parts.length !== 2) {
          return new Response(
            JSON.stringify({ error: `Invalid batch format in row ${rowNum}. Expected "YYYY-YYYY".` }),
            { status: 400 }
          );
        }
        const start = parseInt(parts[0], 10);
        const end = parseInt(parts[1], 10);
        if (isNaN(start) || isNaN(end)) {
          return new Response(
            JSON.stringify({ error: `Invalid numeric batch in row ${rowNum}.` }),
            { status: 400 }
          );
        }
        student.start_year = start;
        student.end_year = end;
      }

      student.admin_id = adminId;
      student.institution_id = institutionId;
      delete student.institution_type;
      delete student.batch;

      if (student.profile_pic.startsWith('data:image')) {
        const base64 = student.profile_pic.split(',')[1];
        student.profile_pic = Buffer.from(base64, 'base64');
      }

      const clean = Object.fromEntries(
        Object.entries(student).filter(([_, v]) => v !== undefined && v !== null)
      );

      await db.query('INSERT INTO students SET ?', [clean]);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('Student bulk upload error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
