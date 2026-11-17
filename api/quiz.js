/* StradiFans - "¿Eres el verdadero Stradi?" ranking (best score per Twitch account).
   GET               -> { top: [{ name, img, pct }], me: { pct, rank } | null }
   POST { answers }  -> the score is worked out here from your answers (needs "Log in with Twitch");
                        keeps your best, ties go to whoever got there first. */
const session = require("./_session");
const ZKEY = "sf:quiz", HKEY = "sf:quiz:users";

// The questions live in data.js (window.SITE); load them once
global.window = global.window || {};
require("../data.js");
const QUIZ = global.window.SITE.quiz;

async function redis(url, token, commands) {
  const r = await fetch(url.replace(/\/$/, "") + "/pipeline", {
    method: "POST",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify(commands)
  });
  if (!r.ok) throw new Error("redis " + r.status);
  return (await r.json()).map((x) => x.result);
}
// Sorted ascending: higher % first, then earlier time
const encode = (pct, ts) => (100 - pct) * 1e13 + ts;
const decode = (score) => 100 - Math.floor(Number(score) / 1e13);

async function board(url, token, me) {
  const [ids] = await redis(url, token, [["ZRANGE", ZKEY, 0, 9, "WITHSCORES"]]);
  const pairs = [];
  for (let i = 0; i < (ids || []).length; i += 2) pairs.push([ids[i], ids[i + 1]]);
  const [users] = pairs.length ? await redis(url, token, [["HMGET", HKEY, ...pairs.map((p) => p[0])]]) : [[]];
  const top = pairs.map(([uid, s], i) => {
    let u = {}; try { u = JSON.parse(users[i] || "{}"); } catch (_) {}
    return { name: u.name || "?", img: u.img || "", pct: decode(s), mine: !!(me && me.id === uid) };
  });
  let mine = null;
  if (me) {
    const [score, rank] = await redis(url, token, [["ZSCORE", ZKEY, me.id], ["ZRANK", ZKEY, me.id]]);
    if (score !== null) mine = { pct: decode(score), rank: Number(rank) + 1 };
  }
  return { top, me: mine };
}

module.exports = async (req, res) => {
  const env = process.env;
  const url = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL || env.STORAGE_REST_API_URL;
  const token = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN || env.STORAGE_REST_API_TOKEN;
  res.setHeader("Cache-Control", "no-store");
  if (!url || !token) return res.status(503).json({ error: "not_configured" });
  const me = session.read(req);
  try {
    if (req.method !== "POST") return res.status(200).json(await board(url, token, me));
    if (!me) return res.status(401).json({ error: "login_required" });
    let body = req.body;
    if (typeof body === "string") { try { body = JSON.parse(body); } catch (_) { body = {}; } }
    const answers = Array.isArray(body && body.answers) ? body.answers : [];
    if (answers.length !== QUIZ.length) return res.status(400).json({ error: "bad_answers" });
    let total = 0;
    for (let i = 0; i < QUIZ.length; i++) {
      const hit = QUIZ[i].a.find((a) => a[0] === answers[i]);
      if (!hit) return res.status(400).json({ error: "bad_answers" });
      total += hit[1];
    }
    const pct = Math.round(total / QUIZ.length);
    const rl = "sf:quiz:rl:" + me.id;
    const [n] = await redis(url, token, [["INCR", rl], ["EXPIRE", rl, 600]]);
    if (n > 20) return res.status(429).json({ error: "slow_down" });
    await redis(url, token, [
      ["ZADD", ZKEY, "LT", encode(pct, Date.now()), me.id], // only improves your entry
      ["HSET", HKEY, me.id, JSON.stringify({ name: me.name || me.login, img: me.img })]
    ]);
    return res.status(200).json({ pct, ...(await board(url, token, me)) });
  } catch (err) {
    return res.status(502).json({ error: "storage_error" });
  }
};
