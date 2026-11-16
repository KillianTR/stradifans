// StradiFans - Vercel serverless function: returns Stradi's most viewed Twitch clips.
// Needs two environment variables in the Vercel project settings:
//   TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET (from https://dev.twitch.tv/console/apps)
// Response is cached at the edge for 1 hour.

const BROADCASTER_ID = "178443161"; // stradi
const MAX_PAGES = 5;                 // 5 x 100 clips

let cachedToken = null;
let tokenExpires = 0;

async function getToken(clientId, clientSecret) {
  if (cachedToken && Date.now() < tokenExpires) return cachedToken;
  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, grant_type: "client_credentials" })
  });
  if (!res.ok) throw new Error("token " + res.status);
  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpires = Date.now() + (data.expires_in - 300) * 1000;
  return cachedToken;
}

module.exports = async (req, res) => {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    res.status(503).json({ error: "not_configured" });
    return;
  }
  try {
    const token = await getToken(clientId, clientSecret);
    const clips = [];
    let cursor = "";
    for (let page = 0; page < MAX_PAGES; page++) {
      const url = new URL("https://api.twitch.tv/helix/clips");
      url.searchParams.set("broadcaster_id", BROADCASTER_ID);
      url.searchParams.set("first", "100");
      if (cursor) url.searchParams.set("after", cursor);
      const r = await fetch(url, { headers: { "Client-Id": clientId, Authorization: "Bearer " + token } });
      if (!r.ok) throw new Error("clips " + r.status);
      const data = await r.json();
      data.data.forEach((c) => clips.push({
        id: c.id,
        title: c.title,
        views: c.view_count,
        creator: c.creator_name,
        date: c.created_at,
        thumb: c.thumbnail_url,
        url: c.url
      }));
      cursor = data.pagination && data.pagination.cursor;
      if (!cursor) break;
    }
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    res.status(200).json({ clips });
  } catch (err) {
    res.status(502).json({ error: "twitch_error" });
  }
};
