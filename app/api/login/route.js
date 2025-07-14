import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  try {
    const { email, password, role, rememberMe } = await req.json();

    let query = '';
    let values = [];

    // Determine query based on role
    switch (role) {
      case 'student':
        query = 'SELECT * FROM students WHERE roll_no = ? AND mobile = ?';
        values = [email, password];
        break;
      case 'employee':
        query = 'SELECT * FROM employees WHERE emp_id = ? AND mobile = ?';
        values = [email, password];
        break;
      case 'institution admin':
        query = 'SELECT * FROM institution_admins WHERE email = ? AND password = ?';
        values = [email, password];
        break;
      case 'super admin':
        query = 'SELECT * FROM super_admins WHERE email = ? AND password = ?';
        values = [email, password];
        break;
      default:
        return new Response(JSON.stringify({ error: 'Invalid role selected' }), { status: 400 });
    }

    const [rows] = await db.query(query, values);

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
    }

    const user = rows[0];

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        role,
        name: user.name,
        email: user.email || user.roll_no || user.emp_id,
        institution_id: user.institution_id
      },
      JWT_SECRET,
      {
        expiresIn: rememberMe ? '7d' : '1d' // still restrict JWT lifetime on backend
      }
    );

    // Cookie options
    const cookieOptions = [
      `token=${token}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Strict',
      ...(rememberMe ? [`Max-Age=${60 * 60 * 24 * 7}`] : []) // omit Max-Age for session cookie
    ];

    return new Response(JSON.stringify({ success: true, role }), {
      status: 200,
      headers: {
        'Set-Cookie': cookieOptions.join('; ')
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
