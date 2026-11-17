/* StradiFans - page logic. Each block only runs if its elements exist on the current page.
   Content comes from data.js (window.SITE). */
(function () {
  const S = window.SITE;
  const $ = (id) => document.getElementById(id);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const esc = window.StradiChat.esc;

  /* ---------- Home: hero answer, LED timer, stream stats ---------- */
  if ($("answer")) {
    const MON = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    const pad = (n) => String(n).padStart(2, "0");
    let timerFrom = null; // ms timestamp the LED counts from

    function setTimer() {
      if (timerFrom === null) return;
      const sec = Math.max(0, Math.floor((Date.now() - timerFrom) / 1000));
      $("ledD").textContent = pad(Math.floor(sec / 86400));
      $("ledH").textContent = pad(Math.floor((sec % 86400) / 3600));
      $("ledM").textContent = pad(Math.floor((sec % 3600) / 60));
      $("ledS").textContent = pad(sec % 60);
    }
    setInterval(setTimer, 1000);

    function renderStats(st) {
      const sessions = (st.sessions || [])
        .map((x) => ({ start: Date.parse(x.start), end: Date.parse(x.end) }))
        .filter((x) => !isNaN(x.start))
        .sort((a, b) => a.start - b.start);
      if (!sessions.length) return;

      // Longest break between streams (and the current one, if offline)
      const finished = st.live ? sessions.slice(0, -1) : sessions;
      let best = { ms: 0, from: null };
      for (let i = 1; i < sessions.length; i++) {
        const gap = sessions[i].start - sessions[i - 1].end;
        if (gap > best.ms) best = { ms: gap, from: sessions[i - 1].end };
      }
      if (!st.live && finished.length) {
        const gap = Date.now() - finished[finished.length - 1].end;
        if (gap > best.ms) best = { ms: gap, from: finished[finished.length - 1].end };
      }
      const hist = window.STREAM_DAYS;
      if (S.longestBreak) $("longestBreak").textContent = S.longestBreak;
      else if (hist) {
        // Full history since 2020 (tracker-data.js): longest run of days without a stream
        const bits = hist.days.replace(/\s/g, "");
        let bestLen = 0, bestAt = 0;
        bits.replace(/0+/g, (m, at) => { if (m.length > bestLen) { bestLen = m.length; bestAt = at; } return m; });
        const d = new Date(Date.parse(hist.from + "T00:00:00Z") + bestAt * 86400000);
        if (best.from && Math.round(best.ms / 86400000) > bestLen) {
          const b = new Date(best.from); bestLen = Math.round(best.ms / 86400000);
          $("longestBreak").textContent = `${bestLen} días (${MON[b.getMonth()]} ${b.getFullYear()})`;
        } else $("longestBreak").textContent = `${bestLen} días (${MON[d.getUTCMonth()]} ${d.getUTCFullYear()})`;
      } else if (best.from) {
        const d = new Date(best.from), days = Math.max(1, Math.round(best.ms / 86400000));
        $("longestBreak").textContent = `${days} ${days === 1 ? "día" : "días"} (${MON[d.getMonth()]} ${d.getFullYear()})`;
      }

      // Streams this month + day grid
      const now = new Date(), y = now.getFullYear(), m = now.getMonth();
      const daysInMonth = new Date(y, m + 1, 0).getDate();
      const onDays = new Set();
      let count = 0;
      sessions.forEach((x) => {
        const d = new Date(x.start);
        if (d.getFullYear() === y && d.getMonth() === m) { count++; onDays.add(d.getDate()); }
      });
      $("monthCount").textContent = count;
      $("monthDays").textContent = `${onDays.size} ${onDays.size === 1 ? "día" : "días"} con directo`;
      let html = "";
      for (let day = 1; day <= daysInMonth; day++) {
        const cls = ["day", onDays.has(day) ? "on" : "", day === now.getDate() ? "today" : "", day > now.getDate() ? "future" : ""].join(" ");
        html += `<span class="${cls}" title="${day} ${MON[m]}${onDays.has(day) ? " · directo" : ""}"></span>`;
      }
      $("dayGrid").innerHTML = html;

      if (!st.live && finished.length) timerFrom = finished[finished.length - 1].end;
    }

    window.onLiveStatus((st) => {
      const answer = $("answer");
      if (st.live === null) {
        answer.textContent = "QUIZÁ.";
        answer.className = "answer";
        $("caption").textContent = "se ha perdido la telemetría. mira Twitch directamente.";
        return;
      }
      answer.textContent = st.live ? "SÍ." : "NO.";
      answer.className = "answer " + (st.live ? "yes" : "no");
      if (answer.dataset.captioned !== String(st.live)) {
        $("caption").textContent = pick(st.live ? S.liveCaptions : S.offlineCaptions);
        answer.dataset.captioned = String(st.live);
      }

      $("ledTimer").classList.toggle("is-live", !!st.live);
      $("timerLabel").textContent = st.live ? "En directo desde hace" : "Desde el último directo";
      if (st.live) timerFrom = st.startedAt ? Date.parse(st.startedAt) : Date.now() - (st.uptime || 0) * 1000;
      if (st.sessions) renderStats(st);
      setTimer();

      if (st.live) embedPlayer();
    });

    function embedPlayer() {
      const wrap = $("playerWrap");
      if (!wrap || !wrap.hidden) return;
      const host = location.hostname || "localhost";
      $("player").innerHTML =
        `<iframe src="https://player.twitch.tv/?channel=${encodeURIComponent(S.twitchUser)}&parent=${encodeURIComponent(host)}&muted=true" allowfullscreen></iframe>`;
      wrap.hidden = false;
    }
  }

  /* ---------- Home: pixel start lights (status + reaction game) ---------- */
  if ($("gantry")) {
    const box = $("startLights"), pods = [...document.querySelectorAll("#gantry .pod")];
    const caption = $("caption"), hint = $("slHint");
    let game = null, idleCaption = caption.textContent, liveState = null;
    let best = null;
    try { best = parseInt(localStorage.getItem("sf_best_reaction") || "", 10) || null; } catch (_) {}

    const setPods = (n, cls) => pods.forEach((p, i) => { p.className = "pod" + (i < n && cls ? " " + cls : ""); });
    function idle() {
      game = null;
      box.dataset.state = liveState === true ? "live" : liveState === false ? "off" : "unknown";
      setPods(5, liveState === true ? "green" : liveState === false ? "red" : "amber");
      caption.textContent = idleCaption;
      hint.textContent = best ? `Pulsa el semáforo · tu récord: ${best} ms` : "Pulsa el semáforo y prueba tu salida";
    }
    window.onLiveStatus((st) => {
      liveState = st.live;
      idleCaption = $("caption").textContent;
      if (!game) idle();
    });

    // Ranking (best time per Twitch account)
    const fmtMs = (ms) => `${ms} ms`;
    function renderBoard(d) {
      if (!$("slList")) return;
      if (!d || d.error) { $("slList").innerHTML = `<li class="sl-empty">El ranking no está disponible ahora mismo.</li>`; return; }
      $("slList").innerHTML = d.top.length ? d.top.map((r, i) => `
        <li class="${r.mine ? "mine" : ""}"><span class="sl-pos">${i + 1}</span>${r.img ? `<img src="${esc(r.img)}" alt="">` : "<i></i>"}<span class="sl-name">${esc(r.name)}</span><b>${fmtMs(r.ms)}</b></li>`).join("")
        : `<li class="sl-empty">Nadie ha marcado tiempo todavía. ¡Estrena el ranking!</li>`;
      $("slMe").innerHTML = window.SF_USER
        ? (d.me ? `Tu mejor salida: <b>${fmtMs(d.me.ms)}</b> · puesto ${d.me.rank}` : "Pulsa el semáforo para entrar en el ranking.")
        : `<a href="/auth/login?next=/">Entra con Twitch</a> para salir en el ranking.`;
    }
    const loadBoard = () => fetch("/api/lights", { cache: "no-store" }).then((r) => r.json()).then(renderBoard).catch(() => renderBoard(null));
    (window.sfUserReady || Promise.resolve()).then(loadBoard);

    $("gantry").addEventListener("click", () => {
      if (!game) {
        // Start sequence: lights on one by one, then out after a random delay
        game = { phase: "lights", timers: [] };
        const g = game;
        if (window.SF_USER) fetch("/api/lights", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "start" }) })
          .then((r) => r.json()).then((d) => { g.token = d.token; }).catch(() => {});
        box.dataset.state = "game";
        setPods(0);
        caption.textContent = "Atento a los semáforos...";
        hint.textContent = "Pulsa en cuanto se apaguen";
        for (let i = 1; i <= 5; i++) game.timers.push(setTimeout(() => setPods(i, "red"), i * 900));
        const out = 5 * 900 + 400 + Math.random() * 2600;
        game.timers.push(setTimeout(() => { setPods(0); game.phase = "go"; game.t0 = performance.now(); caption.textContent = "¡YA!"; }, out));
        return;
      }
      if (game.phase === "lights") {
        game.timers.forEach(clearTimeout);
        game = { phase: "done" };
        setPods(5, "amber");
        caption.textContent = "¡Salida en falso! Drive-through";
        hint.textContent = "Pulsa otra vez para repetir";
        setTimeout(() => { if (game && game.phase === "done") idle(); }, 3500);
        return;
      }
      if (game.phase === "go") {
        const ms = Math.round(performance.now() - game.t0);
        const tok = game.token;
        game = { phase: "done" };
        if (window.SF_USER && tok) fetch("/api/lights", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ms, token: tok }) })
          .then((r) => r.json()).then((d) => { if (d.top) renderBoard(d); }).catch(() => {});
        const record = !best || ms < best;
        if (record) { best = ms; try { localStorage.setItem("sf_best_reaction", String(ms)); } catch (_) {} }
        setPods(5, "green");
        caption.textContent = `${ms} ms${record ? " · ¡récord!" : ""}`;
        hint.textContent = ms < 100 ? "¿Max Verstappen, eres tú?" : ms < 200 ? "Reflejos de piloto de F1" : ms < 300 ? "Salida limpia" : "Te han pasado tres paid actors";
        setTimeout(() => { if (game && game.phase === "done") idle(); }, 4000);
        return;
      }
      if (game.phase === "done") idle();
    });
  }

  /* ---------- Home: latest YouTube videos ---------- */
  if ($("ytGrid")) {
    const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    const ago = (iso) => {
      const d = new Date(iso), days = Math.floor((Date.now() - d) / 86400000);
      if (days < 1) return "hoy";
      if (days === 1) return "ayer";
      if (days < 7) return `hace ${days} días`;
      return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    };
    fetch("/api/youtube").then((r) => (r.ok ? r.json() : null)).then((d) => {
      const vids = d && d.videos ? d.videos.slice(0, 3) : [];
      if (!vids.length) return;
      $("ytGrid").innerHTML = vids.map((v, i) => `
        <a class="yt-card${i === 0 ? " yt-new" : ""}" href="${esc(v.url)}" target="_blank" rel="noopener">
          <span class="yt-thumb"><img src="${esc(v.thumb)}" alt="" loading="lazy"><span class="yt-play" aria-hidden="true"></span>${i === 0 ? `<span class="yt-badge">Nuevo</span>` : ""}</span>
          <span class="yt-title">${esc(v.title)}</span>
          <span class="yt-date">${ago(v.published)}</span>
        </a>`).join("");
      $("ytSection").hidden = false;
    }).catch(() => {});
  }

  /* ---------- Home: upcoming event ---------- */
  if ($("eventCard") && S.event) {
    const ev = S.event, start = Date.parse(ev.start), until = Date.parse(ev.until);
    if (!isNaN(until) && Date.now() <= until) {
      $("eventLabel").textContent = ev.label || "Próximo evento";
      $("eventTitle").textContent = ev.title;
      $("eventText").textContent = ev.text || "";
      $("eventWhen").textContent = ev.when || "";
      $("eventTags").innerHTML = (ev.tags || []).map((t) => `<span>${esc(t)}</span>`).join("");
      if (ev.extend || ev.prizes || ev.extras) {
        $("eventMore").innerHTML = `
          ${ev.extend ? `<div class="ev-col"><h3>Así se alarga</h3><ul class="ev-extend">${ev.extend.map((x) => `<li><span>${esc(x.what)}</span><b>${esc(x.time)}</b></li>`).join("")}</ul>
            ${ev.command ? `<p class="ev-cmd">Toda la info con <code>${esc(ev.command)}</code> en el chat de Stradi.</p>` : ""}</div>` : ""}
          ${ev.prizes ? `<div class="ev-col ev-col-wide"><h3>Sorteos para los subs</h3><ol class="ev-prizes">${ev.prizes.map((x) => `<li class="${x.big ? "big" : ""}"><b>${esc(x.at)}</b><span>${esc(x.prize)}</span></li>`).join("")}</ol>
            ${ev.prizesNote ? `<p class="ev-note">${esc(ev.prizesNote)}</p>` : ""}</div>` : ""}
          ${ev.extras ? `<div class="ev-col"><h3>Además</h3><ul class="ev-extras">${ev.extras.map((x) => `<li><b>${esc(x.every)}</b><span>${esc(x.text)}</span></li>`).join("")}</ul></div>` : ""}`;
        $("eventMore").hidden = false;
        // For Stradi: the giveaways block opens the draw tool
        (window.sfUserReady || Promise.resolve()).then(() => {
          const col = $("eventMore").querySelector(".ev-prizes");
          if (!window.SF_CAN_DRAW || !col) return;
          const box = col.parentElement;
          box.classList.add("ev-draw-link"); box.title = "Abrir la herramienta de sorteos";
          box.insertAdjacentHTML("beforeend", `<a class="ev-draw-go" href="/sorteos/">Hacer un sorteo &#8599;</a>`);
          box.addEventListener("click", (e) => { if (!e.target.closest("a")) location.href = "/sorteos/"; });
        });
      }
      const tick = () => {
        const ms = start - Date.now();
        if (isNaN(start) || ms <= 0) { $("eventCount").textContent = "¡Es hoy!"; $("eventCard").classList.add("is-now"); return; }
        const d = Math.floor(ms / 86400000), h = Math.floor((ms % 86400000) / 3600000), m = Math.floor((ms % 3600000) / 60000);
        $("eventCount").textContent = `Faltan ${d}d ${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m`;
      };
      tick(); setInterval(tick, 30000);
      $("eventCard").hidden = false;
    }
  }

  /* ---------- Live chat tickers (home strip + the bar that covers the navbar in the lore) ---------- */
  const tickerEls = [...document.querySelectorAll(".ticker")];
  if (tickerEls.length) {
    const GAP = 40;
    const tickers = tickerEls.map((el) => {
      const track = el.querySelector(".ticker-track"), viewport = el.querySelector(".ticker-viewport");
      track.innerHTML = `<span class="tick-msg tick-wait">Esperando mensajes del chat...</span>`;
      return { el, track, viewport, x: viewport.clientWidth };
    });
    let last = performance.now();
    function frame(t) {
      const dt = Math.min(0.1, (t - last) / 1000); last = t;
      tickers.forEach((k) => {
        const { track, viewport } = k;
        if (!viewport.clientWidth) return; // hidden
        const backlog = track.scrollWidth + k.x - viewport.clientWidth; // px still off-screen to the right
        const speed = 70 + Math.min(Math.max(0, backlog), 1500) * 0.12; // catch up when chat is busy (capped)
        if (track.querySelector(".tick-wait")) k.x = 44;      // placeholder stays still
        else if (track.children.length) k.x -= speed * dt;
        let first = track.firstElementChild;
        while (first && k.x + first.offsetWidth + GAP < 0) {
          k.x += first.offsetWidth + GAP;
          first.remove();
          first = track.firstElementChild;
        }
        if (!track.children.length) k.x = viewport.clientWidth;
        track.style.transform = `translateX(${k.x}px)`;
      });
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    window.onLiveStatus((st) => {
      document.querySelectorAll(".ticker-label").forEach((tl) => {
        tl.classList.toggle("is-live", !!st.live);
        tl.querySelector(".ticker-label-text").textContent = st.live ? "Chat en directo" : "Chat offline";
      });
    });

    Promise.all([window.StradiChat.loadEmotes(S.twitchId), window.StradiChat.badgesReady]).finally(() => {
      window.StradiChat.connect(S.twitchUser, {
        historyLimit: 20,
        onMessage: (m) => {
          if (window.StradiMeter) window.StradiMeter.add(m);
          const html = window.StradiChat.lineHtml(m);
          tickers.forEach((k) => {
            const wait = k.track.querySelector(".tick-wait");
            if (wait) { wait.remove(); k.x = k.viewport.clientWidth; }
            const el = document.createElement("span");
            el.className = "tick-msg";
            el.innerHTML = html;
            k.track.appendChild(el);
            while (k.track.children.length > 80) { k.x += k.track.firstElementChild.offsetWidth + GAP; k.track.firstElementChild.remove(); }
          });
        }
      });
    });
  }

  /* ---------- Home: stats ---------- */
  if ($("statsHost")) {
    $("statsHost").innerHTML = S.stats.map((s) => `
      <div class="stat">
        <span class="stat-label">${esc(s.label)}</span>
        <span class="stat-value">${esc(s.value)}</span>
        <span class="stat-note">${esc(s.note || "")}</span>
      </div>`).join("");
  }

  /* ---------- Stradipedia: entries by iRacing license, hover shows a picture ---------- */
  if ($("pediaGrid")) {
    const LICS = [
      { id: "R", name: "Rookie" }, { id: "D", name: "Clase D" }, { id: "C", name: "Clase C" },
      { id: "B", name: "Clase B" }, { id: "A", name: "Clase A" }, { id: "PRO", name: "Pro" }
    ];
    const order = LICS.map((l) => l.id);
    const lic = (id) => LICS.find((l) => l.id === id) || LICS[0];
    const clipId = (url) => { const m = String(url || "").match(/(?:\/clip\/|clips\.twitch\.tv\/)([A-Za-z0-9_-]+)/); return m ? m[1] : null; };
    const slug = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const entries = S.glossary.map((g, i) => ({ ...g, i, id: slug(g.term) }))
      .sort((a, b) => order.indexOf(a.rarity) - order.indexOf(b.rarity) || a.i - b.i);
    const sounds = S.sounds || [];
    const thumbs = {};
    let active = "", audio = null;

    $("pediaFilters").innerHTML = `<button class="pedia-lic" aria-pressed="true" data-c="">Todas</button>` +
      LICS.map((l) => {
        const n = entries.filter((g) => g.rarity === l.id).length;
        return n ? `<button class="pedia-lic lv-${l.id}" aria-pressed="false" data-c="${l.id}"><b>${l.id === "PRO" ? "P" : l.id}</b>${l.name}<span>${n}</span></button>` : "";
      }).join("");

    const render = () => {
      const q = $("pediaSearch").value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
      const items = entries.filter((g) => (!active || g.rarity === active) &&
        (!q || (g.term + " " + g.text).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").includes(q)));
      $("pediaCount").textContent = `${items.length} ${items.length === 1 ? "entrada" : "entradas"}`;
      $("pediaGrid").innerHTML = items.length
        ? items.map((g) => {
          const snd = g.sound && sounds.find((s) => s.key === g.sound && s.file);
          const peek = g.image || thumbs[clipId(g.clip)] || "";
          return `
          <article class="pedia-entry lv-${esc(g.rarity)}" id="${g.id}" data-peek="${esc(peek)}">
            <span class="pedia-mark" aria-hidden="true"></span>
            <div>
              <h2>${g.emote ? `<img class="entry-emote" src="${esc(g.emote)}" alt="">` : ""}${esc(g.term)}<span class="sr-only"> (${lic(g.rarity).name})</span></h2>
              <p>${esc(g.text)}</p>
              <div class="pedia-links">
                ${snd ? `<button class="pedia-link" data-sound="${esc(snd.file)}"><svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" shape-rendering="crispEdges" aria-hidden="true"><path d="M1 5h3v6H1zM4 4h2v8H4zM6 2h2v12H6zM10 5h1v6h-1zM12 3h1v10h-1z"/></svg>Escuchar en la Radio</button>` : ""}
                ${g.clip ? `<a class="pedia-link" href="${esc(g.clip)}" target="_blank" rel="noopener">&#9654; Ver clip</a>` : ""}
                ${g.clipAlt ? `<a class="pedia-link" href="${esc(g.clipAlt)}" target="_blank" rel="noopener">&#9654; ${esc(g.clipAltLabel || "Otra versión")}</a>` : ""}
                ${g.link ? `<a class="pedia-link" href="${esc(g.link)}" target="_blank" rel="noopener">${esc(g.linkLabel || "Ver enlace")} &#8599;</a>` : ""}
              </div>
            </div>
          </article>`;
        }).join("")
        : `<p class="empty">No hay nada. Bandera negra.</p>`;
    };
    $("pediaSearch").addEventListener("input", render);
    $("pediaFilters").addEventListener("click", (e) => {
      const b = e.target.closest(".pedia-lic");
      if (!b) return;
      active = b.dataset.c;
      $("pediaFilters").querySelectorAll(".pedia-lic").forEach((f) => f.setAttribute("aria-pressed", String(f === b)));
      render();
    });
    $("pediaGrid").addEventListener("click", (e) => {
      const b = e.target.closest("[data-sound]");
      if (!b) return;
      if (audio) { audio.pause(); audio = null; }
      if (b.classList.contains("playing")) { b.classList.remove("playing"); return; }
      document.querySelectorAll(".pedia-link.playing").forEach((x) => x.classList.remove("playing"));
      audio = new Audio(b.dataset.sound);
      b.classList.add("playing");
      audio.addEventListener("ended", () => b.classList.remove("playing"));
      audio.play().catch(() => b.classList.remove("playing"));
    });

    // Hover peek: the picture follows the mouse (desktop only)
    const peek = $("pediaPeek");
    if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
      let cur = null;
      $("pediaGrid").addEventListener("mousemove", (e) => {
        const it = e.target.closest(".pedia-entry");
        const src = it && it.dataset.peek;
        if (!src) { peek.hidden = true; cur = null; return; }
        if (cur !== it) { cur = it; peek.src = src; peek.style.setProperty("--tilt", (((it.id.length * 7) % 7) - 3) + "deg"); }
        peek.hidden = false;
        const w = peek.offsetWidth || 280, h = peek.offsetHeight || 170;
        const x = e.clientX + 24 + w > window.innerWidth ? e.clientX - w - 24 : e.clientX + 24;
        const y = Math.min(window.innerHeight - h - 12, Math.max(12, e.clientY - h / 2));
        peek.style.transform = `translate(${x}px, ${y}px) rotate(var(--tilt))`;
      });
      $("pediaGrid").addEventListener("mouseleave", () => { peek.hidden = true; cur = null; });
    }

    render();
    // Clip thumbnails for the hover pictures
    const ids = [...new Set(entries.map((g) => clipId(g.clip)).filter(Boolean))];
    if (ids.length) {
      fetch("/api/clips?extra=" + encodeURIComponent(ids.join(",")))
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (!d || !d.clips) return;
          d.clips.forEach((c) => { if (c.thumb) thumbs[c.id] = c.thumb; });
          document.querySelectorAll(".pedia-entry").forEach((el) => {
            const g = entries.find((x) => x.id === el.id);
            if (g && !el.dataset.peek && thumbs[clipId(g.clip)]) el.dataset.peek = thumbs[clipId(g.clip)];
          });
        })
        .catch(() => {});
    }
  }

  /* ---------- Stradipedia: emotes gallery ---------- */
  if ($("emoteGrid")) {
    $("emoteGrid").innerHTML = (S.emotes || []).map((e, i) => `
      <figure class="emote-card">
        <img src="${esc(e.image)}" alt="${esc(e.name || "Emote")}" loading="lazy">
        <figcaption>${e.name ? esc(e.name) : "#" + (i + 1)}</figcaption>
      </figure>`).join("");
  }

  /* ---------- Garaje: tracker preview = the last 26 weeks of the history ---------- */
  if ($("pvTrk") && window.STREAM_DAYS) {
    const H = window.STREAM_DAYS, bits = H.days.replace(/\s/g, "");
    // Start on a Monday so every row is a weekday
    const fromDow = (new Date(H.from + "T00:00:00Z").getUTCDay() + 6) % 7;
    let start = Math.max(0, bits.length - 26 * 7);
    start -= (fromDow + start) % 7;
    const tail = bits.slice(Math.max(0, start));
    let cells = "";
    for (let i = 0; i < tail.length; i++) cells += `<i class="${tail[i] === "1" ? "on" : ""}"></i>`;
    $("pvTrk").innerHTML = cells;
    let gap = 0, best = 0;
    for (const c of bits) { gap = c === "0" ? gap + 1 : 0; best = Math.max(best, gap); }
    $("pvTrkNote").textContent = `\u2191 Parada más larga: ${best} días`;
  }

  /* ---------- Garaje: roulette preview = a random clip thumbnail ---------- */
  if ($("pvClip")) {
    fetch("/api/clips?extra=" + encodeURIComponent((S.rouletteClips || []).join(",")))
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const list = d && d.clips && d.clips.filter((c) => c.thumb);
        if (!list || !list.length) return;
        const c = list[Math.floor(Math.random() * list.length)];
        $("pvClip").style.backgroundImage = `url("${c.thumb.replace(/"/g, "")}")`;
        $("pvClip").title = c.title || "";
        if (c.duration) {
          const s = Math.round(c.duration);
          $("pvClipDur").textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
        }
      })
      .catch(() => {});
  }

  /* ---------- Garaje: excuse generator ---------- */
  if ($("excuseBtn")) {
    let last = "";
    $("excuseBtn").addEventListener("click", () => {
      let e;
      do { e = pick(S.excuses); } while (e === last && S.excuses.length > 1);
      last = e;
      $("excuseOut").textContent = "“" + e + "”";
    });
  }

  /* ---------- Garaje: incident counter, shared by everyone (today's stream); local fallback ---------- */
  if ($("incOut")) {
    let inc = 0, shared = false, pending = 0, day = null;
    const show = () => { $("incOut").textContent = inc + "x"; };
    const local = () => {
      shared = false;
      try { inc = parseInt(localStorage.getItem("sf_incidents") || "0", 10) || 0; } catch (_) {}
      $("incReset").hidden = !window.SF_ADMIN_KEY;
      $("incNote").textContent = "Se guarda en tu navegador";
      show();
    };
    const sync = () => fetch("/api/incidents", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => {
        if (!shared) { shared = true; $("incReset").hidden = !window.SF_ADMIN_KEY; }
        // Within the same day the count only goes up, so a slightly older cached answer never moves it back
        if (!pending) { inc = d.day === day ? Math.max(inc, d.count) : d.count; day = d.day; show(); }
        $("incNote").textContent = "Contador compartido con todo el chat · se reinicia cada día";
      })
      .catch(() => { if (!shared) local(); });
    document.querySelectorAll("[data-inc]").forEach((b) =>
      b.addEventListener("click", () => {
        const add = parseInt(b.dataset.inc, 10);
        inc += add; show();
        if (!shared) { try { localStorage.setItem("sf_incidents", String(inc)); } catch (_) {} return; }
        pending++;
        fetch("/api/incidents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ add }) })
          .then((r) => r.json())
          .then((d) => { if (typeof d.count === "number") { inc = Math.max(inc, d.count); day = d.day || day; show(); }
            if (d.error === "slow_down") $("incNote").textContent = "Frena un poco, que vas a dar bandera negra";
          })
          .catch(() => {})
          .finally(() => { pending--; });
      }));
    $("incReset").addEventListener("click", () => {
      if (!window.SF_ADMIN_KEY) return;
      if (!shared) { inc = 0; show(); try { localStorage.setItem("sf_incidents", "0"); } catch (_) {} return; }
      if (!confirm("¿Poner a 0 el contador de incidentes de hoy para todos?")) return;
      fetch("/api/incidents", { method: "POST", headers: { "Content-Type": "application/json", "x-admin-key": window.SF_ADMIN_KEY }, body: JSON.stringify({ reset: true }) })
        .then((r) => r.json()).then((d) => { if (typeof d.count === "number") { inc = d.count; show(); } else alert("No tienes permiso para reiniciarlo."); })
        .catch(() => {});
    });
    $("incReset").hidden = true;
    sync();
    setInterval(() => { if (shared && !document.hidden) sync(); }, 5000);
  }

  /* ---------- Radio: soundboard (speech-bubble pads) ---------- */
  if ($("soundList")) {
    const sounds = S.sounds.filter((x) => x.file);
    const portrait = $("sbPortrait");
    let current = null, currentBtn = null;

    $("soundList").innerHTML = sounds.length
      ? sounds.map((x, i) => `
        <div class="sb-pad" style="--tilt:${((i * 53) % 5) - 2}deg">
          <button class="sb-bubble" data-snd="${i}" ${x.key ? `aria-keyshortcuts="${esc(x.key)}"` : ""}>
            ${x.key ? `<kbd>${esc(x.key)}</kbd>` : ""}<span>${esc(x.title)}</span>
          </button>
          <a class="sb-dl" href="${esc(x.file)}" download="${esc(x.title)}.mp3" title="Descargar ${esc(x.title)}.mp3" aria-label="Descargar ${esc(x.title)}">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" shape-rendering="crispEdges" aria-hidden="true"><path d="M7 1h2v8H7zM4 6h2v2H4zM10 6h2v2h-2zM6 8h4v2H6zM2 13h12v2H2z"/></svg>
          </a>
        </div>`).join("")
      : `<p class="empty">La radio está en boxes. Muy pronto: "Verstappen guarro" y "Keny, estás despedido".</p>`;

    function stop() {
      if (current) { current.pause(); current = null; }
      if (currentBtn) currentBtn.classList.remove("playing");
      portrait.classList.remove("talking");
      currentBtn = null;
    }
    function play(i) {
      const btn = document.querySelector(`[data-snd="${i}"]`);
      if (!btn) return;
      const same = currentBtn === btn;
      stop();
      if (same) return; // click again = stop
      current = new Audio(sounds[i].file);
      currentBtn = btn;
      btn.classList.add("playing");
      portrait.classList.add("talking");
      current.addEventListener("ended", stop);
      current.play().catch(stop);
    }
    $("soundList").addEventListener("click", (e) => {
      const b = e.target.closest("[data-snd]");
      if (b) play(Number(b.dataset.snd));
    });
    document.addEventListener("keydown", (e) => {
      if (e.target.matches("input, textarea") || e.ctrlKey || e.metaKey || e.altKey) return;
      const i = sounds.findIndex((x) => x.key && x.key.toLowerCase() === e.key.toLowerCase());
      if (i >= 0) play(i);
    });
  }

  /* ---------- Lore: horizontal timeline with polaroids ---------- */
  if ($("timeline")) {
    const MON = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    const COLORS = ["#ea6f18", "#009bfe", "#c04cf0", "#2bd96b", "#ffd200"];
    const fmtDate = (d) => `${MON[d.getMonth()]} ${d.getFullYear()}`.toUpperCase();

    function render(meta) {
      const items = S.timeline.map((t, i) => {
        const c = t.clip && meta[t.clip];
        const when = c ? Date.parse(c.date) : (t.sort ? Date.parse(t.sort) : NaN);
        return { ...t, i, c, when };
      }).sort((a, b) => (isNaN(a.when) ? 1e15 : a.when) - (isNaN(b.when) ? 1e15 : b.when));

      $("timeline").innerHTML = items.map((t, n) => {
        const label = t.date || (t.c ? fmtDate(new Date(t.c.date)) : (isNaN(t.when) ? "" : fmtDate(new Date(t.when))));
        const img = t.image || (t.c && t.c.thumb);
        const href = t.clip ? `https://www.twitch.tv/stradi/clip/${encodeURIComponent(t.clip)}` : null;
        const tilt = ((n * 37) % 7) - 3; // small fixed tilt per card
        const photo = img
          ? `<${href ? `a href="${esc(href)}" target="_blank" rel="noopener"` : "div"} class="polaroid" style="--tilt:${tilt}deg">
               <img src="${esc(img)}" alt="" loading="lazy">
               <span>${href ? "&#9654; Ver clip" : ""}<em>${esc(label)}</em></span>
             </${href ? "a" : "div"}>`
          : "";
        return `
          <li class="lore-item" style="--c:${COLORS[n % COLORS.length]}; --drop:${(n % 3) * 22}px">
            <time>${esc(label)}</time>
            <h3>${esc(t.title)}</h3>
            ${t.text ? `<p>${esc(t.text)}</p>` : ""}
            ${photo}
          </li>`;
      }).join("");
    }

    render({});
    const ids = S.timeline.filter((t) => t.clip).map((t) => t.clip);
    if (ids.length) {
      fetch("/api/clips?extra=" + encodeURIComponent(ids.join(",")))
        .then((r) => r.ok ? r.json() : null)
        .then((d) => {
          if (!d || !d.clips) return;
          const meta = {};
          d.clips.forEach((c) => { meta[c.id] = c; });
          render(meta);
        })
        .catch(() => {});
    }

    /* Desktop: the section pins and vertical scrolling moves the timeline sideways (like a film strip).
       Mobile / reduced motion: plain horizontal swipe. */
    const sc = $("loreScroller"), track = $("timeline");
    const pin = sc.closest(".lore-pin"), sticky = pin && pin.querySelector(".lore-sticky");
    const canPin = () => pin && window.innerWidth > 760 && !matchMedia("(prefers-reduced-motion: reduce)").matches;
    let dist = 0, pinned = false;
    const revealPhotos = () => {
      const w = window.innerWidth;
      track.querySelectorAll(".polaroid:not(.in)").forEach((p) => {
        const r = p.getBoundingClientRect();
        if (r.left < w - 40 && r.right > 0) p.classList.add("in");
      });
    };
    const update = () => {
      if (!pinned) { revealPhotos(); return; }
      const top = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--topbar-h")) || 0;
      const prog = Math.min(1, Math.max(0, (top - pin.getBoundingClientRect().top) / (dist || 1)));
      track.style.transform = `translate3d(${-prog * dist}px,0,0)`;
      revealPhotos();
    };
    const layout = () => {
      pinned = canPin();
      sc.classList.toggle("is-pinned", pinned);
      if (!pinned) { pin && (pin.style.height = ""); track.style.transform = ""; update(); return; }
      dist = Math.max(0, track.scrollWidth - sc.clientWidth);
      pin.style.height = (sticky.offsetHeight + dist) + "px";
      update();
    };
    layout();
    new MutationObserver(() => requestAnimationFrame(layout)).observe(track, { childList: true });
    track.addEventListener("load", () => requestAnimationFrame(layout), true);
    window.addEventListener("resize", layout);
    window.addEventListener("scroll", update, { passive: true });
    sc.addEventListener("scroll", revealPhotos, { passive: true });

    // Not pinned (mobile / small screens): wheel and click-drag still move it sideways
    sc.addEventListener("wheel", (e) => {
      if (pinned) return;
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && sc.scrollWidth > sc.clientWidth) {
        const atStart = sc.scrollLeft <= 0 && e.deltaY < 0;
        const atEnd = sc.scrollLeft + sc.clientWidth >= sc.scrollWidth - 1 && e.deltaY > 0;
        if (!atStart && !atEnd) { e.preventDefault(); sc.scrollLeft += e.deltaY; }
      }
    }, { passive: false });
    let dragX = null, startLeft = 0, moved = false;
    sc.addEventListener("pointerdown", (e) => {
      if (pinned || e.pointerType !== "mouse" || e.button !== 0) return;
      dragX = e.clientX; startLeft = sc.scrollLeft; moved = false;
    });
    window.addEventListener("pointermove", (e) => {
      if (dragX === null) return;
      const dx = e.clientX - dragX;
      if (Math.abs(dx) > 4) { moved = true; sc.classList.add("is-dragging"); }
      sc.scrollLeft = startLeft - dx;
    });
    window.addEventListener("pointerup", () => { dragX = null; sc.classList.remove("is-dragging"); });
    sc.addEventListener("click", (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  }

  /* ---------- Baúl: polaroid grid + lightbox (zoom, pan, prev/next) ---------- */
  if ($("vaultGrid")) {
    const items = S.vault || [];
    const num = (i) => "#" + String(i + 1).padStart(4, "0");
    $("vaultCount").textContent = items.length;
    $("vaultGrid").innerHTML = items.length
      ? items.map((v, i) => `
        <button class="vault-card" data-i="${i}" style="--tilt:${((i * 41) % 7) - 3}deg">
          <span class="vault-img"><img src="${esc(v.image)}" alt="${esc(v.title)}" loading="lazy"></span>
          <span class="vault-meta"><span class="mono">${num(i)}</span><span>${esc(v.title)}</span></span>
        </button>`).join("")
      : `<p class="empty">El baúl está vacío. Mandad memes.</p>`;

    // Lightbox
    const lb = document.createElement("div");
    lb.className = "lightbox";
    lb.hidden = true;
    lb.innerHTML = `
      <div class="lb-top">
        <span class="lb-count mono" id="lbCount"></span>
        <div class="lb-actions">
          <button class="lb-btn" id="lbZoomOut" aria-label="Alejar">&minus;</button>
          <button class="lb-btn" id="lbZoomIn" aria-label="Acercar">+</button>
          <a class="lb-btn" id="lbDownload" download aria-label="Descargar">&#8595;</a>
          <button class="lb-btn" id="lbClose" aria-label="Cerrar">&times;</button>
        </div>
      </div>
      <button class="lb-nav lb-prev" id="lbPrev" aria-label="Anterior">&#8249;</button>
      <div class="lb-stage" id="lbStage"><img id="lbImg" alt="" draggable="false"></div>
      <button class="lb-nav lb-next" id="lbNext" aria-label="Siguiente">&#8250;</button>
      <div class="lb-caption"><b id="lbTitle"></b><span id="lbNote"></span></div>`;
    document.body.appendChild(lb);

    const img = $("lbImg"), stage = $("lbStage");
    let idx = 0, scale = 1, tx = 0, ty = 0;
    const apply = () => {
      img.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
      stage.classList.toggle("zoomed", scale > 1);
    };
    const resetZoom = () => { scale = 1; tx = 0; ty = 0; apply(); };
    const zoomTo = (s) => { scale = Math.min(5, Math.max(1, s)); if (scale === 1) { tx = 0; ty = 0; } apply(); };

    function show(i) {
      idx = (i + items.length) % items.length;
      const v = items[idx];
      img.src = v.image;
      img.alt = v.title;
      $("lbTitle").textContent = v.title;
      $("lbNote").textContent = v.note || "";
      $("lbCount").textContent = `${num(idx)} · ${idx + 1} / ${items.length}`;
      $("lbDownload").href = v.image;
      $("lbPrev").hidden = $("lbNext").hidden = items.length < 2;
      resetZoom();
    }
    function open(i) { show(i); lb.hidden = false; document.body.style.overflow = "hidden"; }
    function close() { lb.hidden = true; document.body.style.overflow = ""; }

    $("vaultGrid").addEventListener("click", (e) => { const c = e.target.closest(".vault-card"); if (c) open(Number(c.dataset.i)); });
    $("lbClose").addEventListener("click", close);
    $("lbPrev").addEventListener("click", () => show(idx - 1));
    $("lbNext").addEventListener("click", () => show(idx + 1));
    $("lbZoomIn").addEventListener("click", () => zoomTo(scale * 1.5));
    $("lbZoomOut").addEventListener("click", () => zoomTo(scale / 1.5));
    lb.addEventListener("click", (e) => { if (e.target === lb || e.target === stage) close(); });
    document.addEventListener("keydown", (e) => {
      if (lb.hidden) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") show(idx - 1);
      else if (e.key === "ArrowRight") show(idx + 1);
      else if (e.key === "+" || e.key === "=") zoomTo(scale * 1.5);
      else if (e.key === "-") zoomTo(scale / 1.5);
    });
    // Wheel zoom, double-click toggle
    stage.addEventListener("wheel", (e) => { e.preventDefault(); zoomTo(scale * (e.deltaY < 0 ? 1.15 : 1 / 1.15)); }, { passive: false });
    img.addEventListener("dblclick", () => zoomTo(scale > 1 ? 1 : 2.5));
    // Drag to pan (mouse) and swipe to change image (touch)
    let drag = null;
    img.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY, tx, ty, t: Date.now() }; img.setPointerCapture(e.pointerId); });
    img.addEventListener("pointermove", (e) => {
      if (!drag || scale === 1) return;
      tx = drag.tx + (e.clientX - drag.x); ty = drag.ty + (e.clientY - drag.y); apply();
    });
    img.addEventListener("pointerup", (e) => {
      if (drag && scale === 1) {
        const dx = e.clientX - drag.x;
        if (Math.abs(dx) > 60 && Date.now() - drag.t < 600) show(idx + (dx < 0 ? 1 : -1));
      }
      drag = null;
    });
  }

  /* ---------- Setup ---------- */
  if ($("setupList")) {
    const COLORS = ["#ea6f18", "#009bfe", "#c04cf0"];
    $("setupList").innerHTML = (S.setup || []).map((g, gi) => `
      <article class="setup-group" style="--c:${COLORS[gi % COLORS.length]}">
        <span class="rule"></span>
        <h2>${esc(g.group)}</h2>
        <dl>${g.items.map((it) => `
          <div class="setup-row">
            <dt>${esc(it.label)}</dt>
            <dd>${it.url ? `<a href="${esc(it.url)}" target="_blank" rel="noopener">${esc(it.value)} &#8599;</a>` : esc(it.value)}</dd>
          </div>`).join("")}
        </dl>
      </article>`).join("");
  }

  /* ---------- FAQ ---------- */
  if ($("faqBody")) {
    const cats = S.faqCategories || [];
    const b = S.birthday, now = new Date();
    let age = now.getFullYear() - b.year;
    if (now.getMonth() + 1 < b.month || (now.getMonth() + 1 === b.month && now.getDate() < b.day)) age--;
    const slug = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const plural = (n) => `${n} ${n === 1 ? "pregunta" : "preguntas"}`;
    const items = S.faq.map((f) => ({ ...f, a: f.a.replace("{edad}", age), id: slug(f.q) }));
    const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    let active = "", query = "";

    $("faqTotal").textContent = plural(items.length);
    $("faqChips").innerHTML = `<button class="faq-chip" aria-pressed="true" data-cat="">Todas</button>` +
      cats.map((c) => `<button class="faq-chip" style="--c:${c.color}" aria-pressed="false" data-cat="${c.id}">${esc(c.name)}<span>${items.filter((f) => f.cat === c.id).length}</span></button>`).join("");
    $("faqBody").innerHTML = cats.map((c) => {
      const list = items.filter((f) => f.cat === c.id);
      if (!list.length) return "";
      return `<section class="faq-group" id="${c.id}" data-cat="${c.id}" style="--c:${c.color}">
        <header class="faq-aside"><h2>${esc(c.name)}</h2><p class="faq-tally"><span></span><b data-tally>${plural(list.length)}</b></p></header>
        <div class="faq-items">${list.map((f) => `
          <article class="faq-item" id="${f.id}" data-text="${esc(norm(f.q + " " + f.a))}">
            <h3><a href="#${f.id}">${esc(f.q)}</a></h3>
            <p>${esc(f.a)}</p>
            ${f.link ? `<a class="faq-link" href="${esc(f.link)}">Saber más &#8599;</a>` : ""}
          </article>`).join("")}
        </div>
      </section>`;
    }).join("");

    function apply() {
      const q = norm(query.trim());
      let shown = 0;
      document.querySelectorAll(".faq-group").forEach((g) => {
        let n = 0;
        g.querySelectorAll(".faq-item").forEach((it) => {
          const ok = (!active || g.dataset.cat === active) && (!q || it.dataset.text.includes(q));
          it.hidden = !ok; if (ok) n++;
        });
        g.hidden = n === 0;
        g.querySelector("[data-tally]").textContent = plural(n);
        shown += n;
      });
      $("faqCount").textContent = plural(shown);
      $("faqEmpty").hidden = shown > 0;
    }
    $("faqChips").addEventListener("click", (e) => {
      const btn = e.target.closest(".faq-chip"); if (!btn) return;
      active = btn.dataset.cat;
      $("faqChips").querySelectorAll(".faq-chip").forEach((c) => c.setAttribute("aria-pressed", String(c === btn)));
      apply();
    });
    $("faqSearch").addEventListener("input", (e) => { query = e.target.value; apply(); });
    apply();
  }

  /* ---------- Home / Lore: vault preview (latest pictures) ---------- */
  if ($("vaultPreview")) {
    const v = S.vault || [];
    const num = (i) => "#" + String(i + 1).padStart(4, "0");
    $("vaultPrevCount").textContent = `${v.length} ${v.length === 1 ? "meme, edit o foto de Stradi" : "memes, edits y fotos de Stradi"}, y subiendo.`;
    $("vaultPreview").innerHTML = v.map((x, i) => ({ x, i })).reverse().slice(0, 5).map(({ x, i }) => `
      <a class="vault-card" href="/baul/#${i + 1}" style="--tilt:${((i * 41) % 7) - 3}deg">
        <span class="vault-img"><img src="${esc(x.image)}" alt="${esc(x.title)}" loading="lazy"></span>
        <span class="vault-meta"><span class="mono">${num(i)}</span><span>${esc(x.title)}</span></span>
      </a>`).join("") || `<p class="empty">El baúl está vacío. Mandad memes.</p>`;
  }

  /* ---------- Home / Lore: a few FAQ answers ---------- */
  if ($("faqPreview")) {
    const b = S.birthday, now = new Date();
    let age = now.getFullYear() - b.year;
    if (now.getMonth() + 1 < b.month || (now.getMonth() + 1 === b.month && now.getDate() < b.day)) age--;
    const pickQ = S.faq.filter((f) => f.cat === "personal").slice(0, 4).concat(S.faq.filter((f) => f.cat === "directos").slice(2, 4));
    $("faqPreview").innerHTML = pickQ.map((f) => `
      <details class="faq-prev-item"><summary>${esc(f.q)}</summary><p>${esc(f.a.replace("{edad}", age))}</p></details>`).join("");
    document.querySelectorAll(".home-faq .go-link").forEach((a) => { a.innerHTML = a.innerHTML.replace("${n}", S.faq.length); });
  }

  /* ---------- Perfil: iRacing licenses, numbers, recaps, trophies, Twitch ---------- */
  if ($("licCards") && S.profile) {
    const P = S.profile, fmt = (n) => Number(n).toLocaleString("es-ES");
    const b = S.birthday, now = new Date();
    let age = now.getFullYear() - b.year;
    if (now.getMonth() + 1 < b.month || (now.getMonth() + 1 === b.month && now.getDate() < b.day)) age--;
    $("profName").textContent = `${P.name} · ${P.country}`;
    $("profBio").textContent = P.bio;
    $("profLevel").textContent = age;
    $("profYears").textContent = `${now.getFullYear() - P.iracingSince} años en iRacing`;
    $("profAsOf").textContent = `Datos de su perfil de iRacing a ${P.asOf}.`;
    fetch(`https://decapi.me/twitch/avatar/${encodeURIComponent(S.twitchUser)}`)
      .then((r) => (r.ok ? r.text() : "")).then((u) => { u = u.trim(); if (/^https:\/\/static-cdn\.jtvnw\.net\//.test(u)) $("profAvatar").src = u; }).catch(() => {});

    const CLS = { A: "Clase A", B: "Clase B", C: "Clase C", D: "Clase D", R: "Rookie", P: "Pro" };
    $("licCards").innerHTML = P.licenses.map((l) => `
      <article class="lic-card lc-${l.cls}">
        <span class="lic-hole"></span>
        <h3>${esc(l.cat)}</h3>
        <b class="lic-class">${l.cls}</b>
        <p class="lic-name">${CLS[l.cls] || l.cls}</p>
        <dl>
          <div><dt>Safety</dt><dd>${esc(l.sr)}</dd></div>
          <div><dt>iRating</dt><dd>${l.ir ? fmt(l.ir) : "----"}</dd></div>
          <div><dt>ttRating</dt><dd>${l.tt ? fmt(l.tt) : "----"}</dd></div>
        </dl>
      </article>`).join("");

    const sum = (k) => P.career.reduce((a, c) => a + c[k], 0);
    const big = [["Carreras", sum("starts")], ["Victorias", sum("wins")], ["Top 5", sum("top5")], ["Poles", sum("poles")], ["Vueltas", sum("laps")], ["Vueltas líder", sum("led")]];
    $("profBig").innerHTML = big.map(([k, v]) => `<div><b>${fmt(v)}</b><span>${k}</span></div>`).join("");
    $("profTable").innerHTML = `<thead><tr><th>Categoría</th><th>Carreras</th><th>Victorias</th><th>% victorias</th><th>Top 5</th><th>Poles</th><th>Vueltas</th></tr></thead><tbody>` +
      P.career.map((c) => `<tr><td>${esc(c.cat)}</td><td>${fmt(c.starts)}</td><td>${fmt(c.wins)}</td><td>${(c.wins / c.starts * 100).toFixed(1).replace(".", ",")}%</td><td>${fmt(c.top5)}</td><td>${fmt(c.poles)}</td><td>${fmt(c.laps)}</td></tr>`).join("") + `</tbody>`;

    $("profRecaps").innerHTML = P.recaps.map((r) => r.image
      ? `<figure class="recap"><img src="${esc(r.image)}" alt="Resumen ${esc(r.title)}: ${fmt(r.starts)} carreras, ${fmt(r.wins)} victorias, ${fmt(r.top5)} top 5, ${fmt(r.laps)} vueltas" loading="lazy"><figcaption>${esc(r.title)}</figcaption></figure>`
      : `<figure class="recap"><figcaption>${esc(r.title)}: ${fmt(r.starts)} carreras, ${fmt(r.wins)} victorias</figcaption></figure>`).join("");

    $("profPalmares").innerHTML = P.palmares.map((x) => `
      <li><time class="mono">${esc(x.date)}</time><div><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></div></li>`).join("");

    const MON = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    const tw = [["Seguidores en Twitch", (S.stats.find((s) => /seguidores/i.test(s.label)) || {}).value || "—"]];
    const H = window.STREAM_DAYS;
    if (H) {
      const bits = H.days.replace(/\s/g, "");
      let gap = 0, best = 0, run = 0, streak = 0, days = 0;
      for (const c of bits) { if (c === "1") days++; gap = c === "0" ? gap + 1 : 0; best = Math.max(best, gap); run = c === "1" ? run + 1 : 0; streak = Math.max(streak, run); }
      const d0 = new Date(H.from + "T00:00:00Z");
      tw.push(["Primer directo", `${d0.getUTCDate()} ${MON[d0.getUTCMonth()]} ${d0.getUTCFullYear()}`],
        ["Días con directo", fmt(days) + "+"], ["Racha más larga", `${streak} días`], ["Parada más larga", `${best} días`]);
    }
    $("profTwitch").innerHTML = tw.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(String(v))}</dd></div>`).join("");
  }

  /* ---------- Home: reviews (one per Twitch account) ---------- */
  if ($("rvTrack")) {
    const TW = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 2 2 6v14h5v3h3l3-3h4l5-5V2zm16 12-3 3h-5l-3 3v-3H5V4h15zM16 7h2v6h-2zm-5 0h2v6h-2z"/></svg>';
    const STAR = (on) => `<svg class="rv-star${on ? " on" : ""}" viewBox="0 0 9 9" shape-rendering="crispEdges" aria-hidden="true"><path d="M4 0h1v2h-1zM3 2h3v1h-3zM0 3h9v1h-9zM1 4h7v1h-7zM2 5h5v1h-5zM2 6h2v1h-2zM5 6h2v1h-2zM1 7h2v1h-2zM6 7h2v1h-2z"/></svg>`;
    const LAUREL = (flip) => `<svg class="rv-laurel${flip ? " flip" : ""}" viewBox="0 0 6 14" shape-rendering="crispEdges" aria-hidden="true"><path d="M3 0h1v1h-1zM2 1h1v1h-1zM4 1h1v1h-1zM1 3h1v1h-1zM3 3h1v1h-1zM2 4h1v1h-1zM0 6h1v1h-1zM2 6h1v1h-1zM1 7h1v1h-1zM1 9h1v1h-1zM3 9h1v1h-1zM2 10h1v1h-1zM3 11h1v1h-1zM4 12h1v1h-1zM5 13h1v1h-1z"/></svg>`;
    let picked = 0, mine = null;
    const starsHtml = (n) => n ? `<div class="rv-stars">${LAUREL()}${[1, 2, 3, 4, 5].map((i) => STAR(i <= n)).join("")}${LAUREL(true)}</div>` : "";
    function render(d) {
      const list = d && d.reviews ? d.reviews : [];
      $("rvTrack").innerHTML = list.length ? list.map((r) => `
        <figure class="rv-card${r.mine ? " mine" : ""}">
          <span class="rv-src" title="${esc(r.source || "Twitch")}">${TW}</span>
          ${starsHtml(r.stars)}
          <blockquote>“${esc(r.text)}”</blockquote>
          <figcaption>${r.img ? `<img src="${esc(r.img)}" alt="">` : ""}<b>${esc(r.name)}</b><span>${esc(r.source || "Espectador de Twitch")}</span></figcaption>
          ${window.SF_ADMIN_KEY && !r.mine ? `<button class="rv-admin-del" data-id="${esc(r.id)}" title="Borrar reseña">×</button>` : ""}
        </figure>`).join("") : `<p class="empty">Todavía no hay reseñas. ¡Estrena tú la primera!</p>`;
      mine = list.find((r) => r.mine) || null;
      const logged = !!(d && d.me);
      $("rvLogin").hidden = logged; $("rvForm").hidden = !logged;
      if (logged && mine && !$("rvText").value) { $("rvText").value = mine.text; setStars(mine.stars); }
      $("rvSend").textContent = mine ? "Cambiar mi reseña" : "Publicar reseña";
      $("rvDel").hidden = !mine;
    }
    function setStars(n) {
      picked = n;
      $("rvStars").innerHTML = [1, 2, 3, 4, 5].map((i) => `<button type="button" role="radio" aria-checked="${i === n}" aria-label="${i} estrellas" data-s="${i}">${STAR(i <= n)}</button>`).join("");
    }
    setStars(0);
    $("rvStars").addEventListener("click", (e) => { const b = e.target.closest("[data-s]"); if (b) setStars(Number(b.dataset.s)); });
    const load = () => fetch("/api/reviews", { cache: "no-store" }).then((r) => r.json()).then(render).catch(() => {});
    const post = (body, headers = {}) => fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body) }).then((r) => r.json());
    $("rvForm").addEventListener("submit", (e) => {
      e.preventDefault();
      if (!picked) { $("rvNote").textContent = "Elige de 1 a 5 estrellas."; return; }
      post({ stars: picked, text: $("rvText").value }).then((d) => {
        $("rvNote").textContent = d.reviews ? "¡Gracias por tu reseña!" : d.error === "slow_down" ? "Has cambiado la reseña muchas veces. Prueba en un rato." : "No se ha podido publicar.";
        if (d.reviews) render(d);
      });
    });
    $("rvDel").addEventListener("click", () => { if (confirm("¿Borrar tu reseña?")) post({ remove: true }).then(() => { $("rvText").value = ""; setStars(0); load(); }); });
    $("rvTrack").addEventListener("click", (e) => {
      const b = e.target.closest(".rv-admin-del");
      if (b && confirm("¿Borrar esta reseña?")) post({ remove: b.dataset.id }, { "x-admin-key": window.SF_ADMIN_KEY }).then(load);
    });
    (window.sfUserReady || Promise.resolve()).then(load);
  }

  /* ---------- Where to find him: socials with their icons ---------- */
  if ($("linkList")) {
    const ICONS = {
      twitch: '<path d="M4 2 2 6v14h5v3h3l3-3h4l5-5V2zm16 12-3 3h-5l-3 3v-3H5V4h15zM16 7h2v6h-2zm-5 0h2v6h-2z"/>',
      youtube: '<path d="M22.5 6.4a3 3 0 0 0-2.1-2.1C18.5 3.8 12 3.8 12 3.8s-6.5 0-8.4.5A3 3 0 0 0 1.5 6.4 31 31 0 0 0 1 12a31 31 0 0 0 .5 5.6 3 3 0 0 0 2.1 2.1c1.9.5 8.4.5 8.4.5s6.5 0 8.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 23 12a31 31 0 0 0-.5-5.6zM9.8 15.5v-7l6 3.5z"/>',
      x: '<path d="M18.9 1.2h3.7l-8 9.2 9.4 12.4h-7.4l-5.8-7.6-6.6 7.6H.5l8.6-9.8L0 1.2h7.6l5.2 6.9zm-1.3 19.4h2L6.5 3.2H4.3z"/>',
      instagram: '<path d="M12 2.2c3.2 0 3.6 0 4.8.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8C2.4 3.9 4 2.4 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2zM12 0C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1 0 8.3 0 8.7 0 12s0 3.7.1 4.9c.2 4.4 2.6 6.8 7 7 1.2.1 1.6.1 4.9.1s3.7 0 4.9-.1c4.4-.2 6.8-2.6 7-7 .1-1.2.1-1.6.1-4.9s0-3.7-.1-4.9c-.2-4.4-2.6-6.8-7-7C15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.8a1.4 1.4 0 1 0 0 2.9 1.4 1.4 0 0 0 0-2.9z"/>',
      tiktok: '<path d="M12.5 0h4a5.6 5.6 0 0 0 5 5v4a9.4 9.4 0 0 1-5-1.6v8.1A7.6 7.6 0 1 1 9 8v4.1a3.5 3.5 0 1 0 3.5 3.5z"/>',
      link: '<path d="M10.6 13.4a1 1 0 0 1 0-1.4l3.5-3.5a1 1 0 1 1 1.4 1.4L12 13.4a1 1 0 0 1-1.4 0zM8.5 20a4.5 4.5 0 0 1-3.2-7.7l2.5-2.5a1 1 0 0 1 1.4 1.4l-2.5 2.5a2.5 2.5 0 0 0 3.5 3.5l2.5-2.5a1 1 0 0 1 1.4 1.4l-2.5 2.5A4.5 4.5 0 0 1 8.5 20zm7-6.4a1 1 0 0 1-.7-1.7l2.5-2.5a2.5 2.5 0 0 0-3.5-3.5l-2.5 2.5a1 1 0 0 1-1.4-1.4l2.5-2.5a4.5 4.5 0 0 1 6.4 6.4l-2.5 2.5a1 1 0 0 1-.8.2z"/>'
    };
    const iconFor = (n) => { const k = n.toLowerCase(); return ICONS[k] || (k === "x" ? ICONS.x : ICONS.link); };
    $("linkList").innerHTML = S.links.filter((l) => l.url).map((l) => `
      <a class="find-link" href="${esc(l.url)}" target="_blank" rel="noopener">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${iconFor(l.name)}</svg>
        <span>${esc(l.name)}${l.note ? `<small>${esc(l.note)}</small>` : ""}</span>
      </a>`).join("");
  }
})();
