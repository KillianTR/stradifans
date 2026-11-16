/* StradiFans - home page logic. Content comes from data.js (window.SITE). */
(function () {
  const S = window.SITE;
  const $ = (id) => document.getElementById(id);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const esc = window.StradiChat.esc;

  /* ---------- Hero answer + uptime ---------- */
  let uptimeSeconds = null;
  const fmt = (sec) => [Math.floor(sec / 3600), Math.floor((sec % 3600) / 60), sec % 60]
    .map((v) => String(v).padStart(2, "0")).join(":");

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
    if (!answer.dataset.captioned || answer.dataset.captioned !== String(st.live)) {
      $("caption").textContent = pick(st.live ? S.liveCaptions : S.offlineCaptions);
      answer.dataset.captioned = String(st.live);
    }
    uptimeSeconds = st.live ? st.uptime : null;
    if (!st.live) {
      $("uptime").textContent = "--:--:--";
      $("uptimeNote").textContent = "el coche está en el garaje";
    } else {
      $("uptimeNote").textContent = "desde la bandera verde";
      embedPlayer();
    }
  });

  setInterval(() => {
    if (uptimeSeconds !== null) { uptimeSeconds++; $("uptime").textContent = fmt(uptimeSeconds); }
  }, 1000);

  function embedPlayer() {
    const wrap = $("playerWrap");
    if (!wrap.hidden) return;
    const host = location.hostname || "localhost";
    $("player").innerHTML =
      `<iframe src="https://player.twitch.tv/?channel=${encodeURIComponent(S.twitchUser)}&parent=${encodeURIComponent(host)}&muted=true" allowfullscreen></iframe>`;
    wrap.hidden = false;
  }

  /* ---------- Live chat panel + mini meter ---------- */
  const feed = $("chatFeed");
  const MAX_MSGS = 40;
  function renderMini() {
    const t = window.StradiMeter.top(3);
    $("miniMeter").innerHTML = t.length
      ? t.map((x, i) => `<div class="mini-row"><span class="mono">${i + 1}</span>${x.emote ? `<img class="emote" src="${esc(x.emote)}" alt="">` : ""}<b>${esc(x.term)}</b><span class="mono">${x.count}</span></div>`).join("")
      : "Escuchando al chat...";
  }
  let miniTimer = null;

  window.StradiChat.loadSevenTv(S.twitchId).finally(() => {
    window.StradiChat.connect(S.twitchUser, {
      onStatus: (s) => {
        $("chatStatus").textContent = { connecting: "conectando...", connected: "conectado", disconnected: "reconectando..." }[s] || s;
        $("chatStatus").classList.toggle("ok", s === "connected");
      },
      onMessage: (m) => {
        window.StradiMeter.add(m);
        const empty = feed.querySelector(".chat-empty");
        if (empty) empty.remove();
        const row = document.createElement("div");
        row.className = "chat-msg";
        const sub = m.badges.includes("subscriber") || m.badges.includes("founder");
        const mod = m.badges.includes("moderator") || m.badges.includes("broadcaster");
        row.innerHTML = (mod ? `<span class="chat-badge mod">MOD</span>` : sub ? `<span class="chat-badge sub">SUB</span>` : "") +
          `<b style="color:${esc(m.color || "#ea6f18")}">${esc(m.user)}</b>: <span>${m.html}</span>`;
        feed.appendChild(row);
        while (feed.children.length > MAX_MSGS) feed.firstChild.remove();
        feed.scrollTop = feed.scrollHeight;
        if (!miniTimer) miniTimer = setTimeout(() => { miniTimer = null; renderMini(); }, 1500);
      }
    });
  });
  renderMini();

  /* ---------- Stats ---------- */
  $("statsHost").innerHTML = S.stats.map((s) => `
    <div class="stat">
      <span class="stat-label">${esc(s.label)}</span>
      <span class="stat-value">${esc(s.value)}</span>
      <span class="stat-note">${esc(s.note || "")}</span>
    </div>`).join("");

  /* ---------- Stradipedia ---------- */
  const classes = ["TODAS", "PRO", "A", "B", "C", "D", "R"];
  let activeClass = "TODAS";
  $("pediaFilters").innerHTML = classes.map((c) =>
    `<button class="filter${c === "TODAS" ? " active" : ""}" data-c="${c}">${c === "TODAS" || c === "PRO" ? c : "CLASE " + c}</button>`).join("");

  function renderPedia() {
    const q = $("pediaSearch").value.toLowerCase().trim();
    const items = S.glossary.filter((g) =>
      (activeClass === "TODAS" || g.rarity === activeClass) &&
      (!q || (g.term + " " + g.text).toLowerCase().includes(q)));
    $("pediaGrid").innerHTML = items.length
      ? items.map((g) => `
        <article class="entry">
          <span class="lic lic-${esc(g.rarity)}">${esc(g.rarity)}</span>
          <h3>${esc(g.term)}</h3>
          <p>${esc(g.text)}</p>
        </article>`).join("")
      : `<p class="empty">No hay nada. Bandera negra.</p>`;
  }
  $("pediaSearch").addEventListener("input", renderPedia);
  $("pediaFilters").addEventListener("click", (e) => {
    const b = e.target.closest(".filter");
    if (!b) return;
    activeClass = b.dataset.c;
    document.querySelectorAll(".filter").forEach((f) => f.classList.toggle("active", f === b));
    renderPedia();
  });
  renderPedia();

  /* ---------- Excuse generator ---------- */
  let lastExcuse = "";
  $("excuseBtn").addEventListener("click", () => {
    let e;
    do { e = pick(S.excuses); } while (e === lastExcuse && S.excuses.length > 1);
    lastExcuse = e;
    $("excuseOut").textContent = "“" + e + "”";
  });

  /* ---------- Incident counter (remembered per browser) ---------- */
  let inc = 0;
  try { inc = parseInt(localStorage.getItem("sf_incidents") || "0", 10) || 0; } catch (_) {}
  const showInc = () => {
    $("incOut").textContent = inc + "x";
    try { localStorage.setItem("sf_incidents", String(inc)); } catch (_) {}
  };
  document.querySelectorAll("[data-inc]").forEach((b) =>
    b.addEventListener("click", () => { inc += parseInt(b.dataset.inc, 10); showInc(); }));
  $("incReset").addEventListener("click", () => { inc = 0; showInc(); });
  showInc();

  /* ---------- Soundboard ---------- */
  let current = null;
  $("soundList").innerHTML = S.sounds.map((s, i) => `
    <li>
      <button data-snd="${i}" ${s.file ? "" : "disabled"} aria-label="Reproducir">&#9654;</button>
      <span>${esc(s.title)}</span>
      ${s.file ? `<a href="${esc(s.file)}" download>Descargar</a>` : ""}
    </li>`).join("");
  $("soundList").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-snd]");
    if (!b) return;
    if (current) current.pause();
    current = new Audio(S.sounds[b.dataset.snd].file);
    current.play().catch(() => {});
  });

  /* ---------- Timeline ---------- */
  $("timeline").innerHTML = S.timeline.map((t) => `
    <li>
      <time>${esc(t.date)}</time>
      <h3>${esc(t.title)}</h3>
      <p>${esc(t.text)}</p>
    </li>`).join("");

  /* ---------- Vault ---------- */
  $("vaultCount").textContent = S.vault.length;
  $("vaultGrid").innerHTML = S.vault.length
    ? S.vault.map((v) => `
      <figure>
        <img src="${esc(v.image)}" alt="${esc(v.title)}" loading="lazy">
        <figcaption>${esc(v.title)}</figcaption>
      </figure>`).join("")
    : `<p class="empty">El baúl está vacío. Mandad memes.</p>`;

  /* ---------- FAQ ---------- */
  $("faqList").innerHTML = S.faq.map((f) => `
    <details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("");

  /* ---------- Links ---------- */
  $("linkList").innerHTML = S.links.filter((l) => l.url).map((l) => `
    <a href="${esc(l.url)}" target="_blank" rel="noopener" class="${/twitch/i.test(l.name) ? "twitch" : ""}">${esc(l.name)}</a>`).join("");
})();
