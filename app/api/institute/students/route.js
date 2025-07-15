import { db } from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(req) {
  try {
    const token = req.cookies.get('token')?.value;
    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (payload.role !== 'institution admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    const { start_year, end_year, branch, name, roll_no } = await req.json();

    // Get institution_id
    const [adminRows] = await db.query(
      'SELECT institution_id FROM institution_admins WHERE id = ?',
      [payload.id]
    );
    const institutionId = adminRows[0]?.institution_id;
    if (!institutionId) {
      return new Response(JSON.stringify({ error: 'Institution not found' }), { status: 404 });
    }

    // Build dynamic query
    let query = 'SELECT * FROM students WHERE institution_id = ?';
    const params = [institutionId];

    if (start_year) {
      query += ' AND start_year = ?';
      params.push(start_year);
    }
    if (end_year) {
      query += ' AND end_year = ?';
      params.push(end_year);
    }
    if (branch) {
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

    // Convert profile_pic BLOB to base64
    const students = rows.map((student) => {
      if (student.profile_pic) {
        student.profile_pic = `data:image/jpeg;base64,${Buffer.from(student.profile_pic).toString('base64')}`;
      } else {
        student.profile_pic = null;
      }
      return student;
    });

    return Response.json({ students });

  } catch (err) {
    console.error('Fetch students error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
