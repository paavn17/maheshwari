import { db } from '@/lib/db';

export async function POST(req) {
  try {
    const { institution_id, name, email, phone, password } = await req.json();

    await db.query(
      `INSERT INTO institution_admins 
        (institution_id, name, email, phone, password, org_type, account_status, approved, created_at, approved_by)
        VALUES (?, ?, ?, ?, ?, 'Academic', 'Live', 'Yes', NOW(), 1)`,
      [institution_id, name, email, phone, password]
    );

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
