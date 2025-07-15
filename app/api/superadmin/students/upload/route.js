import { db } from '@/lib/db';
import { jwtVerify } from 'jose';
import xlsx from 'xlsx';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(req) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== 'super admin') return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });

    const formData = await req.formData();
    const file = formData.get('file');
    const institutionId = formData.get('institution_id');
    const adminId = formData.get('admin_id');

    if (!file || !institutionId || !adminId) {
      return new Response(JSON.stringify({ error: 'Missing file or IDs' }), { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = xlsx.read(arrayBuffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    if (!Array.isArray(data) || data.length === 0) {
      return new Response(JSON.stringify({ error: 'Empty or invalid Excel data' }), { status: 400 });
    }

    for (const student of data) {
      const requiredFields = ['name', 'roll_no', 'mobile'];
      for (const field of requiredFields) {
        if (!student[field] || student[field].toString().trim() === '') {
          return new Response(
            JSON.stringify({ error: `Missing required field "${field}" in row with roll_no: ${student.roll_no || 'unknown'}` }),
            { status: 400 }
          );
        }
      }

      student.institution_id = institutionId;
      student.admin_id = adminId;

      const cleanStudent = Object.fromEntries(
        Object.entries(student).filter(([_, v]) => v !== null && v !== undefined)
      );

      await db.query('INSERT INTO students SET ?', [cleanStudent]);
    }

    return Response.json({ success: true });

  } catch (err) {
    console.error('Super admin upload error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
