import { db } from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT i.id, i.name
      FROM institutions i
      WHERE i.id IN (
        SELECT DISTINCT institution_id FROM students WHERE institution_id IS NOT NULL
      )
      ORDER BY i.name
    `);

    return Response.json({ success: true, institutions: rows });
  } catch (err) {
    console.error('Fetch student institutions error:', err);
    return Response.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}
