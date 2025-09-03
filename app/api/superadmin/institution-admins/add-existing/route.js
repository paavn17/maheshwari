import { db } from '@/lib/db';

export async function POST(req) {
  try {
    const { institution_id, name, email, phone, password, department } = await req.json();

    if (!institution_id || !name || !email || !phone || !password || !department) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    await db.query(
      `INSERT INTO institution_admins 
        (institution_id, name, email, phone, password, department, created_at, approved_by)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), 1)`,
      [institution_id, name, email, phone, password, department]
    );

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Add existing admin error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
