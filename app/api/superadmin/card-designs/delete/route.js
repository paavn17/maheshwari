import { db } from '@/lib/db'; // Adjust based on your db setup

export async function POST(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return new Response(JSON.stringify({ error: 'Card design ID is required' }), {
        status: 400,
      });
    }

    const [result] = await db.execute('DELETE FROM card_designs WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return new Response(JSON.stringify({ error: 'Card design not found' }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ message: 'Card design deleted successfully' }), {
      status: 200,
    });
  } catch (error) {
    console.error('Delete Card Design Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete card design' }), {
      status: 500,
    });
  }
}
