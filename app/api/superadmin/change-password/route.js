import { db } from '@/lib/db'; // Your database connection

const SECRET_CODE = process.env.SUPERADMIN_SECRET || '123456'; // Store securely in .env

// POST: Verify super admin secret code
export async function POST(req) {
  try {
    const { secret } = await req.json();

    if (!secret || secret !== SECRET_CODE) {
      return new Response(JSON.stringify({ valid: false }), { status: 200 });
    }

    return new Response(JSON.stringify({ valid: true }), { status: 200 });
  } catch (err) {
    console.error('Secret Code Verification Error:', err);
    return new Response(JSON.stringify({ error: 'Something went wrong' }), { status: 500 });
  }
}

// PUT: Change Super Admin password (where id = 1)
export async function PUT(req) {
  try {
    const { newPassword } = await req.json();

    if (!newPassword || newPassword.length < 6) {
      return new Response(JSON.stringify({ error: 'Password must be at least 6 characters.' }), {
        status: 400,
      });
    }

    const [result] = await db.execute(
      `UPDATE institution_admins SET password = ? WHERE id = 1`,
      [newPassword]
    );

    if (result.affectedRows === 0) {
      return new Response(JSON.stringify({ error: 'Super Admin not found.' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('Password Change Error:', err);
    return new Response(JSON.stringify({ error: 'Failed to change password.' }), { status: 500 });
  }
}
