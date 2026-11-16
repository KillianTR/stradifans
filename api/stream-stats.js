// StradiFans - Vercel serverless function: live status + recent stream history from the Twitch API.
// Uses the same TWITCH_CLIENT_ID / TWITCH_CLIENT_SECRET environment variables as /api/clips.
// Response (cached 60 s at the edge):
//   { live: bool, startedAt: ISO|null, title: string|null, sessions: [{ start: ISO, end: ISO }] }

const BROADCASTER_ID = "178443161"; // stradi

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

// "3h2m10s" -> seconds
function parseDuration(d) {
  let s = 0;
  String(d).replace(/(\d+)([hms])/g, (_, n, u) => { s += Number(n) * (u === "h" ? 3600 : u === "m" ? 60 : 1); });
  return s;
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
    const headers = { "Client-Id": clientId, Authorization: "Bearer " + token };

    const [streamRes, videoRes] = await Promise.all([
      fetch(`https://api.twitch.tv/helix/streams?user_id=${BROADCASTER_ID}`, { headers }),
      fetch(`https://api.twitch.tv/helix/videos?user_id=${BROADCASTER_ID}&type=archive&first=100`, { headers })
    ]);
    if (!streamRes.ok || !videoRes.ok) throw new Error("helix");
    const stream = (await streamRes.json()).data[0] || null;
    const videos = (await videoRes.json()).data || [];

    const sessions = videos.map((v) => {
      const start = new Date(v.created_at);
      return { start: start.toISOString(), end: new Date(start.getTime() + parseDuration(v.duration) * 1000).toISOString() };
    });

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    res.status(200).json({
      live: !!stream,
      startedAt: stream ? stream.started_at : null,
      title: stream ? stream.title : null,
      sessions
    });
  } catch (err) {
    res.status(502).json({ error: "twitch_error" });
  }
};
