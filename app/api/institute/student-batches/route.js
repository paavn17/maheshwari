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

    // Fetch logged-in admin's institution details and department (admin's branch)
    const [adminRows] = await db.query(
      `SELECT a.institution_id, a.department, i.name AS institution_name, i.code AS institution_code, i.logo
       FROM institution_admins a
       JOIN institutions i ON a.institution_id = i.id
       WHERE a.id = ?`,
      [adminId]
    );

    if (adminRows.length === 0) {
      return new Response(JSON.stringify({ error: 'Institution admin not found' }), { status: 404 });
    }

    const admin = adminRows[0];
    const institution_id = admin.institution_id;
    const adminBranch = admin.department && admin.department.trim() !== '' ? admin.department : null;

    // Fetch students filtered by branch if adminBranch exists, else all institution students
    const [students] = adminBranch
      ? await db.query(
          'SELECT * FROM students WHERE institution_id = ? AND branch = ?',
          [institution_id, adminBranch]
        )
      : await db.query('SELECT * FROM students WHERE institution_id = ?', [institution_id]);

    // Compute stats
    const totalStudents = students.length;
    const paid = students.filter((s) => s.payment_status === 'paid').length;
    const unpaid = totalStudents - paid;
    const noImage = students.filter((s) => !s.profile_pic).length;

    const branches = [...new Set(students.map((s) => s.branch).filter(Boolean))];
    const years = [...new Set(students.map((s) => s.class).filter(Boolean))];
    const studentTypes = [...new Set(students.map((s) => s.student_type).filter(Boolean))];

    return new Response(
      JSON.stringify({
        institution: {
          id: institution_id,
          name: admin.institution_name,
          code: admin.institution_code,
          logo: admin.logo
            ? `data:image/jpeg;base64,${Buffer.from(admin.logo).toString('base64')}`
            : null,
        },
        adminBranch,  // Explicitly include adminBranch here
        stats: {
          totalStudents,
          paid,
          unpaid,
          noImage,
          totalBranches: branches.length,
          uniqueYears: years,
          studentTypes,
        },
        students,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error('Institution dashboard error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
