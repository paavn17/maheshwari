import { db } from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT 
        ia.id, 
        ia.name, 
        ia.email, 
        ia.phone, 
        ia.password,  
        ia.department,
        ia.created_at, 
        ia.approved_by,
        i.code AS college_code,
        i.logo AS institution_logo
      FROM institution_admins ia
      LEFT JOIN institutions i ON ia.institution_id = i.id
    `);

    const admins = rows.map(row => ({
      ...row,
      institution_logo: row.institution_logo
        ? `data:image/png;base64,${Buffer.from(row.institution_logo).toString('base64')}`
        : null,
    }));

    return Response.json({ admins });
  } catch (err) {
    console.error('Fetch admins error:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch admins' }), { status: 500 });
  }
}
