/* StradiFans - page logic. Each block only runs if its elements exist on the current page.
   Content comes from data.js (window.SITE). */
(function () {
  const S = window.SITE;
  const $ = (id) => document.getElementById(id);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const esc = window.StradiChat.esc;

  /* ---------- Home: hero answer + uptime ---------- */
  if ($("answer")) {
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
      if (answer.dataset.captioned !== String(st.live)) {
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
      if (!wrap || !wrap.hidden) return;
      const host = location.hostname || "localhost";
      $("player").innerHTML =
        `<iframe src="https://player.twitch.tv/?channel=${encodeURIComponent(S.twitchUser)}&parent=${encodeURIComponent(host)}&muted=true" allowfullscreen></iframe>`;
      wrap.hidden = false;
    }
  }

  /* ---------- Home: live chat panel ---------- */
  if ($("chatFeed") && !document.body.dataset.ownChat) {
    const feed = $("chatFeed");
    window.StradiChat.loadSevenTv(S.twitchId).finally(() => {
      window.StradiChat.connect(S.twitchUser, {
        onStatus: (s) => {
          $("chatStatus").textContent = { connecting: "conectando...", connected: "conectado", disconnected: "reconectando..." }[s] || s;
          $("chatStatus").classList.toggle("ok", s === "connected");
        },
        onMessage: (m) => {
          if (window.StradiMeter) window.StradiMeter.add(m);
          const empty = feed.querySelector(".chat-empty");
          if (empty) empty.remove();
          const row = document.createElement("div");
          row.className = "chat-msg";
          const sub = m.badges.includes("subscriber") || m.badges.includes("founder");
          const mod = m.badges.includes("moderator") || m.badges.includes("broadcaster");
          row.innerHTML = (mod ? `<span class="chat-badge mod">MOD</span>` : sub ? `<span class="chat-badge sub">SUB</span>` : "") +
            `<b style="color:${esc(m.color || "#ea6f18")}">${esc(m.user)}</b>: <span>${m.html}</span>`;
          feed.appendChild(row);
          while (feed.children.length > 40) feed.firstChild.remove();
          feed.scrollTop = feed.scrollHeight;
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

  /* ---------- Radio: soundboard ---------- */
  if ($("soundList")) {
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
  }

  /* ---------- Lore: timeline ---------- */
  if ($("timeline")) {
    $("timeline").innerHTML = S.timeline.map((t) => `
      <li>
        <time>${esc(t.date)}</time>
        <h3>${esc(t.title)}</h3>
        <p>${esc(t.text)}</p>
      </li>`).join("");
  }

  /* ---------- Baúl: vault ---------- */
  if ($("vaultGrid")) {
    $("vaultCount").textContent = S.vault.length;
    $("vaultGrid").innerHTML = S.vault.length
      ? S.vault.map((v) => `
        <figure>
          <img src="${esc(v.image)}" alt="${esc(v.title)}" loading="lazy">
          <figcaption>${esc(v.title)}</figcaption>
        </figure>`).join("")
      : `<p class="empty">El baúl está vacío. Mandad memes.</p>`;
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
