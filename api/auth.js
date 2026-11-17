/* StradiFans - "Log in with Twitch" (OAuth authorization code flow).
   /auth/login    -> sends you to Twitch
   /auth/callback -> Twitch sends you back here; we read who you are and set a signed session cookie
   /api/auth?action=me     -> { user } or { user: null }
   /api/auth?action=logout -> clears the session
   Needs TWITCH_CLIENT_ID / TWITCH_CLIENT_SECRET, and the redirect URL https://<site>/auth/callback
   added to the app in the Twitch developer console. No scopes are requested: only the public profile. */
const crypto = require("crypto");
const session = require("./_session");

function origin(req) {
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = req.headers["x-forwarded-proto"] || "https";
  return `${proto}://${host}`;
}
function back(path) { return /^\/[a-z0-9\-\/]*$/i.test(path || "") ? path : "/"; }

module.exports = async (req, res) => {
  const clientId = process.env.TWITCH_CLIENT_ID, clientSecret = process.env.TWITCH_CLIENT_SECRET;
  res.setHeader("Cache-Control", "no-store");
  const action = (req.query && req.query.action) || "me";
  if (!clientId || !clientSecret) return res.status(503).json({ error: "not_configured" });
  const redirectUri = origin(req) + "/auth/callback";

  if (action === "me") return res.status(200).json({ user: session.read(req) });

  if (action === "logout") {
    res.setHeader("Set-Cookie", session.clear());
    if (req.method === "GET") { res.statusCode = 302; res.setHeader("Location", back(req.query.next)); return res.end(); }
    return res.status(200).json({ ok: true });
  }

  if (action === "login") {
    const state = crypto.randomBytes(16).toString("hex");
    const next = back(req.query.next);
    res.setHeader("Set-Cookie", `sf_oauth=${state}.${encodeURIComponent(next)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
    const url = new URL("https://id.twitch.tv/oauth2/authorize");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "");
    url.searchParams.set("state", state);
    res.statusCode = 302; res.setHeader("Location", url.toString()); return res.end();
  }

  if (action === "callback") {
    const cookie = /(?:^|;\s*)sf_oauth=([^;]+)/.exec(req.headers.cookie || "");
    const [state, nextEnc] = cookie ? cookie[1].split(".") : [];
    const next = back(decodeURIComponent(nextEnc || "%2F"));
    const fail = (why) => { res.statusCode = 302; res.setHeader("Location", next + "?login=" + why); return res.end(); };
    if (!state || req.query.state !== state || !req.query.code) return fail("error");
    try {
      const tok = await fetch("https://id.twitch.tv/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, code: req.query.code, grant_type: "authorization_code", redirect_uri: redirectUri })
      }).then((r) => r.json());
      if (!tok.access_token) return fail("error");
      const me = await fetch("https://api.twitch.tv/helix/users", { headers: { "Client-Id": clientId, Authorization: "Bearer " + tok.access_token } }).then((r) => r.json());
      const u = me.data && me.data[0];
      // We only needed the token to know who you are: revoke it straight away
      fetch("https://id.twitch.tv/oauth2/revoke", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: clientId, token: tok.access_token }) }).catch(() => {});
      if (!u) return fail("error");
      res.setHeader("Set-Cookie", [
        session.create({ id: u.id, login: u.login, name: u.display_name, img: u.profile_image_url }),
        "sf_oauth=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0"
      ]);
      res.statusCode = 302; res.setHeader("Location", next); return res.end();
    } catch (err) {
      return fail("error");
    }
  }
  return res.status(400).json({ error: "bad_action" });
};
