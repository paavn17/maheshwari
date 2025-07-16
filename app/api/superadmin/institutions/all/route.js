// /api/superadmin/institutions/all/route.js
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await db.query(`SELECT id, name FROM institutions`);
    return new Response(JSON.stringify(rows), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
