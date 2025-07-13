// app/api/test-db/route.js
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS result');
    return Response.json({ connected: true, result: rows[0].result });
  } catch (error) {
    console.error(error);
    return Response.json({ connected: false, error: error.message });
  }
}
