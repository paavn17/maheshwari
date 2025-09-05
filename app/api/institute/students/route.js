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

    const { start_year, end_year, branch, name, roll_no } = await req.json();

    // Get institution_id and department (admin's branch)
    const [adminRows] = await db.query(
      'SELECT institution_id, department FROM institution_admins WHERE id = ?',
      [payload.id]
    );
    const admin = adminRows[0];
    if (!admin) {
      return new Response(JSON.stringify({ error: 'Institution admin not found' }), { status: 404 });
    }
    const institutionId = admin.institution_id;
    const adminDepartment = admin.department;

    // Build dynamic query
    let query = 'SELECT * FROM students WHERE institution_id = ?';
    const params = [institutionId];

    // Always filter by admin's department (branch), optional fallback if no department
    if (adminDepartment) {
      query += ' AND branch = ?';
      params.push(adminDepartment);
    }

    // Additional filters from request
    if (start_year) {
      query += ' AND start_year = ?';
      params.push(start_year);
    }
    if (end_year) {
      query += ' AND end_year = ?';
      params.push(end_year);
    }
    if (branch) {
      // You may choose to still filter branch partially OR remove if always filtering by admin's department
      query += ' AND branch LIKE ?';
      params.push(`%${branch}%`);
    }
    if (name) {
      query += ' AND name LIKE ?';
      params.push(`%${name}%`);
    }
    if (roll_no) {
      query += ' AND roll_no LIKE ?';
      params.push(`%${roll_no}%`);
    }

    const [rows] = await db.query(query, params);

    // Convert profile_pic BLOB to base64 image strings
    const students = rows.map((student) => {
      if (student.profile_pic) {
        student.profile_pic = `data:image/jpeg;base64,${Buffer.from(student.profile_pic).toString('base64')}`;
      } else {
        student.profile_pic = null;
      }
      return student;
    });

    return new Response(JSON.stringify({ students }), { status: 200 });
  } catch (err) {
    console.error('Fetch students error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
