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

    const [rows] = await db.query('SELECT * FROM students WHERE id = ?', [studentId]);
    if (rows.length === 0) {
      return new Response(JSON.stringify({ student: null }), { status: 200 });
    }

    const student = rows[0];

    // ✅ Format profile_pic as base64 string
    let profile_pic = null;
    if (student.profile_pic) {
      const buffer = Buffer.from(student.profile_pic);
      profile_pic = `data:image/jpeg;base64,${buffer.toString('base64')}`;
    }

    // ✅ Only expose required fields
    const baseData = {
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
      profile_pic,
    };

    // ✅ Include branch and batch only for Intermediate & College
    if (['Intermediate', 'College'].includes(student.student_type)) {
      baseData.branch = student.branch;
      baseData.batch = student.batch;
    }

    return Response.json({ student: baseData });

  } catch (err) {
    console.error('Student fetch error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
