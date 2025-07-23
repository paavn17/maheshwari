import { db } from '@/lib/db'; // Adjust path if needed

export async function POST(req) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Admin ID is required' }), {
        status: 400,
      });
    }

    const [result] = await db.execute('DELETE FROM institution_admins WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return new Response(JSON.stringify({ error: 'Admin not found' }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ message: 'Admin deleted successfully' }), {
      status: 200,
    });
  } catch (error) {
    console.error('Delete Admin Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete admin' }), {
      status: 500,
    });
  }
}
