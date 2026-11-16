/* StradiFans - read-only Twitch chat client (anonymous IRC over WebSocket)
   Usage: StradiChat.connect(channel, { onMessage(msg), onStatus(status) })
   msg = { user, color, text, html, tokens:[{text, emote}] , badges:[] } */
(function () {
  const SEVENTV_URL = (id) => `https://7tv.io/v3/users/twitch/${id}`;
  const SEVENTV_GLOBAL = "https://7tv.io/v3/emote-sets/global";
  const thirdParty = new Map(); // emote name -> image url

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* BetterTTV (global + channel + shared). Animated emotes come as animated webp. */
  async function loadBttv(twitchId) {
    const add = (list) => (list || []).forEach((e) => thirdParty.set(e.code, `https://cdn.betterttv.net/emote/${e.id}/2x.webp`));
    try { const r = await fetch("https://api.betterttv.net/3/cached/emotes/global"); if (r.ok) add(await r.json()); } catch (_) {}
    try {
      const r = await fetch(`https://api.betterttv.net/3/cached/users/twitch/${twitchId}`);
      if (r.ok) { const d = await r.json(); add(d.channelEmotes); add(d.sharedEmotes); }
    } catch (_) {}
  }

  /* All third-party emotes: BTTV + 7TV (7TV wins on name clashes, loaded last) */
  async function loadEmotes(twitchId) {
    await loadBttv(twitchId);
    await loadSevenTv(twitchId);
  }

  async function loadSevenTv(twitchId) {
    const add = (set) => (set && set.emotes || []).forEach((e) => {
      const host = e.data && e.data.host;
      if (host && host.url) thirdParty.set(e.name, `https:${host.url}/2x.webp`);
    });
    try { const r = await fetch(SEVENTV_GLOBAL); if (r.ok) add(await r.json()); } catch (_) {}
    try { const r = await fetch(SEVENTV_URL(twitchId)); if (r.ok) add((await r.json()).emote_set); } catch (_) {}
  }

  function parseTags(raw) {
    const tags = {};
    raw.split(";").forEach((kv) => { const i = kv.indexOf("="); tags[kv.slice(0, i)] = kv.slice(i + 1); });
    return tags;
  }

  /* Split a message into tokens, marking Twitch and 7TV emotes */
  function tokenize(text, emoteTag) {
    const native = new Map(); // start index -> {end, id}
    if (emoteTag) {
      emoteTag.split("/").forEach((part) => {
        const [id, ranges] = part.split(":");
        (ranges || "").split(",").forEach((rg) => {
          const [a, b] = rg.split("-").map(Number);
          native.set(a, { end: b, id });
        });
      });
    }
    const chars = Array.from(text); // emote positions are in code points
    const tokens = [];
    let i = 0, word = "";
    const flush = () => {
      if (!word) return;
      const url = thirdParty.get(word);
      tokens.push({ text: word, emote: url || null });
      word = "";
    };
    while (i < chars.length) {
      const n = native.get(i);
      if (n) {
        flush();
        const name = chars.slice(i, n.end + 1).join("");
        tokens.push({ text: name, emote: `https://static-cdn.jtvnw.net/emoticons/v2/${n.id}/default/dark/2.0` });
        i = n.end + 1;
        continue;
      }
      if (chars[i] === " ") { flush(); tokens.push({ text: " ", emote: null }); }
      else word += chars[i];
      i++;
    }
    flush();
    return tokens;
  }

  function toHtml(tokens) {
    return tokens.map((t) => t.emote
      ? `<img class="emote" src="${esc(t.emote)}" alt="${esc(t.text)}" title="${esc(t.text)}">`
      : esc(t.text)).join("");
  }

  function connect(channel, handlers) {
    handlers = handlers || {};
    const status = (s) => handlers.onStatus && handlers.onStatus(s);
    let ws, retry = 1000;

    function open() {
      status("connecting");
      ws = new WebSocket("wss://irc-ws.chat.twitch.tv:443");
      ws.onopen = () => {
        ws.send("CAP REQ :twitch.tv/tags twitch.tv/commands");
        ws.send("PASS SCHMOOPIIE");
        ws.send("NICK justinfan" + Math.floor(10000 + Math.random() * 80000));
        ws.send("JOIN #" + channel.toLowerCase());
        retry = 1000;
        status("connected");
      };
      ws.onmessage = (ev) => {
        ev.data.split("\r\n").forEach((line) => {
          if (!line) return;
          if (line.startsWith("PING")) { ws.send("PONG :tmi.twitch.tv"); return; }
          const m = line.match(/^@(\S+) :(\w+)!\S+ PRIVMSG #\S+ :(.*)$/);
          if (!m || !handlers.onMessage) return;
          const tags = parseTags(m[1]);
          let text = m[3];
          if (text.startsWith("\u0001ACTION ")) text = text.slice(8, -1);
          const tokens = tokenize(text, tags.emotes);
          handlers.onMessage({
            user: tags["display-name"] || m[2],
            color: tags.color || "",
            badges: (tags.badges || "").split(",").filter(Boolean).map((b) => b.split("/")[0]),
            text,
            tokens,
            html: toHtml(tokens)
          });
        });
      };
      ws.onclose = () => {
        status("disconnected");
        setTimeout(open, retry);
        retry = Math.min(retry * 2, 30000);
      };
    }

    open();
  }

  window.StradiChat = { connect, loadEmotes, loadSevenTv: loadEmotes, toHtml, esc, emoteUrl: (name) => thirdParty.get(name) || null };
})();
