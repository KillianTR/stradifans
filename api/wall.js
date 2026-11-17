/* StradiFans - birthday wall: chat messages for Stradi's birthday.
   Stored in the same Upstash Redis as the incident counter (list "sf:wall").
   Public from 29 Nov 2026 00:00 (Spanish time); before that only the site owner (admin key) can read it.
   GET -> { open, opensAt, messages? }   POST (admin) { user, text } adds, { remove: id } deletes. */
const crypto = require("crypto");
const OPENS_AT = Date.parse("2026-11-17T00:00:00Z"); // opened early: shown on stream on 17 Nov 2026
const KEY = "sf:wall";
// First messages, added to the wall the first time it is read
const SEED = [
  { id: "seed-alejandro", user: "alejandro2003203", ts: Date.parse("2026-11-17T12:00:00Z"),
    text: "Stradi, eres mi mayor referente en el simracing. Empecé en iRacing gracias a ti y a la pasión que le pones a cada directo. Entre tus risas contagiosas y esos enfados épicos que nos regalas a diario, se han vuelto mi mejor momento del día. Gracias por sacarme siempre una sonrisa." }
];

function isAdmin(req) {
  const key = process.env.STRADIFANS_ADMIN_KEY, given = String(req.headers["x-admin-key"] || "");
  return !!key && given.length === key.length && crypto.timingSafeEqual(Buffer.from(given), Buffer.from(key));
}
async function redis(url, token, commands) {
  const r = await fetch(url.replace(/\/$/, "") + "/pipeline", {
    method: "POST",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify(commands)
  });
  if (!r.ok) throw new Error("redis " + r.status);
  return (await r.json()).map((x) => x.result);
}
const clean = (s, max) => String(s || "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max);

module.exports = async (req, res) => {
  const env = process.env;
  const url = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL || env.STORAGE_REST_API_URL;
  const token = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN || env.STORAGE_REST_API_TOKEN;
  res.setHeader("Cache-Control", "no-store");
  if (!url || !token) return res.status(503).json({ error: "not_configured" });
  const admin = isAdmin(req), open = Date.now() >= OPENS_AT;
  try {
    if (req.method === "POST") {
      if (!admin) return res.status(403).json({ error: "forbidden" });
      let body = req.body;
      if (typeof body === "string") { try { body = JSON.parse(body); } catch (_) { body = {}; } }
      if (body && body.remove) {
        const list = await redis(url, token, [["LRANGE", KEY, 0, -1]]);
        const raw = (list[0] || []).find((x) => { try { return JSON.parse(x).id === body.remove; } catch (_) { return false; } });
        if (raw) await redis(url, token, [["LREM", KEY, 1, raw]]);
        return res.status(200).json({ ok: true });
      }
      const user = clean(body && body.user, 40).replace(/^@/, ""), text = clean(body && body.text, 1200);
      if (!user || !text) return res.status(400).json({ error: "missing" });
      const msg = { id: crypto.randomBytes(6).toString("hex"), user, text, ts: Date.now() };
      await redis(url, token, [["RPUSH", KEY, JSON.stringify(msg)]]);
      return res.status(200).json({ ok: true, message: msg });
    }
    if (!open && !admin) return res.status(200).json({ open: false, opensAt: OPENS_AT });
    let [list] = await redis(url, token, [["LRANGE", KEY, 0, -1]]);
    const [seeded] = await redis(url, token, [["SET", "sf:wall:seeded", "1", "NX"]]);
    if (seeded === "OK") { // first read ever: put the seed messages in
      await redis(url, token, SEED.map((m) => ["RPUSH", KEY, JSON.stringify(m)]));
      [list] = await redis(url, token, [["LRANGE", KEY, 0, -1]]);
    }
    const messages = (list || []).map((x) => { try { return JSON.parse(x); } catch (_) { return null; } }).filter(Boolean);
    if (open && !admin) res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
    return res.status(200).json({ open, opensAt: OPENS_AT, preview: !open && admin, messages });
  } catch (err) {
    return res.status(502).json({ error: "storage_error" });
  }
};
