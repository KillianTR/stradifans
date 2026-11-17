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
        ${m.img ? `<img class="wall-av" src="${esc(m.img)}" alt="">` : `<img class="wall-av" data-user="${esc(m.user)}" alt="" hidden>`}
        <b style="color:${esc(C.nameColor({ user: m.user, color: "" }))}">${esc(m.user)}</b>
        ${m.mine ? `<span class="wall-you">Tu mensaje</span>` : ""}
        ${key || m.mine ? `<button class="wall-del" data-id="${esc(m.id)}" title="Borrar mensaje">×</button>` : ""}
      </header>
      <p>${esc(m.text)}</p>
    </article>`;

  function render(d) {
    const msgs = d.messages || [];
    // Your own message (logged in with Twitch)
    const canWrite = d.open || d.preview;
    $("wallMine").hidden = !canWrite;
    $("wallLogin").hidden = !!d.me;
    $("wallWrite").hidden = !d.me;
    if (d.me) {
      $("wallMeImg").src = d.me.img || ""; $("wallMeImg").hidden = !d.me.img;
      $("wallMeName").textContent = d.me.name;
      const mine = msgs.find((m) => m.mine);
      if (mine && !$("wallMyText").value) $("wallMyText").value = mine.text;
      $("wallMySend").textContent = mine ? "Cambiar mi mensaje" : "Publicar mi mensaje";
    }
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

  // Logged-in viewers: write / replace your own message
  $("wallWrite").addEventListener("submit", (e) => {
    e.preventDefault();
    $("wallMySend").disabled = true;
    fetch("/api/wall", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: $("wallMyText").value }) })
      .then((r) => r.json())
      .then((d) => {
        $("wallMyNote").textContent = d.ok ? "¡Publicado! Gracias por tu mensaje." : d.error === "slow_down" ? "Has cambiado el mensaje muchas veces. Prueba en un rato." : d.error === "login_required" ? "Tu sesión ha caducado: vuelve a entrar con Twitch." : "No se ha podido publicar.";
        if (d.ok) load();
      })
      .finally(() => { $("wallMySend").disabled = false; });
  });

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
    fetch("/api/wall", { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ remove: b.dataset.id }) })
      .then(() => { $("wallMyText").value = ""; load(); });
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
