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

    const requiredFields = ['name', 'roll_no', 'mobile']; // ✅ student_type and admin_id removed

    for (let i = 0; i < students.length; i++) {
      const student = students[i];

      for (const field of requiredFields) {
        if (!student[field] || student[field].toString().trim() === '') {
          return new Response(
            JSON.stringify({ error: `Missing required field "${field}" in row ${i + 2}` }),
            { status: 400 }
          );
        }
      }

      // ✅ Only institution_id is attached
      student.institution_id = institution_id;

      const cleanStudent = Object.fromEntries(
        Object.entries(student).filter(([_, v]) => v !== null && v !== undefined)
      );

      await db.query('INSERT INTO students SET ?', [cleanStudent]);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('Super Admin Bulk Upload Error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
