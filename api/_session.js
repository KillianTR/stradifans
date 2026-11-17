/* StradiFans - signed session cookie for "Log in with Twitch" (helper, not an endpoint).
   The cookie holds the public Twitch profile (id, login, name, picture) signed with HMAC-SHA256,
   so it can't be faked. Key: STRADIFANS_SESSION_SECRET, or the Twitch client secret. */
const crypto = require("crypto");
const NAME = "sf_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const secret = () => process.env.STRADIFANS_SESSION_SECRET || process.env.TWITCH_CLIENT_SECRET || "";
const sign = (data) => crypto.createHmac("sha256", secret()).update(data).digest("base64url");

function create(user) {
  const data = Buffer.from(JSON.stringify({ ...user, exp: Date.now() + MAX_AGE * 1000 })).toString("base64url");
  return `${NAME}=${data}.${sign(data)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE}`;
}
function read(req) {
  if (!secret()) return null;
  const m = new RegExp(`(?:^|;\\s*)${NAME}=([^;]+)`).exec(req.headers.cookie || "");
  if (!m) return null;
  const [data, sig] = m[1].split(".");
  if (!data || !sig) return null;
  const good = sign(data);
  if (sig.length !== good.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good))) return null;
  try {
    const u = JSON.parse(Buffer.from(data, "base64url").toString());
    if (!u.exp || u.exp < Date.now()) return null;
    return { id: u.id, login: u.login, name: u.name, img: u.img };
  } catch (_) { return null; }
}
const clear = () => `${NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;

module.exports = { create, read, clear };
