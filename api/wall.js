/* StradiFans - birthday wall: chat messages for Stradi's birthday.
   Stored in the same Upstash Redis as the incident counter (list "sf:wall").
   Public from 29 Nov 2026 00:00 (Spanish time); before that only the site owner (admin key) can read it.
   GET -> { open, opensAt, me, messages? }
   POST, logged in with Twitch: { text } writes (or replaces) your own message, { remove: id } deletes your own.
   POST, admin key: { user, text } adds any message, { remove: id } deletes any. */
const crypto = require("crypto");
const session = require("./_session");
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
  const admin = isAdmin(req), open = Date.now() >= OPENS_AT, me = session.read(req);
  try {
    if (req.method === "POST") {
      if (!admin && !me) return res.status(401).json({ error: "login_required" });
      let body = req.body;
      if (typeof body === "string") { try { body = JSON.parse(body); } catch (_) { body = {}; } }
      const [list] = await redis(url, token, [["LRANGE", KEY, 0, -1]]);
      const all = (list || []).map((raw) => { try { return { raw, m: JSON.parse(raw) }; } catch (_) { return null; } }).filter(Boolean);

      if (body && body.remove) {
        const hit = all.find((x) => x.m.id === body.remove);
        if (!hit) return res.status(200).json({ ok: true });
        if (!admin && hit.m.uid !== me.id) return res.status(403).json({ error: "not_yours" }); // only your own message
        await redis(url, token, [["LREM", KEY, 1, hit.raw]]);
        return res.status(200).json({ ok: true });
      }

      const text = clean(body && body.text, admin ? 1200 : 600);
      if (!text) return res.status(400).json({ error: "missing" });
      let msg;
      if (admin && body.user) {
        const user = clean(body.user, 40).replace(/^@/, "");
        msg = { id: crypto.randomBytes(6).toString("hex"), user, text, ts: Date.now() };
      } else {
        // One message per Twitch account: writing again replaces your previous one
        const rl = "sf:wallrl:" + me.id;
        const [n] = await redis(url, token, [["INCR", rl], ["EXPIRE", rl, 3600]]);
        if (n > 10) return res.status(429).json({ error: "slow_down" });
        const mine = all.filter((x) => x.m.uid === me.id);
        if (mine.length) await redis(url, token, mine.map((x) => ["LREM", KEY, 1, x.raw]));
        msg = { id: crypto.randomBytes(6).toString("hex"), uid: me.id, user: me.name || me.login, img: me.img, text, ts: Date.now() };
      }
      await redis(url, token, [["RPUSH", KEY, JSON.stringify(msg)]]);
      return res.status(200).json({ ok: true, message: msg });
    }
    const meOut = me ? { id: me.id, name: me.name, img: me.img } : null;
    if (!open && !admin) return res.status(200).json({ open: false, opensAt: OPENS_AT, me: meOut });
    let [list] = await redis(url, token, [["LRANGE", KEY, 0, -1]]);
    const [seeded] = await redis(url, token, [["SET", "sf:wall:seeded", "1", "NX"]]);
    if (seeded === "OK") { // first read ever: put the seed messages in
      await redis(url, token, SEED.map((m) => ["RPUSH", KEY, JSON.stringify(m)]));
      [list] = await redis(url, token, [["LRANGE", KEY, 0, -1]]);
    }
    const messages = (list || []).map((x) => { try { return JSON.parse(x); } catch (_) { return null; } }).filter(Boolean);
    return res.status(200).json({ open, opensAt: OPENS_AT, preview: !open && admin, me: meOut, messages: messages.map((m) => ({ ...m, mine: !!(me && m.uid === me.id) })) });
  } catch (err) {
    return res.status(502).json({ error: "storage_error" });
  }
};
