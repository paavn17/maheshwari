import { db } from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(req) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== 'institution admin') return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });

    const { card_design } = await req.json();
    if (!card_design) return new Response(JSON.stringify({ error: 'Card design ID required' }), { status: 400 });

    await db.query('UPDATE institution_admins SET card_design = ? WHERE id = ?', [card_design, payload.id]);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
