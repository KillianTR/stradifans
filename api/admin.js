/* StradiFans - checks the admin key (env STRADIFANS_ADMIN_KEY) so the site owner can see the reset buttons.
   POST with header "x-admin-key". Answers { admin: true|false }. */
const crypto = require("crypto");

function same(a, b) {
  const x = Buffer.from(String(a || "")), y = Buffer.from(String(b || ""));
  return x.length === y.length && x.length > 0 && crypto.timingSafeEqual(x, y);
}
module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const key = process.env.STRADIFANS_ADMIN_KEY;
  if (!key) return res.status(503).json({ error: "not_configured" });
  if (req.method !== "POST") return res.status(405).json({ error: "post_only" });
  await new Promise((r) => setTimeout(r, 400)); // slows down guessing
  res.status(200).json({ admin: same(req.headers["x-admin-key"], key) });
};
module.exports.same = same;
