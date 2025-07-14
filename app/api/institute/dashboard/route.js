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

    if (payload.role !== 'institution admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    const adminId = payload.id;

    // ✅ Fetch admin's institution details with JOIN
   const [adminRows] = await db.query(
  `SELECT i.id AS institution_id, i.name AS institution_name, i.code AS institution_code, i.logo
   FROM institution_admins a
   JOIN institutions i ON a.institution_id = i.id
   WHERE a.id = ?`,
  [adminId]
);


    if (adminRows.length === 0) {
      return new Response(JSON.stringify({ error: 'Institution not found for admin' }), { status: 404 });
    }

    const institution = adminRows[0];

    // ✅ Fetch students from this institution
    const [students] = await db.query(
      'SELECT * FROM students WHERE institution_id = ?',
      [institution.institution_id]
    );

    const totalStudents = students.length;
    const paid = students.filter((s) => s.payment_status === 'paid').length;
    const unpaid = totalStudents - paid;
    const noImage = students.filter((s) => !s.profile_pic).length;

    const branches = [...new Set(students.map((s) => s.branch).filter(Boolean))];
    const years = [...new Set(students.map((s) => s.class).filter(Boolean))];
    const studentTypes = [...new Set(students.map((s) => s.student_type).filter(Boolean))];

    return Response.json({
      institution: {
      id: institution.institution_id,
      name: institution.institution_name,
      code: institution.institution_code,
      logo: institution.logo 
        ? `data:image/jpeg;base64,${Buffer.from(institution.logo).toString('base64')}`
        : null,
    },

      stats: {
        totalStudents,
        paid,
        unpaid,
        noImage,
        totalBranches: branches.length,
        uniqueYears: years,
        studentTypes,
      },
      students
    });
  } catch (err) {
    console.error('Institution dashboard error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
