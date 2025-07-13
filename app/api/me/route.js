// /app/api/me/route.js
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET(request) {
  const token = request.cookies.get('token')?.value;
  if (!token) {
    return new Response(JSON.stringify({ error: 'No token' }), { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return new Response(JSON.stringify({ success: true, role: payload.role }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
  }
}
