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
      if (S.longestBreak) $("longestBreak").textContent = S.longestBreak;
      else if (best.from) {
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

      const tl = $("tickerLabel");
      if (tl) { tl.classList.toggle("is-live", !!st.live); $("tickerLabelText").textContent = st.live ? "Chat en directo" : "Chat offline"; }
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

    $("gantry").addEventListener("click", () => {
      if (!game) {
        // Start sequence: lights on one by one, then out after a random delay
        game = { phase: "lights", timers: [] };
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
        game = { phase: "done" };
        const record = !best || ms < best;
        if (record) { best = ms; try { localStorage.setItem("sf_best_reaction", String(ms)); } catch (_) {} }
        setPods(5, "green");
        caption.textContent = `${ms} ms${record ? " · ¡récord!" : ""}`;
        hint.textContent = ms < 200 ? "Reflejos de piloto de F1" : ms < 300 ? "Salida limpia" : "Te han pasado tres paid actors";
        setTimeout(() => { if (game && game.phase === "done") idle(); }, 4000);
        return;
      }
      if (game.phase === "done") idle();
    });
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

  /* ---------- Home: live chat ticker (scrolls right to left) ---------- */
  if ($("tickerTrack")) {
    const track = $("tickerTrack"), viewport = $("tickerViewport");
    const GAP = 40;
    let x = viewport.clientWidth, last = performance.now();
    const queue = [];

    track.innerHTML = `<span class="tick-msg tick-wait">Esperando mensajes del chat...</span>`;

    function frame(t) {
      const dt = Math.min(0.1, (t - last) / 1000); last = t;
      const backlog = track.scrollWidth + x - viewport.clientWidth; // px still off-screen to the right
      const speed = 70 + Math.min(Math.max(0, backlog), 1500) * 0.12; // catch up when chat is busy (capped)
      if (track.querySelector(".tick-wait")) x = 44;      // placeholder stays still
      else if (track.children.length) x -= speed * dt;
      // drop messages that have left on the left side
      let first = track.firstElementChild;
      while (first && x + first.offsetWidth + GAP < 0) {
        x += first.offsetWidth + GAP;
        first.remove();
        first = track.firstElementChild;
      }
      if (!track.children.length) x = viewport.clientWidth;
      track.style.transform = `translateX(${x}px)`;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    window.StradiChat.loadEmotes(S.twitchId).finally(() => {
      window.StradiChat.connect(S.twitchUser, {
        historyLimit: 20,
        onMessage: (m) => {
          if (window.StradiMeter) window.StradiMeter.add(m);
          const wait = track.querySelector(".tick-wait");
          if (wait) { wait.remove(); x = viewport.clientWidth; }
          const sub = m.badges.includes("subscriber") || m.badges.includes("founder");
          const mod = m.badges.includes("moderator") || m.badges.includes("broadcaster");
          const el = document.createElement("span");
          el.className = "tick-msg";
          el.innerHTML = (mod ? `<span class="chat-badge mod">MOD</span>` : sub ? `<span class="chat-badge sub">SUB</span>` : "") +
            `<b style="color:${esc(m.color || "#ea6f18")}">${esc(m.user)}</b> <span>${m.html}</span>`;
          track.appendChild(el);
          while (track.children.length > 80) { x += track.firstElementChild.offsetWidth + GAP; track.firstElementChild.remove(); }
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

  /* ---------- Stradipedia ---------- */
  if ($("pediaGrid")) {
    const classes = ["TODAS", "PRO", "A", "B", "C", "D", "R"];
    let activeClass = "TODAS";
    $("pediaFilters").innerHTML = classes.map((c) =>
      `<button class="filter${c === "TODAS" ? " active" : ""}" data-c="${c}">${c === "TODAS" || c === "PRO" ? c : "CLASE " + c}</button>`).join("");

    const render = () => {
      const q = $("pediaSearch").value.toLowerCase().trim();
      const items = S.glossary.filter((g) =>
        (activeClass === "TODAS" || g.rarity === activeClass) &&
        (!q || (g.term + " " + g.text).toLowerCase().includes(q)));
      $("pediaGrid").innerHTML = items.length
        ? items.map((g) => `
          <article class="entry">
            <span class="lic lic-${esc(g.rarity)}">${esc(g.rarity)}</span>
            <h3>${g.emote ? `<img class="entry-emote" src="${esc(g.emote)}" alt="">` : ""}${esc(g.term)}</h3>
            <p>${esc(g.text)}</p>
            ${g.clip ? `<a class="entry-clip" href="${esc(g.clip)}" target="_blank" rel="noopener">&#9654; Ver clip</a>` : ""}
            ${g.clipAlt ? `<a class="entry-clip" href="${esc(g.clipAlt)}" target="_blank" rel="noopener">&#9654; ${esc(g.clipAltLabel || "Otra versión")}</a>` : ""}
            ${g.link ? `<a class="entry-clip" href="${esc(g.link)}" target="_blank" rel="noopener">${esc(g.linkLabel || "Ver enlace")} &#8599;</a>` : ""}
          </article>`).join("")
        : `<p class="empty">No hay nada. Bandera negra.</p>`;
    };
    $("pediaSearch").addEventListener("input", render);
    $("pediaFilters").addEventListener("click", (e) => {
      const b = e.target.closest(".filter");
      if (!b) return;
      activeClass = b.dataset.c;
      document.querySelectorAll(".filter").forEach((f) => f.classList.toggle("active", f === b));
      render();
    });
    render();
  }

  /* ---------- Stradipedia: emotes gallery ---------- */
  if ($("emoteGrid")) {
    $("emoteGrid").innerHTML = (S.emotes || []).map((e, i) => `
      <figure class="emote-card">
        <img src="${esc(e.image)}" alt="${esc(e.name || "Emote")}" loading="lazy">
        <figcaption>${e.name ? esc(e.name) : "#" + (i + 1)}</figcaption>
      </figure>`).join("");
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

  /* ---------- Garaje: incident counter (remembered per browser) ---------- */
  if ($("incOut")) {
    let inc = 0;
    try { inc = parseInt(localStorage.getItem("sf_incidents") || "0", 10) || 0; } catch (_) {}
    const show = () => {
      $("incOut").textContent = inc + "x";
      try { localStorage.setItem("sf_incidents", String(inc)); } catch (_) {}
    };
    document.querySelectorAll("[data-inc]").forEach((b) =>
      b.addEventListener("click", () => { inc += parseInt(b.dataset.inc, 10); show(); }));
    $("incReset").addEventListener("click", () => { inc = 0; show(); });
    show();
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

    // Mouse wheel scrolls the timeline sideways
    const sc = $("loreScroller");
    sc.addEventListener("wheel", (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && sc.scrollWidth > sc.clientWidth) {
        const atStart = sc.scrollLeft <= 0 && e.deltaY < 0;
        const atEnd = sc.scrollLeft + sc.clientWidth >= sc.scrollWidth - 1 && e.deltaY > 0;
        if (!atStart && !atEnd) { e.preventDefault(); sc.scrollLeft += e.deltaY; }
      }
    }, { passive: false });
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
  if ($("faqList")) {
    $("faqList").innerHTML = S.faq.map((f) => `
      <details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("");
  }

  /* ---------- Links ---------- */
  if ($("linkList")) {
    $("linkList").innerHTML = S.links.filter((l) => l.url).map((l) => `
      <a href="${esc(l.url)}" target="_blank" rel="noopener" class="${/twitch/i.test(l.name) ? "twitch" : ""}">${esc(l.name)}</a>`).join("");
  }
})();
