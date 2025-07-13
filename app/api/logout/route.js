// app/api/logout/route.js
export async function GET() {
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Set-Cookie': [
        `token=; Path=/; HttpOnly; Max-Age=0; SameSite=Strict`
      ]
    }
  });
}
