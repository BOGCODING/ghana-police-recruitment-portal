export async function GET() {
  const backendUrl = (process.env.NEXT_PUBLIC_API_URL || '').trim().replace(/\/+$/, '');
  let backendStatus = 'unknown';

  try {
    const response = await fetch(`${backendUrl}/health`, { next: { revalidate: 0 } });
    if (response.ok) {
      backendStatus = 'online';
    } else {
      backendStatus = 'error';
    }
  } catch (error) {
    backendStatus = 'offline';
  }

  return Response.json({
    status: 'ok',
    frontend: 'online',
    backend: backendStatus,
    timestamp: new Date().toISOString()
  });
}
