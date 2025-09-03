import { db } from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET(req) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (payload.role !== 'super admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    // Get institutions
    const [institutions] = await db.query(`SELECT id, name, code FROM institutions`);
    const totalInstitutions = institutions.length;

    // Get students
    const [students] = await db.query(
      `SELECT profile_pic FROM students`
    );
    const totalStudents = students.length;
    const totalWithNoImage = students.filter(
      (s) => !s.profile_pic || s.profile_pic.length === 0
    ).length;

    return new Response(
      JSON.stringify({
        totalInstitutions,
        totalStudents,
        totalWithNoImage,
        institutions, // ✅ send institutions directly
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error('Super admin dashboard error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
