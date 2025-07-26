import { db } from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(request) {
  try {
    // Extract JWT token from cookies
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Missing token' }),
        { status: 401 }
      );
    }

    // Verify JWT token and decode payload
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Ensure only students can submit change requests
    if (payload.role !== 'student') {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Only students allowed' }),
        { status: 403 }
      );
    }

    const studentId = payload.id;

    // Parse request payload
    const body = await request.json();

    // Destructure body, renaming "class" to avoid reserved word
    const { institution_id, roll_no, section, class: student_class, changes } = body;

    // Validate required inputs
    if (
      institution_id == null ||
      roll_no == null ||
      section == null ||
      student_class == null ||
      !Array.isArray(changes) ||
      changes.length === 0
    ) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid data' }),
        { status: 400 }
      );
    }

    // Verify the student matches the provided data to prevent spoofing
    const [studentRows] = await db.query(
      `SELECT * FROM students WHERE id = ? AND institution_id = ? AND roll_no = ? AND section = ? AND class = ?`,
      [studentId, institution_id, roll_no, section, student_class]
    );
    if (studentRows.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Student not found or unauthorized' }),
        { status: 403 }
      );
    }

    // Insert change requests one by one
    for (const change of changes) {
      const { field_name, old_value = '', new_value = '' } = change;
      if (!field_name) continue; // Skip invalid records

      await db.query(
        `INSERT INTO change_requests
          (institution_id, roll_no, section, class, field_name, old_value, new_value, status, requested_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
        [institution_id, roll_no, section, student_class, field_name, old_value, new_value]
      );
    }

    return new Response(
      JSON.stringify({ message: 'Change request submitted successfully.' }),
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error in POST /student/request-change:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    // Extract JWT token from cookies
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Verify JWT token and decode payload
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Only students can view their own change requests
    if (payload.role !== 'student') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    const studentId = payload.id;

    // Fetch unique identifiers of the student
    const [studentRows] = await db.query(
      'SELECT institution_id, roll_no, section, class FROM students WHERE id = ?',
      [studentId]
    );
    if (studentRows.length === 0) {
      return new Response(JSON.stringify({ error: 'Student not found' }), { status: 404 });
    }
    const { institution_id, roll_no, section, class: student_class } = studentRows[0];

    // Fetch all change requests by this student ordered by request date
    const [requests] = await db.query(
      `SELECT request_id, field_name, old_value, new_value, status, requested_at
       FROM change_requests
       WHERE institution_id = ? AND roll_no = ? AND section = ? AND class = ?
       ORDER BY requested_at DESC`,
      [institution_id, roll_no, section, student_class]
    );

    return new Response(JSON.stringify({ requests }), { status: 200 });

  } catch (err) {
    console.error('Error in GET /student/request-change:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
