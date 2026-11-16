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
    { href: "/setup/", label: "Setup" },
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

  // Lore: once you scroll into it, the live chat rolls down over the navbar like a blind
  const lorePin = document.querySelector(".lore-pin");
  if (lorePin && header !== null) {
    const bar = document.createElement("div");
    bar.className = "ticker ticker-blind";
    bar.setAttribute("aria-hidden", "true");
    bar.innerHTML = `<span class="ticker-label"><span class="ticker-dot"></span><span class="ticker-label-text">Chat offline</span></span>
      <div class="ticker-viewport"><div class="ticker-track"></div></div>`;
    document.body.appendChild(bar);
    let down = false, raf = 0;
    const check = () => {
      raf = 0;
      const top = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--topbar-h")) || 60;
      const r = lorePin.getBoundingClientRect();
      const inLore = r.top <= top + 1 && r.bottom > top + 40 && window.scrollY > 40;
      if (inLore !== down) { down = inLore; bar.classList.toggle("down", down); }
    };
    window.addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(check); }, { passive: true });
    window.addEventListener("resize", check);
    check();
  }

  // Keep the header height in a CSS variable, so the home chat ticker can cover the navbar exactly when it sticks
  const topbar = document.querySelector(".topbar");
  const setTopbarH = () => topbar && document.documentElement.style.setProperty("--topbar-h", topbar.offsetHeight + "px");
  setTopbarH();
  if (topbar && "ResizeObserver" in window) new ResizeObserver(setTopbarH).observe(topbar);
  else window.addEventListener("resize", setTopbarH);

  /* ---------- Footer ---------- */
  const footer = $("site-footer");
  if (footer) {
    const handle = S.authorX ? "@" + S.authorX.replace(/^.*\//, "") : S.author;
    const authorHref = S.authorX ? (S.authorX.startsWith("http") ? S.authorX : "https://x.com/" + S.authorX) : S.authorUrl;
    const authorLink = authorHref ? `<a class="foot-author" href="${authorHref}" target="_blank" rel="noopener" title="Abrir ${handle} en X"><svg class="foot-x" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.9 1.2h3.7l-8 9.2 9.4 12.4h-7.4l-5.8-7.6-6.6 7.6H.5l8.6-9.8L0 1.2h7.6l5.2 6.9zm-1.3 19.4h2L6.5 3.2H4.3z"/></svg>${handle}</a>` : `<b>${handle}</b>`;
    // Giant wordmark in a racing type: letters drive in from the left as you reach the end of the page
    const giant = "STRADIFANS".split("").map((ch, i) =>
      `<span class="foot-letter${i >= 6 ? " fans" : ""}" style="--i:${i}"><span>${ch}</span></span>`).join("");
    // Pixel fade between the page and the footer: denser at the bottom
    const cols = 48, rows = 4;
    let px = "";
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      if (Math.random() < (r + 1) / (rows + 1)) px += `<i style="grid-area:${r + 1}/${c + 1}"></i>`;
    }
    footer.outerHTML = `
      <footer class="footer">
        <div class="foot-pixels" aria-hidden="true">${px}</div>
        <div class="foot-body">
          <div class="foot-inner">
            <div class="foot-about">
              <a href="/" class="logo foot-logo"><img src="/assets/logo.png" alt="" class="logo-img"><span>Stradi<b>Fans</b></span></a>
              <p>Web fan no oficial. No la gestiona Stradi. Hecha con cariño por ${authorLink}.</p>
            </div>
            <div class="foot-legal">
              <p>© ${new Date().getFullYear()} · No afiliada a Twitch, iRacing ni Le Mans Ultimate.</p>
              <p class="foot-ai">Algunas animaciones y herramientas de la web se han hecho con ayuda de IA. Todo lo creativo lo he hecho yo.</p>
              <p class="foot-ver mono">v${S.version}</p>
            </div>
          </div>
          <p class="foot-giant" aria-hidden="true">${giant}</p>
        </div>
      </footer>`;
    const g = document.querySelector(".foot-giant");
    const letters = g ? [...g.querySelectorAll(".foot-letter > span")] : [];
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let ticking = false;
    const drive = () => {
      ticking = false;
      const r = g.getBoundingClientRect(), vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh - r.top) / r.height)); // 0 = just appearing, 1 = fully in view
      letters.forEach((l, i) => {
        const k = still ? 1 : Math.min(1, Math.max(0, p * 1.6 - (letters.length - 1 - i) * 0.06));
        const e = 1 - Math.pow(1 - k, 3);
        l.style.transform = `translateX(${(1 - e) * -(140 + i * 35)}%)`;
        l.style.opacity = String(Math.min(1, e * 1.4));
        l.style.filter = e < 1 ? `blur(${(1 - e) * 6}px)` : "";
      });
    };
    if (g) {
      window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(drive); } }, { passive: true });
      window.addEventListener("resize", drive);
      drive();
    }
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
        bday.innerHTML = `<svg class="px-ico bday-cake" width="22" height="22" viewBox="0 0 16 16" fill="currentColor" shape-rendering="crispEdges" aria-hidden="true"><path d="M7 1h1v1h-1zM6 2h2v1h-2zM7 3h1v1h-1zM3 4h1v1h-1zM7 4h1v1h-1zM11 4h1v1h-1zM3 5h1v1h-1zM7 5h1v1h-1zM11 5h1v1h-1zM1 6h13v1h-13zM1 7h1v1h-1zM13 7h1v1h-1zM1 8h2v1h-2zM4 8h2v1h-2zM7 8h2v1h-2zM10 8h2v1h-2zM13 8h1v1h-1zM1 9h1v1h-1zM3 9h1v1h-1zM6 9h1v1h-1zM9 9h1v1h-1zM12 9h2v1h-2zM1 10h1v1h-1zM13 10h1v1h-1zM1 11h13v1h-13zM0 12h1v1h-1zM14 12h1v1h-1zM0 13h15v1h-15z"/></svg><span>¡Feliz cumpleaños, Stradi!</span><span class="bday-age">${age}</span><span>años · todo el paddock está contigo</span>`;
      } else if (ms <= 30 * 86400000) {
        bday.hidden = false;
        bday.innerHTML =
          `<svg class="px-ico bday-cake" width="22" height="22" viewBox="0 0 16 16" fill="currentColor" shape-rendering="crispEdges" aria-hidden="true"><path d="M7 1h1v1h-1zM6 2h2v1h-2zM7 3h1v1h-1zM3 4h1v1h-1zM7 4h1v1h-1zM11 4h1v1h-1zM3 5h1v1h-1zM7 5h1v1h-1zM11 5h1v1h-1zM1 6h13v1h-13zM1 7h1v1h-1zM13 7h1v1h-1zM1 8h2v1h-2zM4 8h2v1h-2zM7 8h2v1h-2zM10 8h2v1h-2zM13 8h1v1h-1zM1 9h1v1h-1zM3 9h1v1h-1zM6 9h1v1h-1zM9 9h1v1h-1zM12 9h2v1h-2zM1 10h1v1h-1zM13 10h1v1h-1zM1 11h13v1h-13zM0 12h1v1h-1zM14 12h1v1h-1zM0 13h15v1h-15z"/></svg>` +
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
