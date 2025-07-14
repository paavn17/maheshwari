import { db } from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

// GET handler - fetch profile
export async function GET(req) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== 'institution admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    const [adminRows] = await db.query(
      'SELECT institution_id FROM institution_admins WHERE id = ?',
      [payload.id]
    );

    if (!adminRows.length) {
      return new Response(JSON.stringify({ error: 'Institution not found' }), { status: 404 });
    }

    const institutionId = adminRows[0].institution_id;

    const [rows] = await db.query(
      `SELECT name, code, email, phone, address, state, city, pincode, type, logo
       FROM institutions
       WHERE id = ?`,
      [institutionId]
    );

    if (!rows.length) {
      return new Response(JSON.stringify({ error: 'Institution not found' }), { status: 404 });
    }

    const profile = rows[0];

    // Convert logo buffer to base64 image
    let logo = null;
    if (profile.logo) {
      const buffer = Buffer.from(profile.logo);
      logo = `data:image/png;base64,${buffer.toString('base64')}`;
    }

    return Response.json({
      profile: {
        ...profile,
        logo, // include logo as base64 or null
      },
    });
  } catch (err) {
    console.error('Fetch profile error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

// POST handler - update profile
export async function POST(req) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== 'institution admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    const body = await req.json();

    const [adminRows] = await db.query(
      'SELECT institution_id FROM institution_admins WHERE id = ?',
      [payload.id]
    );

    if (!adminRows.length) {
      return new Response(JSON.stringify({ error: 'Institution not found' }), { status: 404 });
    }

    const institutionId = adminRows[0].institution_id;

    // Convert base64 logo to Buffer if present
    let logoBuffer = null;
    if (body.logo?.startsWith('data:image')) {
      const base64Data = body.logo.split(',')[1];
      logoBuffer = Buffer.from(base64Data, 'base64');
    }

    await db.query(
      `UPDATE institutions SET 
        email = ?, 
        phone = ?, 
        address = ?, 
        state = ?, 
        city = ?, 
        pincode = ?, 
        type = ?, 
        logo = ?
      WHERE id = ?`,
      [
        body.email || '',
        body.phone || '',
        body.address || '',
        body.state || '',
        body.city || '',
        body.pincode || '',
        body.type || '',
        logoBuffer, // may be null
        institutionId
      ]
    );

    return Response.json({ success: true });
  } catch (err) {
    console.error('Update profile error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
