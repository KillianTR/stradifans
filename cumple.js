/* StradiFans - birthday wall page (/cumple/). Messages come from /api/wall. */
(function () {
  const S = window.SITE, C = window.StradiChat, $ = (id) => document.getElementById(id);
  if (!$("wall")) return;
  const esc = C.esc, key = window.SF_ADMIN_KEY;
  const headers = key ? { "x-admin-key": key } : {};
  const b = S.birthday, now = new Date();
  const age = now.getFullYear() - b.year; // the age he turns this year
  $("wallTitle").textContent = `¡Feliz ${age}, Stradi!`;

  const avatars = {};
  const COLORS = ["#ea6f18", "#009bfe", "#c04cf0", "#2bd96b", "#ffd200"];
  const card = (m, i) => `
    <article class="wall-card" style="--c:${COLORS[i % COLORS.length]}; --tilt:${((i * 37) % 5) - 2}deg">
      <header>
        <img class="wall-av" data-user="${esc(m.user)}" alt="" hidden>
        <b style="color:${esc(C.nameColor({ user: m.user, color: "" }))}">${esc(m.user)}</b>
        ${key ? `<button class="wall-del" data-id="${esc(m.id)}" title="Borrar mensaje">×</button>` : ""}
      </header>
      <p>${esc(m.text)}</p>
    </article>`;

  function render(d) {
    const msgs = d.messages || [];
    $("wallPreview").hidden = !d.preview;
    $("wallClosed").hidden = d.open || d.preview;
    $("wallForm").hidden = !key;
    $("wallTotal").textContent = d.open || d.preview ? `${msgs.length} ${msgs.length === 1 ? "mensaje" : "mensajes"} del chat` : "";
    $("wall").innerHTML = d.open || d.preview
      ? (msgs.length ? msgs.map(card).join("") : `<p class="empty">Todavía no hay mensajes.</p>`)
      : "";
    // Twitch profile pictures (decapi answers with the image URL as text)
    $("wall").querySelectorAll(".wall-av[data-user]").forEach((img) => {
      const u = img.dataset.user;
      (avatars[u] = avatars[u] || fetch(`https://decapi.me/twitch/avatar/${encodeURIComponent(u)}`).then((r) => (r.ok ? r.text() : "")).catch(() => ""))
        .then((src) => { src = src.trim(); if (/^https:\/\/static-cdn\.jtvnw\.net\//.test(src)) { img.src = src; img.hidden = false; } });
    });
    if (!d.open && !d.preview) countdown(d.opensAt);
    if (d.open && msgs.length) confetti();
  }

  let timer = null;
  function countdown(at) {
    const pad = (n) => String(n).padStart(2, "0");
    const tick = () => {
      const s = Math.max(0, Math.floor((at - Date.now()) / 1000));
      $("wallCountdown").textContent = `${Math.floor(s / 86400)}d ${pad(Math.floor(s % 86400 / 3600))}h ${pad(Math.floor(s % 3600 / 60))}m ${pad(s % 60)}s`;
      if (s === 0) { clearInterval(timer); load(); }
    };
    clearInterval(timer); tick(); timer = setInterval(tick, 1000);
  }

  function load() {
    fetch("/api/wall", { headers, cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { if (d.error) throw d; render(d); })
      .catch(() => { $("wall").innerHTML = `<p class="empty">No se ha podido cargar el muro ahora mismo.</p>`; });
  }

  // Admin: add / delete messages
  $("wallForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const body = { user: $("wallUser").value, text: $("wallText").value };
    fetch("/api/wall", { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify(body) })
      .then((r) => r.json())
      .then((d) => {
        if (!d.ok) { $("wallAdminNote").textContent = d.error === "forbidden" ? "Clave de administrador no válida." : "No se ha podido añadir."; return; }
        $("wallUser").value = ""; $("wallText").value = ""; $("wallAdminNote").textContent = "Añadido.";
        load();
      });
  });
  $("wall").addEventListener("click", (e) => {
    const b = e.target.closest(".wall-del");
    if (!b || !confirm("¿Borrar este mensaje del muro?")) return;
    fetch("/api/wall", { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ remove: b.dataset.id }) }).then(load);
  });

  // Confetti in the brand colours, once
  let fired = false;
  function confetti() {
    if (fired || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    fired = true;
    const cv = $("wallConfetti"), ctx = cv.getContext("2d");
    cv.width = innerWidth; cv.height = innerHeight;
    const bits = Array.from({ length: 160 }, () => ({
      x: Math.random() * cv.width, y: -20 - Math.random() * cv.height * 0.6, s: 6 + Math.random() * 6,
      vy: 2 + Math.random() * 3, vx: -1 + Math.random() * 2, r: Math.random() * 6, vr: -0.2 + Math.random() * 0.4, c: COLORS[Math.floor(Math.random() * COLORS.length)]
    }));
    const end = performance.now() + 5000;
    (function frame(t) {
      ctx.clearRect(0, 0, cv.width, cv.height);
      bits.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore();
      });
      if (t < end) requestAnimationFrame(frame); else ctx.clearRect(0, 0, cv.width, cv.height);
    })(performance.now());
  }

  load();
})();
