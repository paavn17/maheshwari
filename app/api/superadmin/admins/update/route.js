import { db } from '@/lib/db';

export async function POST(req) {
  try {
    const body = await req.json();
    const { id, name, email, phone, password, department } = body;

    if (!id || !name || !email || !phone) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400 }
      );
    }

    await db.query(
      `UPDATE institution_admins 
       SET name = ?, email = ?, phone = ?, password = ?, department = ?
       WHERE id = ?`,
      [name, email, phone, password, department || null, id]
    );

    return Response.json({ success: true });
  } catch (err) {
    console.error('Admin update error:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to update admin' }),
      { status: 500 }
    );
  }
}
