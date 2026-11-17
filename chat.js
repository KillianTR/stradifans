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
    const seenIds = new Set();

    function handleLine(line, historical) {
      const m = line.match(/^@(\S+) :(\w+)!\S+ PRIVMSG #\S+ :(.*)$/);
      if (!m || !handlers.onMessage) return;
      const tags = parseTags(m[1]);
      if (tags.id) { if (seenIds.has(tags.id)) return; seenIds.add(tags.id); }
      let text = m[3];
      if (text.startsWith("\u0001ACTION ")) text = text.slice(8, -1);
      const tokens = tokenize(text, tags.emotes);
      handlers.onMessage({
        user: tags["display-name"] || m[2],
        color: tags.color || "",
        badges: (tags.badges || "").split(",").filter(Boolean).map((b) => b.split("/")[0]),
        badgeList: (tags.badges || "").split(",").filter(Boolean).map((b) => { const [set, version] = b.split("/"); return { set, version }; }),
        badgeInfo: tags["badge-info"] || "",
        action: m[3].startsWith("\u0001ACTION "),
        text,
        tokens,
        html: toHtml(tokens),
        historical
      });
    }

    /* Recent chat history (public recent-messages service), so the chat isn't empty on load */
    async function loadHistory() {
      try {
        const r = await fetch(`https://recent-messages.robotty.de/api/v2/recent-messages/${encodeURIComponent(channel.toLowerCase())}?limit=${handlers.historyLimit || 40}`);
        if (!r.ok) return;
        const d = await r.json();
        (d.messages || []).forEach((line) => handleLine(line, true));
      } catch (_) {}
    }

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
          handleLine(line, false);
        });
      };
      ws.onclose = () => {
        status("disconnected");
        setTimeout(open, retry);
        retry = Math.min(retry * 2, 30000);
      };
    }

    loadHistory().finally(open);
  }

  /* Twitch chat badges (global + channel: sub months, bits...) from our /api/badges */
  let badgeMap = null;
  const BADGE_ES = { broadcaster: "Streamer", moderator: "Moderador", vip: "VIP", subscriber: "Suscriptor", founder: "Fundador",
    partner: "Verificado", premium: "Prime Gaming", turbo: "Turbo", staff: "Staff", "sub-gifter": "Regala subs", "artist-badge": "Artista" };
  const badgesReady = fetch("/api/badges").then((r) => (r.ok ? r.json() : null)).then((d) => { badgeMap = d && d.badges; }).catch(() => {});
  function badgeHtml(m) {
    const list = m.badgeList || [];
    if (!badgeMap) { // no badge images: simple text tags
      const mod = m.badges.includes("moderator") || m.badges.includes("broadcaster");
      const sub = m.badges.includes("subscriber") || m.badges.includes("founder");
      return mod ? `<span class="chat-badge mod">MOD</span>` : sub ? `<span class="chat-badge sub">SUB</span>` : "";
    }
    const months = (/subscriber\/(\d+)/.exec(m.badgeInfo || "") || [])[1];
    return list.map((b) => {
      const info = badgeMap[`${b.set}/${b.version}`];
      if (!info) return "";
      let title = BADGE_ES[b.set] || info.title;
      if ((b.set === "subscriber" || b.set === "founder") && months) title += ` (${months} ${months === "1" ? "mes" : "meses"})`;
      return `<img class="chat-badge-img" src="${esc(info.url)}" alt="${esc(title)}" title="${esc(title)}">`;
    }).join("");
  }
  // Twitch's default name colours for people who never picked one
  const DEFAULT_COLORS = ["#FF0000", "#0000FF", "#008000", "#B22222", "#FF7F50", "#9ACD32", "#FF4500", "#2E8B57", "#DAA520", "#D2691E", "#5F9EA0", "#1E90FF", "#FF69B4", "#8A2BE2", "#00FF7F"];
  function nameColor(m) {
    let c = m.color;
    if (!/^#[0-9a-f]{6}$/i.test(c || "")) {
      let h = 0; for (const ch of m.user.toLowerCase()) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
      c = DEFAULT_COLORS[h % DEFAULT_COLORS.length];
    }
    // Like Twitch's dark mode: lighten names that would be too dark to read
    let [r, g, b] = [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
    const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    if (lum < 0.45) { const k = (0.45 - lum) / 0.45 * 0.75; [r, g, b] = [r, g, b].map((v) => Math.round(v + (255 - v) * k)); }
    return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
  }
  // One chat line, Twitch style: badges, coloured name, message (emotes as images)
  function lineHtml(m) {
    const c = esc(nameColor(m));
    return `${badgeHtml(m)}<b class="chat-name" style="color:${c}">${esc(m.user)}</b>${m.action ? " " : '<span class="chat-colon">:</span> '}<span class="chat-text"${m.action ? ` style="color:${c};font-style:italic"` : ""}>${m.html}</span>`;
  }

  window.StradiChat = { badgesReady, badgeHtml, lineHtml, nameColor, connect, loadEmotes, loadSevenTv: loadEmotes, toHtml, esc, emoteUrl: (name) => thirdParty.get(name) || null };
})();
