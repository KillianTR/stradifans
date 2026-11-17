// StradiFans - Vercel serverless function: Twitch chat badges (global + Stradi's channel badges).
// Uses the same TWITCH_CLIENT_ID / TWITCH_CLIENT_SECRET environment variables as /api/clips.
// Response (cached 1 day at the edge): { badges: { "set/version": { url, title } } }

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

module.exports = async (req, res) => {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  if (!clientId || !clientSecret) return res.status(503).json({ error: "not_configured" });
  try {
    const token = await getToken(clientId, clientSecret);
    const headers = { "Client-Id": clientId, Authorization: "Bearer " + token };
    const [globalRes, channelRes] = await Promise.all([
      fetch("https://api.twitch.tv/helix/chat/badges/global", { headers }),
      fetch(`https://api.twitch.tv/helix/chat/badges?broadcaster_id=${BROADCASTER_ID}`, { headers })
    ]);
    if (!globalRes.ok) throw new Error("helix");
    const badges = {};
    const add = (sets) => (sets || []).forEach((s) => (s.versions || []).forEach((v) => {
      badges[`${s.set_id}/${v.id}`] = { url: v.image_url_2x || v.image_url_1x, title: v.title || s.set_id };
    }));
    add((await globalRes.json()).data);
    if (channelRes.ok) add((await channelRes.json()).data); // channel badges (sub months, bits) override global ones
    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");
    res.status(200).json({ badges });
  } catch (err) {
    res.status(502).json({ error: "twitch_error" });
  }
};
