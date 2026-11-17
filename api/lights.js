/* StradiFans - start lights reaction ranking (best time per Twitch account).
   GET                      -> { top: [{ name, img, ms }], me: { ms, rank } | null }
   POST { action: "start" } -> { token }  (a signed start time, so results can't be sent without playing)
   POST { ms, token }       -> saves your time if it's your best (needs "Log in with Twitch")
   Storage: the same Upstash Redis as the incident counter. */
const crypto = require("crypto");
const session = require("./_session");
const ZKEY = "sf:lights", HKEY = "sf:lights:users";
const MIN_LIGHTS = 4500; // the five lights take at least this long before they go out

const secret = () => process.env.STRADIFANS_SESSION_SECRET || process.env.TWITCH_CLIENT_SECRET || "";
const sign = (s) => crypto.createHmac("sha256", secret()).update("lights:" + s).digest("base64url");

async function redis(url, token, commands) {
  const r = await fetch(url.replace(/\/$/, "") + "/pipeline", {
    method: "POST",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify(commands)
  });
  if (!r.ok) throw new Error("redis " + r.status);
  return (await r.json()).map((x) => x.result);
}

async function board(url, token, me) {
  const [ids] = await redis(url, token, [["ZRANGE", ZKEY, 0, 9, "WITHSCORES"]]);
  const pairs = [];
  for (let i = 0; i < (ids || []).length; i += 2) pairs.push([ids[i], Number(ids[i + 1])]);
  const [users] = pairs.length ? await redis(url, token, [["HMGET", HKEY, ...pairs.map((p) => p[0])]]) : [[]];
  const top = pairs.map(([uid, ms], i) => {
    let u = {}; try { u = JSON.parse(users[i] || "{}"); } catch (_) {}
    return { name: u.name || "?", img: u.img || "", ms, mine: !!(me && me.id === uid) };
  });
  let mine = null;
  if (me) {
    const [score, rank] = await redis(url, token, [["ZSCORE", ZKEY, me.id], ["ZRANK", ZKEY, me.id]]);
    if (score !== null) mine = { ms: Number(score), rank: Number(rank) + 1 };
  }
  return { top, me: mine };
}

module.exports = async (req, res) => {
  const env = process.env;
  const url = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL || env.STORAGE_REST_API_URL;
  const token = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN || env.STORAGE_REST_API_TOKEN;
  res.setHeader("Cache-Control", "no-store");
  if (!url || !token || !secret()) return res.status(503).json({ error: "not_configured" });
  const me = session.read(req);
  try {
    if (req.method !== "POST") return res.status(200).json(await board(url, token, me));

    let body = req.body;
    if (typeof body === "string") { try { body = JSON.parse(body); } catch (_) { body = {}; } }
    if (body && body.action === "start") {
      const t = String(Date.now()) + "." + crypto.randomBytes(6).toString("hex");
      return res.status(200).json({ token: t + "." + sign(t) });
    }

    if (!me) return res.status(401).json({ error: "login_required" });
    const ms = Math.round(Number(body && body.ms));
    const parts = String((body && body.token) || "").split(".");
    const t = parts.slice(0, 2).join("."), started = Number(parts[0]);
    const good = sign(t);
    if (parts.length !== 3 || parts[2].length !== good.length || !crypto.timingSafeEqual(Buffer.from(parts[2]), Buffer.from(good))) return res.status(400).json({ error: "bad_token" });
    const elapsed = Date.now() - started;
    // The lights alone take 4.5 s; anything from 10 ms counts (some F1 drivers have done ~60 ms)
    if (!(ms >= 10 && ms <= 2000) || elapsed < MIN_LIGHTS + ms - 300 || elapsed > 30000) return res.status(400).json({ error: "not_valid" });
    const [fresh] = await redis(url, token, [["SET", "sf:lights:tok:" + parts[1], "1", "NX", "EX", 120]]);
    if (fresh !== "OK") return res.status(400).json({ error: "used_token" });
    const rl = "sf:lights:rl:" + me.id;
    const [n] = await redis(url, token, [["INCR", rl], ["EXPIRE", rl, 60]]);
    if (n > 15) return res.status(429).json({ error: "slow_down" });

    await redis(url, token, [
      ["ZADD", ZKEY, "LT", ms, me.id], // keeps only your best (lowest) time
      ["HSET", HKEY, me.id, JSON.stringify({ name: me.name || me.login, img: me.img })]
    ]);
    return res.status(200).json(await board(url, token, me));
  } catch (err) {
    return res.status(502).json({ error: "storage_error" });
  }
};
