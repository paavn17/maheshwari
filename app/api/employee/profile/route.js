import { db } from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET(req) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const employeeId = payload.id;

    const [employee] = await db.execute(
      `SELECT e.*, i.name AS institution_name 
       FROM employees e 
       JOIN institutions i ON e.institution_id = i.id 
       WHERE e.id = ?`,
      [employeeId]
    );

    if (!employee.length) {
      return new Response(JSON.stringify({ error: 'Employee not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(employee[0]), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
