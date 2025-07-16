import { db } from '@/lib/db';

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, front_img, back_img } = body;

    if (!name || !front_img || !back_img) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    }

    const frontBase64 = front_img.split(',')[1];
    const backBase64 = back_img.split(',')[1];
    const frontBuffer = Buffer.from(frontBase64, 'base64');
    const backBuffer = Buffer.from(backBase64, 'base64');

    await db.query(
      'INSERT INTO card_designs (name, front_img, back_img) VALUES (?, ?, ?)',
      [name, frontBuffer, backBuffer]
    );

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('❌ Upload error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

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
    console.error('❌ Fetch error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
