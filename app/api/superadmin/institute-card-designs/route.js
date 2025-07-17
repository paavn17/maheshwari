import { db } from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET(req) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    await jwtVerify(token, JWT_SECRET);

    const [rows] = await db.execute(`SELECT * FROM institute_card_designs`);

    const cards = rows.map(row => ({
      id: row.id,
      name: row.name,
      front_img: row.front_img ? `data:image/jpeg;base64,${Buffer.from(row.front_img).toString('base64')}` : null,
      back_img: row.back_img ? `data:image/jpeg;base64,${Buffer.from(row.back_img).toString('base64')}` : null,
      admin_name: row.admin_name,
      phone: row.phone,
      institution_id: row.institution_id,
      created_at: row.created_at
    }));

    return new Response(JSON.stringify({ cards }), { status: 200 });
  } catch (err) {
    console.error('Failed to fetch card designs:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
