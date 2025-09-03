import { db } from '@/lib/db';

export async function POST(req) {
  try {
    const data = await req.json();
    const {
      college_name,
      college_code,
      admin_name,
      admin_email,
      admin_phone,
      admin_password,
      admin_department
    } = data;

    if (!college_name || !college_code || !admin_name || !admin_email || !admin_phone || !admin_password || !admin_department) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // Insert institution
    const [institutionResult] = await db.query(
      `INSERT INTO institutions (name, code, created_at)
       VALUES (?, ?, NOW())`,
      [college_name, college_code]
    );

    const institution_id = institutionResult.insertId;

    // Insert institution admin
    await db.query(
      `INSERT INTO institution_admins
       (institution_id, name, email, phone, password, department, created_at, approved_by)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), 1)`,
      [institution_id, admin_name, admin_email, admin_phone, admin_password, admin_department]
    );

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('Add institution & admin error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
