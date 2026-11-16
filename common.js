/* StradiFans - shared layout for every page: header, menu, birthday banner, footer, live badge.
   Pages only need <div id="site-header"></div> and <div id="site-footer"></div>. */
(function () {
  const S = window.SITE;
  const $ = (id) => document.getElementById(id);

  const NAV = [
    { href: "/stradipedia/", label: "Stradipedia" },
    { href: "/garaje/", label: "Garaje" },
    { href: "/radio/", label: "Radio" },
    { href: "/lore/", label: "Lore" },
    { href: "/baul/", label: "Baúl" },
    { href: "/faq/", label: "FAQ" }
  ];
  const path = location.pathname.replace(/index\.html$/, "");
  const isActive = (href) => path === href || path.startsWith(href);

  /* ---------- Header + birthday banner ---------- */
  const header = $("site-header");
  if (header) {
    header.outerHTML = `
      <header class="topbar">
        <a href="/" class="logo"><img src="/assets/logo.png" alt="" class="logo-img"><span>Stradi<b>Fans</b></span></a>
        <nav class="nav" id="nav">
          ${NAV.map((n) => `<a href="${n.href}"${isActive(n.href) ? ' class="active"' : ""}>${n.label}</a>`).join("")}
        </nav>
        <a class="live-badge" id="liveBadge" href="https://www.twitch.tv/${S.twitchUser}" target="_blank" rel="noopener">
          <span class="dot"></span><span id="liveBadgeText">Comprobando...</span>
        </a>
        <button class="menu-btn" id="menuBtn" aria-label="Menú">&#9776;</button>
      </header>
      <div class="bday" id="bday" hidden></div>`;
  }

  /* ---------- Footer ---------- */
  const footer = $("site-footer");
  if (footer) {
    footer.outerHTML = `
      <footer class="footer">
        <p>StradiFans es una web fan no oficial. No la gestiona Stradi y no está afiliada a Twitch, iRacing ni Le Mans Ultimate.</p>
        <p>Creado por <b>${S.author}</b> · <span class="mono">v${S.version}</span></p>
      </footer>`;
  }

  /* ---------- Back-to-top keycap ---------- */
  const top = document.createElement("button");
  top.className = "keycap-top";
  top.setAttribute("aria-label", "Volver arriba");
  top.innerHTML = `<span class="keycap-face"><svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" shape-rendering="crispEdges" aria-hidden="true"><path d="M7 3h2v11H7zM5 5h2v2H5zM9 5h2v2H9zM3 7h2v2H3zM11 7h2v2h-2z"/></svg></span>`;
  top.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  document.body.appendChild(top);
  const toggleTop = () => top.classList.toggle("show", window.scrollY > 400);
  window.addEventListener("scroll", toggleTop, { passive: true });
  toggleTop();

  /* ---------- Mobile menu ---------- */
  const menuBtn = $("menuBtn"), nav = $("nav");
  if (menuBtn && nav) menuBtn.addEventListener("click", () => nav.classList.toggle("open"));

  /* ---------- Live status (public decapi.me endpoint, no API key) ---------- */
  function parseUptime(txt) {
    let total = 0, found = false;
    const units = { day: 86400, hour: 3600, minute: 60, second: 1 };
    txt.replace(/(\d+)\s*(day|hour|minute|second)s?/gi, (_, n, u) => {
      total += parseInt(n, 10) * units[u.toLowerCase()];
      found = true;
    });
    return found ? total : null;
  }

  const listeners = [];
  window.onLiveStatus = (fn) => listeners.push(fn);

  async function checkLive() {
    let state = { live: null, uptime: null, startedAt: null, sessions: null };
    // 1) Our own Twitch API endpoint (exact start time + stream history)
    try {
      const r = await fetch("/api/stream-stats", { cache: "no-store" });
      if (r.ok) {
        const d = await r.json();
        state = {
          live: d.live,
          startedAt: d.startedAt,
          uptime: d.live && d.startedAt ? Math.max(0, Math.floor((Date.now() - Date.parse(d.startedAt)) / 1000)) : null,
          sessions: d.sessions || []
        };
      }
    } catch (_) {}
    // 2) Fallback: public decapi.me endpoint (no history)
    if (state.live === null) {
      try {
        const res = await fetch(`https://decapi.me/twitch/uptime/${encodeURIComponent(S.twitchUser)}`, { cache: "no-store" });
        if (!res.ok) throw new Error(res.status);
        const txt = (await res.text()).trim();
        if (/offline/i.test(txt)) state.live = false;
        else {
          const sec = parseUptime(txt);
          if (sec === null) throw new Error("unexpected");
          state.live = true;
          state.uptime = sec;
        }
      } catch (_) { /* unknown */ }
    }

    const badge = $("liveBadge"), text = $("liveBadgeText");
    if (badge && text) {
      badge.classList.toggle("is-live", state.live === true);
      text.textContent = state.live === true ? "En directo" : state.live === false ? "Offline" : "Twitch";
    }
    window.liveState = state;
    listeners.forEach((fn) => fn(state));
  }
  setTimeout(checkLive, 0); // let page scripts register listeners first
  setInterval(checkLive, 60000);

  /* ---------- Birthday banner ---------- */
  const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const b = S.birthday, bday = $("bday");
  if (b && bday) {
    const pad = (n) => String(n).padStart(2, "0");
    const seg = (v, u) => `<span class="bday-seg"><b>${v}</b>${u}</span>`;
    const tick = () => {
      const now = new Date();
      const isToday = now.getMonth() + 1 === b.month && now.getDate() === b.day;
      let target = new Date(now.getFullYear(), b.month - 1, b.day);
      if (!isToday && target < now) target = new Date(now.getFullYear() + 1, b.month - 1, b.day);
      const age = target.getFullYear() - b.year;
      const ms = target - now;

      if (isToday) {
        bday.hidden = false;
        bday.classList.add("is-today");
        bday.innerHTML = `<span class="bday-cake">🎂</span><span>¡Feliz cumpleaños, Stradi!</span><span class="bday-age">${age}</span><span>años · todo el paddock está contigo 🏁</span>`;
      } else if (ms <= 30 * 86400000) {
        bday.hidden = false;
        bday.innerHTML =
          `<span class="bday-cake">🎂</span>` +
          `<span>Stradi cumple</span><span class="bday-age">${age}</span>` +
          `<span>años el ${b.day} de ${MONTHS[b.month - 1]}</span>` +
          `<span class="bday-timer">` +
            seg(Math.floor(ms / 86400000), "d") +
            seg(pad(Math.floor((ms % 86400000) / 3600000)), "h") +
            seg(pad(Math.floor((ms % 3600000) / 60000)), "m") +
            seg(pad(Math.floor((ms % 60000) / 1000)), "s") +
          `</span>`;
      } else {
        bday.hidden = true;
      }
    };
    tick();
    setInterval(tick, 1000);
  }
})();
