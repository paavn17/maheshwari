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

    const adminId = payload.id;

    // Get institution_id from admin record
    const [adminRows] = await db.query(
      'SELECT institution_id FROM institution_admins WHERE id = ?',
      [adminId]
    );

    if (!adminRows.length) {
      return new Response(JSON.stringify({ error: 'Institution not found for admin' }), {
        status: 404,
      });
    }
    const institutionId = adminRows[0].institution_id;

    const body = await req.json();

    const institutionType = (body.institution_type || '').toLowerCase();

    if (institutionType !== 'school' && institutionType !== 'college') {
      return new Response(
        JSON.stringify({ error: 'Invalid or missing institution type.' }),
        { status: 400 }
      );
    }

    const requiredAlways = ['name', 'roll_no', 'mobile', 'dob', 'blood_group'];
    const requiredFields = [...requiredAlways];

    if (institutionType === 'school') {
      requiredFields.push('class', 'section');
      // branch NOT required
    } else if (institutionType === 'college') {
      requiredFields.push('branch');
      // class & section NOT required
    }

    for (const field of requiredFields) {
      if (!body[field] || body[field].toString().trim() === '') {
        return new Response(
          JSON.stringify({ error: `Missing required field: ${field}` }),
          { status: 400 }
        );
      }
    }

    if (!body.profile_pic || !body.profile_pic.startsWith('data:image')) {
      return new Response(
        JSON.stringify({ error: 'Profile photo is required.' }),
        { status: 400 }
      );
    }

    const studentObj = {
      ...body,
      admin_id: adminId,
      institution_id: institutionId,
    };

    if (body.profile_pic.startsWith('data:image')) {
      const base64 = body.profile_pic.split(',')[1];
      studentObj.profile_pic = Buffer.from(base64, 'base64');
    }

    delete studentObj.institution_type;

    await db.query('INSERT INTO students SET ?', [studentObj]);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('Upload student error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    );
  }
}
