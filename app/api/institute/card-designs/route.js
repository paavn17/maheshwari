// /app/api/institute/card-designs/route.js
import { db } from '@/lib/db';

export async function GET(req) {
  try {
    const [rows] = await db.query('SELECT id, name, front_img, back_img FROM card_designs');

    const cards = rows.map((row) => ({
      id: row.id,
      name: row.name,
      front_url: `data:image/jpeg;base64,${row.front_img.toString('base64')}`,
      back_url: `data:image/jpeg;base64,${row.back_img.toString('base64')}`,
    }));

    return new Response(JSON.stringify({ cards }), { status: 200 });
  } catch (err) {
    console.error('❌ Fetch error (Institute):', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}