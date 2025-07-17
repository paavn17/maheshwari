// /app/api/institute/card-designs/route.js
import { db } from '@/lib/db';
import { jwtVerify } from 'jose';
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
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

export async function POST(req) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const adminId = payload.id;

    // Fetch admin details from DB
    const [adminRow] = await db.query(
      'SELECT name, phone, institution_id FROM institution_admins WHERE id = ?',
      [adminId]
    );

    if (!adminRow || adminRow.length === 0) {
      return new Response(JSON.stringify({ error: 'Admin not found' }), { status: 404 });
    }

    const { name: admin_name, phone, institution_id } = adminRow[0];

    const body = await req.json();
    const { name, front_img, back_img } = body;

    if (!name || !front_img || !back_img) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    }

    const frontBuffer = Buffer.from(front_img.split(',')[1], 'base64');
    const backBuffer = Buffer.from(back_img.split(',')[1], 'base64');

    await db.query(
      `INSERT INTO institute_card_designs 
       (name, front_img, back_img, admin_name, phone, institution_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, frontBuffer, backBuffer, admin_name, phone, institution_id]
    );

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('Upload error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}