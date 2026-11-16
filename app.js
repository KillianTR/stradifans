/* StradiFans - app logic. Content comes from data.js (window.SITE). */
(function () {
  const S = window.SITE;
  const $ = (id) => document.getElementById(id);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- Footer / version ---------- */
  $("footAuthor").textContent = S.author;
  $("footVersion").textContent = "v" + S.version;

  /* ---------- Mobile menu ---------- */
  $("menuBtn").addEventListener("click", () => $("nav").classList.toggle("open"));
  $("nav").addEventListener("click", (e) => { if (e.target.tagName === "A") $("nav").classList.remove("open"); });

  /* ---------- Live status ----------
     Uses the public decapi.me endpoint (no API key needed).
     Response is "X hours, Y minutes, Z seconds" when live, or "<user> is offline". */
  let uptimeSeconds = null;

  function parseUptime(txt) {
    let total = 0, found = false;
    const units = { day: 86400, hour: 3600, minute: 60, second: 1 };
    txt.replace(/(\d+)\s*(day|hour|minute|second)s?/gi, (_, n, u) => {
      total += parseInt(n, 10) * units[u.toLowerCase()];
      found = true;
    });
    return found ? total : null;
  }

  function fmt(sec) {
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
  }

  function setLive(isLive) {
    const answer = $("answer");
    answer.textContent = isLive ? "YES." : "NO.";
    answer.className = "answer " + (isLive ? "yes" : "no");
    $("caption").textContent = pick(isLive ? S.liveCaptions : S.offlineCaptions);
    $("liveBadge").classList.toggle("is-live", isLive);
    $("liveBadgeText").textContent = isLive ? "Live now on Twitch" : "Offline";
    if (!isLive) {
      $("uptime").textContent = "--:--:--";
      $("uptimeNote").textContent = "car is in the garage";
    }
    if (isLive) embedPlayer();
  }

  function setUnknown() {
    $("answer").textContent = "MAYBE.";
    $("caption").textContent = "telemetry lost. check Twitch directly.";
    $("liveBadgeText").textContent = "Twitch";
  }

  function embedPlayer() {
    const wrap = $("playerWrap");
    if (!wrap.hidden) return;
    const host = location.hostname || "localhost";
    $("player").innerHTML =
      `<iframe src="https://player.twitch.tv/?channel=${encodeURIComponent(S.twitchUser)}&parent=${encodeURIComponent(host)}&muted=true" allowfullscreen></iframe>`;
    wrap.hidden = false;
  }

  async function checkLive() {
    try {
      const res = await fetch(`https://decapi.me/twitch/uptime/${encodeURIComponent(S.twitchUser)}`, { cache: "no-store" });
      if (!res.ok) throw new Error(res.status);
      const txt = (await res.text()).trim();
      if (/offline/i.test(txt)) { uptimeSeconds = null; setLive(false); return; }
      const sec = parseUptime(txt);
      if (sec === null) throw new Error("unexpected response");
      uptimeSeconds = sec;
      $("uptimeNote").textContent = "since green flag";
      setLive(true);
    } catch (err) {
      setUnknown();
    }
  }

  setInterval(() => {
    if (uptimeSeconds !== null) { uptimeSeconds++; $("uptime").textContent = fmt(uptimeSeconds); }
  }, 1000);
  checkLive();
  setInterval(checkLive, 120000);

  /* ---------- Stats ---------- */
  $("statsHost").innerHTML = S.stats.map((s) => `
    <div class="stat">
      <span class="stat-label">${esc(s.label)}</span>
      <span class="stat-value">${esc(s.value)}</span>
      <span class="stat-note">${esc(s.note || "")}</span>
    </div>`).join("");

  /* ---------- Stradi-pedia ---------- */
  const classes = ["ALL", "PRO", "A", "B", "C", "D", "R"];
  let activeClass = "ALL";
  $("pediaFilters").innerHTML = classes.map((c) =>
    `<button class="filter${c === "ALL" ? " active" : ""}" data-c="${c}">${c === "ALL" ? "ALL" : c === "PRO" ? "PRO" : "CLASS " + c}</button>`).join("");

  function renderPedia() {
    const q = $("pediaSearch").value.toLowerCase().trim();
    const items = S.glossary.filter((g) =>
      (activeClass === "ALL" || g.rarity === activeClass) &&
      (!q || (g.term + " " + g.text).toLowerCase().includes(q)));
    $("pediaGrid").innerHTML = items.length
      ? items.map((g) => `
        <article class="entry">
          <span class="lic lic-${esc(g.rarity)}">${esc(g.rarity)}</span>
          <h3>${esc(g.term)}</h3>
          <p>${esc(g.text)}</p>
        </article>`).join("")
      : `<p class="empty">Nothing found. Black flag.</p>`;
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
      <button data-snd="${i}" ${s.file ? "" : "disabled"} aria-label="Play">&#9654;</button>
      <span>${esc(s.title)}</span>
      ${s.file ? `<a href="${esc(s.file)}" download>Download</a>` : ""}
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
    : `<p class="empty">The vault is empty. Send memes.</p>`;

  /* ---------- FAQ ---------- */
  $("faqList").innerHTML = S.faq.map((f) => `
    <details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("");

  /* ---------- Links ---------- */
  $("linkList").innerHTML = S.links.filter((l) => l.url).map((l) => `
    <a href="${esc(l.url)}" target="_blank" rel="noopener" class="${/twitch/i.test(l.name) ? "twitch" : ""}">${esc(l.name)}</a>`).join("");
})();
