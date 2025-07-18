import { db } from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(req) {
  try {
    const token = req.cookies.get('token')?.value;
    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (payload.role !== 'institution admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    const { students } = await req.json();
    if (!Array.isArray(students)) {
      return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400 });
    }

    for (const student of students) {
      const { id, profile_pic, ...fields } = student;
      if (!id) continue;

      const clean = Object.fromEntries(
        Object.entries(fields).filter(([_, v]) => v !== null && v !== undefined)
      );

      // Handle base64 image upload
      if (profile_pic && profile_pic.startsWith('data:image')) {
        const base64Data = profile_pic.split(',')[1];
        clean.profile_pic = Buffer.from(base64Data, 'base64');
      }

      await db.query('UPDATE students SET ? WHERE id = ?', [clean, id]);
    }

    return Response.json({ success: true });

  } catch (err) {
    console.error('Update students error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
