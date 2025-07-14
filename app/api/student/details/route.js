import { db } from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET(request) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== 'student') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    const studentId = payload.id;

    const [results] = await db.query(
      `SELECT 
         s.*, 
         i.name AS institution_name, 
         i.code AS institution_code
       FROM students s
       LEFT JOIN institutions i ON s.institution_id = i.id
       WHERE s.id = ?`,
      [studentId]
    );

    if (results.length === 0) {
      return new Response(JSON.stringify({ student: null }), { status: 200 });
    }

    const student = results[0];

    let profile_pic = null;
    if (student.profile_pic) {
      const buffer = Buffer.from(student.profile_pic);
      profile_pic = `data:image/jpeg;base64,${buffer.toString('base64')}`;
    }

    const studentData = {
      name: student.name,
      father_name: student.father_name,
      roll_no: student.roll_no,
      mobile: student.mobile,
      email: student.email,
      gender: student.gender,
      dob: student.dob,
      blood_group: student.blood_group,
      adhaar_no: student.adhaar_no,
      identification: student.identification,
      address: student.address,
      class: student.class,
      section: student.section,
      student_type: student.student_type,
      payment_status: student.payment_status,
      institution_name: student.institution_name,
      institution_code: student.institution_code,
      profile_pic,
    };

    if (['Intermediate', 'College'].includes(student.student_type)) {
      studentData.branch = student.branch;
      studentData.batch = student.batch;
    }

    return Response.json({ student: studentData });
  } catch (err) {
    console.error('Student fetch error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
