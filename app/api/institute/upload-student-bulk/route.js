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

    // ✅ Get the institution_id of the admin
    const [adminRows] = await db.query(
      'SELECT institution_id FROM institution_admins WHERE id = ?',
      [adminId]
    );

    if (adminRows.length === 0 || !adminRows[0].institution_id) {
      return new Response(JSON.stringify({ error: 'Institution not found for admin' }), { status: 404 });
    }

    const institutionId = adminRows[0].institution_id;

    const { students } = await req.json();

    if (!Array.isArray(students) || students.length === 0) {
      return new Response(JSON.stringify({ error: 'No students provided' }), { status: 400 });
    }

    const requiredFields = ['name', 'roll_no', 'mobile', 'student_type'];

    for (let i = 0; i < students.length; i++) {
      const student = students[i];

      // ✅ Check required fields
      for (const field of requiredFields) {
        if (!student[field] || student[field].toString().trim() === '') {
          return new Response(
            JSON.stringify({ error: `Missing required field "${field}" in row ${i + 2}` }),
            { status: 400 }
          );
        }
      }

      // ✅ Attach institution/admin ID
      student.institution_id = institutionId;
      student.admin_id = adminId;

      // ✅ Split batch into start_year and end_year
      if (student.batch && typeof student.batch === 'string') {
        const [start, end] = student.batch.split('-').map((s) => s.trim());
        student.start_year = start;
        student.end_year = end;
        delete student.batch;
      }

      // ✅ Clean undefined/null values
      const cleanStudent = Object.fromEntries(
        Object.entries(student).filter(([_, v]) => v !== null && v !== undefined)
      );

      // ✅ Insert into database
      await db.query('INSERT INTO students SET ?', [cleanStudent]);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('Bulk upload error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
