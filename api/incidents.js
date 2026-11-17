/* StradiFans - shared incident counter for today's stream.
   Storage: Upstash Redis (Vercel Marketplace). Needs KV_REST_API_URL + KV_REST_API_TOKEN
   (or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN). The count starts again every day (Spanish time). */
const ALLOWED = new Set([1, 2, 4]);
const PER_MINUTE = 30; // max additions per visitor per minute

function today() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
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

module.exports = async (req, res) => {
  const env = process.env;
  const url = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL || env.STORAGE_REST_API_URL;
  const token = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN || env.STORAGE_REST_API_TOKEN;
  res.setHeader("Cache-Control", "no-store");
  if (!url || !token) return res.status(503).json({ error: "not_configured" });

  const day = today(), key = "sf:inc:" + day;
  try {
    if (req.method === "POST") {
      let body = req.body;
      if (typeof body === "string") { try { body = JSON.parse(body); } catch (_) { body = {}; } }
      if (body && body.reset) { // only the site owner (admin key) can reset today's count
        const adminKey = process.env.STRADIFANS_ADMIN_KEY;
        const given = String(req.headers["x-admin-key"] || "");
        const ok = adminKey && given.length === adminKey.length && require("crypto").timingSafeEqual(Buffer.from(given), Buffer.from(adminKey));
        if (!ok) return res.status(403).json({ error: "forbidden" });
        await redis(url, token, [["DEL", key]]);
        return res.status(200).json({ day, count: 0 });
      }
      const add = Number(body && body.add);
      if (!ALLOWED.has(add)) return res.status(400).json({ error: "bad_value" });

      const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "anon";
      const rl = "sf:rl:" + ip + ":" + Math.floor(Date.now() / 60000);
      const [hits] = await redis(url, token, [["INCR", rl], ["EXPIRE", rl, 90]]);
      if (hits > PER_MINUTE) {
        const [count] = await redis(url, token, [["GET", key]]);
        return res.status(429).json({ error: "slow_down", day, count: Number(count) || 0 });
      }
      const [count] = await redis(url, token, [["INCRBY", key, add], ["EXPIRE", key, 60 * 60 * 24 * 40]]);
      return res.status(200).json({ day, count: Number(count) || 0 });
    }
    const [count] = await redis(url, token, [["GET", key]]);
    // Reads are shared through Vercel's cache for a few seconds: the database gets very few hits even with many viewers
    res.setHeader("Cache-Control", "public, s-maxage=4, stale-while-revalidate=4");
    return res.status(200).json({ day, count: Number(count) || 0 });
  } catch (err) {
    return res.status(502).json({ error: "storage_error" });
  }
};
