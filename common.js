/* StradiFans - shared bits for every page: footer, menu, live badge, birthday banner */
(function () {
  const S = window.SITE;
  const $ = (id) => document.getElementById(id);

  /* ---------- Footer ---------- */
  document.querySelectorAll(".foot-author").forEach((el) => (el.textContent = S.author));
  document.querySelectorAll(".foot-version").forEach((el) => (el.textContent = "v" + S.version));

  /* ---------- Mobile menu ---------- */
  const menuBtn = $("menuBtn"), nav = $("nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => nav.classList.toggle("open"));
    nav.addEventListener("click", (e) => { if (e.target.tagName === "A") nav.classList.remove("open"); });
  }

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
    let state = { live: null, uptime: null };
    try {
      const res = await fetch(`https://decapi.me/twitch/uptime/${encodeURIComponent(S.twitchUser)}`, { cache: "no-store" });
      if (!res.ok) throw new Error(res.status);
      const txt = (await res.text()).trim();
      if (/offline/i.test(txt)) state = { live: false, uptime: null };
      else {
        const sec = parseUptime(txt);
        if (sec === null) throw new Error("unexpected");
        state = { live: true, uptime: sec };
      }
    } catch (_) { /* unknown */ }

    const badge = $("liveBadge"), text = $("liveBadgeText");
    if (badge && text) {
      badge.classList.toggle("is-live", state.live === true);
      text.textContent = state.live === true ? "En directo" : state.live === false ? "Offline" : "Twitch";
    }
    listeners.forEach((fn) => fn(state));
  }
  checkLive();
  setInterval(checkLive, 120000);

  /* ---------- Birthday banner ---------- */
  const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const b = S.birthday, bday = $("bday"), bdayText = $("bdayText");
  if (b && bday && bdayText) {
    const tick = () => {
      const now = new Date();
      const isToday = now.getMonth() + 1 === b.month && now.getDate() === b.day;
      let target = new Date(now.getFullYear(), b.month - 1, b.day);
      if (!isToday && target < now) target = new Date(now.getFullYear() + 1, b.month - 1, b.day);
      const age = target.getFullYear() - b.year;
      const days = Math.ceil((target - now) / 86400000);

      if (isToday) {
        bday.hidden = false;
        bday.classList.add("is-today");
        bdayText.innerHTML = `<b>¡Feliz ${age} cumpleaños, Stradi!</b> Todo el paddock está contigo 🏁`;
      } else if (days <= 30) {
        const ms = target - now;
        const d = Math.floor(ms / 86400000), h = Math.floor((ms % 86400000) / 3600000),
              m = Math.floor((ms % 3600000) / 60000), s = Math.floor((ms % 60000) / 1000);
        bday.hidden = false;
        bdayText.innerHTML = `Stradi cumple <b>${age}</b> el ${b.day} de ${MONTHS[b.month - 1]} · faltan` +
          `<span class="mono">${d}d ${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s</span>`;
      } else {
        bday.hidden = true;
      }
    };
    tick();
    setInterval(tick, 1000);
  }
})();
