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

    if (payload.role !== 'super admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    const { students, institution_id } = await req.json();

    if (!institution_id) {
      return new Response(JSON.stringify({ error: 'Institution not selected' }), { status: 400 });
    }

    if (!Array.isArray(students) || students.length === 0) {
      return new Response(JSON.stringify({ error: 'No students provided' }), { status: 400 });
    }

    const requiredFields = ['name', 'roll_no', 'mobile'];

    for (let i = 0; i < students.length; i++) {
      const student = students[i];

      // ✅ Validate required fields
      for (const field of requiredFields) {
        if (!student[field] || student[field].toString().trim() === '') {
          return new Response(
            JSON.stringify({ error: `Missing required field "${field}" in row ${i + 2}` }),
            { status: 400 }
          );
        }
      }

      // ✅ Attach institution ID
      student.institution_id = institution_id;

      // ✅ Convert batch to start_year and end_year
      if (student.batch && typeof student.batch === 'string') {
        const [start, end] = student.batch.split('-').map((s) => s.trim());
        student.start_year = start;
        student.end_year = end;
        delete student.batch; // ❗ remove to prevent insert error
      }

      // ✅ Clean null/undefined values
      const cleanStudent = Object.fromEntries(
        Object.entries(student).filter(([_, v]) => v !== null && v !== undefined)
      );

      // ✅ Ensure batch is not present
      delete cleanStudent.batch;

      await db.query('INSERT INTO students SET ?', [cleanStudent]);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('Super Admin Bulk Upload Error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
