export default async (request, context) => {
  const url = new URL(request.url);
  const fileId = url.searchParams.get('file_id');
  const apiKey = url.searchParams.get('api_key');

  if (!fileId || !apiKey) {
    return new Response(JSON.stringify({ error: "Missing file_id or api_key" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const driveUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`;

  try {
    const driveResp = await fetch(driveUrl);

    if (!driveResp.ok) {
      const errText = await driveResp.text();
      return new Response(JSON.stringify({ error: "Drive API error", message: errText }), {
        status: driveResp.status,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Stream response directly from Google
    return new Response(driveResp.body, {
      status: 200,
      headers: {
        'Content-Type': driveResp.headers.get('Content-Type') || 'video/mp4',
        'Cache-Control': 'public, max-age=86400', // cache for 1 day
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Proxy error", details: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
