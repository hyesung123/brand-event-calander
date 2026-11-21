const FEED_URL = "https://brand-event-calander.snu-chatgpt-5678.chatgpt.site/api/public-feed";

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const serviceToken = process.env.MOA_SITES_BYPASS_TOKEN;
  if (!serviceToken) return response.status(503).json({ error: "Public calendar feed is not configured" });

  try {
    const upstream = await fetch(FEED_URL, {
      headers: {
        accept: "application/json",
        "OAI-Sites-Authorization": `Bearer ${serviceToken}`,
      },
      cache: "no-store",
    });
    if (!upstream.ok) return response.status(502).json({ error: "Public calendar feed is temporarily unavailable" });
    const data = await upstream.json();
    if (!Array.isArray(data.brands) || !Array.isArray(data.events)) {
      return response.status(502).json({ error: "Public calendar feed returned an invalid response" });
    }

    response.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return response.status(200).json(data);
  } catch {
    return response.status(502).json({ error: "Public calendar feed is temporarily unavailable" });
  }
}

