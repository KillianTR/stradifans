/* StradiFans - visitor reviews of the site (one per Twitch account).
   GET -> { me, reviews: [{ id, name, img, stars, text, ts, mine }] }
   POST, logged in with Twitch: { stars: 1-5, text } writes or replaces your review; { remove: true } deletes it.
   POST, admin key: { remove: id } deletes any review. Storage: the same Upstash Redis (hash "sf:reviews"). */
const crypto = require("crypto");
const session = require("./_session");
const KEY = "sf:reviews";
const SEED = { // first piece of feedback, from the chat
  "seed-venumrs": { id: "seed-venumrs", name: "VenumRS", img: "", stars: null, text: "Muy buena la web. Yo le agregaría algo que destaque mejor el canal de YouTube, pero muy buen trabajo.", ts: Date.parse("2026-11-17T12:00:00Z"), source: "Chat de Twitch" }
};

function isAdmin(req) {
  const key = process.env.STRADIFANS_ADMIN_KEY, given = String(req.headers["x-admin-key"] || "");
  return !!key && given.length === key.length && crypto.timingSafeEqual(Buffer.from(given), Buffer.from(key));
}
async function redis(url, token, commands) {
  const r = await fetch(url.replace(/\/$/, "") + "/pipeline", {
    method: "POST", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" }, body: JSON.stringify(commands)
  });
  if (!r.ok) throw new Error("redis " + r.status);
  return (await r.json()).map((x) => x.result);
}
const clean = (s, max) => String(s || "").replace(/[\u0000-\u001f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);

module.exports = async (req, res) => {
  const env = process.env;
  const url = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL || env.STORAGE_REST_API_URL;
  const token = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN || env.STORAGE_REST_API_TOKEN;
  res.setHeader("Cache-Control", "no-store");
  if (!url || !token) return res.status(503).json({ error: "not_configured" });
  const me = session.read(req), admin = isAdmin(req);
  try {
    const [seeded] = await redis(url, token, [["SET", "sf:reviews:seeded", "1", "NX"]]);
    if (seeded === "OK") await redis(url, token, Object.entries(SEED).map(([k, v]) => ["HSET", KEY, k, JSON.stringify(v)]));

    if (req.method === "POST") {
      let body = req.body;
      if (typeof body === "string") { try { body = JSON.parse(body); } catch (_) { body = {}; } }
      if (admin && body && typeof body.remove === "string") { await redis(url, token, [["HDEL", KEY, body.remove]]); return res.status(200).json({ ok: true }); }
      if (!me) return res.status(401).json({ error: "login_required" });
      if (body && body.remove) { await redis(url, token, [["HDEL", KEY, me.id]]); return res.status(200).json({ ok: true }); }
      const stars = Math.round(Number(body && body.stars)), text = clean(body && body.text, 200);
      if (!(stars >= 1 && stars <= 5) || text.length < 2) return res.status(400).json({ error: "missing" });
      const rl = "sf:reviews:rl:" + me.id;
      const [n] = await redis(url, token, [["INCR", rl], ["EXPIRE", rl, 3600]]);
      if (n > 10) return res.status(429).json({ error: "slow_down" });
      const review = { id: me.id, name: me.name || me.login, img: me.img, stars, text, ts: Date.now(), source: "Espectador de Twitch" };
      await redis(url, token, [["HSET", KEY, me.id, JSON.stringify(review)]]);
    }
    const [flat] = await redis(url, token, [["HGETALL", KEY]]);
    const reviews = [];
    for (let i = 0; i < (flat || []).length; i += 2) { try { reviews.push(JSON.parse(flat[i + 1])); } catch (_) {} }
    reviews.sort((a, b) => b.ts - a.ts);
    return res.status(200).json({ me: me ? { id: me.id, name: me.name, img: me.img } : null,
      reviews: reviews.map((r) => ({ ...r, mine: !!(me && r.id === me.id) })) });
  } catch (err) {
    return res.status(502).json({ error: "storage_error" });
  }
};
