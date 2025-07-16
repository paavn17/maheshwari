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
      admin_password
    } = data;

    // Insert into institutions
    const [institutionResult] = await db.query(
      `INSERT INTO institutions (name, code, created_at)
       VALUES (?, ?, NOW())`,
      [college_name, college_code]
    );

    const institution_id = institutionResult.insertId;

    // Insert into institution_admins
    await db.query(
      `INSERT INTO institution_admins
       (institution_id, name, email, phone, password, org_type, account_status, approved, created_at, approved_by)
       VALUES (?, ?, ?, ?, ?, 'Academic', 'Live', 'Yes', NOW(), 1)`,
      [
        institution_id,
        admin_name,
        admin_email,
        admin_phone,
        admin_password
      ]
    );

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('Error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
