import { db } from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await db.query('SELECT id, name, code FROM institutions');
    return Response.json({ institutions: rows });
  } catch (err) {
    console.error('Fetch institutions error:', err);
    return new Response(JSON.stringify({ error: 'Failed to load institutions' }), { status: 500 });
  }
}
