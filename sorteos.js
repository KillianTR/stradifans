/* StradiFans - draw tool for Stradi (/sorteos/).
   Only shown to Stradi's Twitch account (or the site admin). The CSV is read in the browser and never
   leaves it: nothing is uploaded or stored. Winners are picked with crypto.getRandomValues. */
(function () {
  const S = window.SITE, $ = (id) => document.getElementById(id);
  if (!$("draw")) return;
  const esc = window.StradiChat.esc;
  const STRADI_ID = String(S.twitchId);

  let entries = [];   // one item per entry (repeated names = extra entries)
  let winners = [];
  const files = [];

  (window.sfUserReady || Promise.resolve(null)).then((u) => {
    const allowed = (u && String(u.id) === STRADI_ID) || !!window.SF_ADMIN_KEY;
    if (allowed) { $("drawLocked").hidden = true; $("draw").hidden = false; return; }
    $("drawLockedText").textContent = u
      ? `Esta sección es solo para Stradi. Has entrado como ${u.name}.`
      : "Esta sección es solo para Stradi. Entra con su cuenta de Twitch.";
    $("drawLogin").hidden = !!u;
  });

  // Prizes: the event's giveaways plus "otro"
  const ev = S.event || {};
  const prizeList = [...(ev.prizes || []).map((p) => `${p.at}: ${p.prize}`), ...(ev.extras || []).map((x) => `${x.every}: ${x.text.split(".")[0]}`)];
  $("drawPrize").innerHTML = prizeList.map((p) => `<option>${esc(p)}</option>`).join("") + `<option value="__other">Otro premio...</option>`;
  $("drawPrize").addEventListener("change", () => { $("drawPrizeOther").hidden = $("drawPrize").value !== "__other"; });
  const prizeName = () => ($("drawPrize").value === "__other" ? $("drawPrizeOther").value.trim() || "Premio" : $("drawPrize").value);

  /* CSV: finds the username column (Twitch exports use "Username" / "user_name"); otherwise the first column */
  function parseCSV(text) {
    const rows = [];
    let row = [], cell = "", q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c; continue; }
      if (c === '"') q = true;
      else if (c === "," || c === ";" || c === "\t") { row.push(cell); cell = ""; }
      else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cell); rows.push(row); row = []; cell = ""; }
      else cell += c;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    return rows.filter((r) => r.some((x) => x.trim()));
  }
  function namesFrom(text) {
    const rows = parseCSV(text.replace(/^﻿/, ""));
    if (!rows.length) return [];
    const head = rows[0].map((h) => h.trim().toLowerCase());
    let col = head.findIndex((h) => /^(user ?name|username|user_name|user|login|usuario|nombre|name|display ?name)$/.test(h));
    const hasHeader = col >= 0 || head.some((h) => /date|tier|fecha|tenure|streak|type/.test(h));
    if (col < 0) col = 0;
    return rows.slice(hasHeader ? 1 : 0).map((r) => (r[col] || "").trim().replace(/^@/, "")).filter(Boolean);
  }

  function rebuild() {
    const all = files.flatMap((f) => f.names);
    if ($("drawDupes").checked) entries = all.slice();
    else { const seen = new Set(); entries = all.filter((n) => { const k = n.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; }); }
    const people = new Set(all.map((n) => n.toLowerCase())).size;
    $("drawCount").textContent = `${people} participantes · ${entries.length} participaciones`;
    $("drawFiles").innerHTML = files.map((f, i) => `${esc(f.name)} (${f.names.length}) <button class="draw-x" data-i="${i}" title="Quitar">×</button>`).join(" · ");
    $("drawGo").disabled = !entries.length;
  }
  function addFiles(list) {
    [...list].forEach((file) => {
      const r = new FileReader();
      r.onload = () => { files.push({ name: file.name, names: namesFrom(String(r.result)) }); rebuild(); };
      r.readAsText(file);
    });
  }
  $("drawFile").addEventListener("change", (e) => { addFiles(e.target.files); e.target.value = ""; });
  $("drawDrop").addEventListener("dragover", (e) => { e.preventDefault(); $("drawDrop").classList.add("over"); });
  $("drawDrop").addEventListener("dragleave", () => $("drawDrop").classList.remove("over"));
  $("drawDrop").addEventListener("drop", (e) => { e.preventDefault(); $("drawDrop").classList.remove("over"); addFiles(e.dataTransfer.files); });
  $("drawFiles").addEventListener("click", (e) => { const b = e.target.closest(".draw-x"); if (b) { files.splice(Number(b.dataset.i), 1); rebuild(); } });
  $("drawDupes").addEventListener("change", rebuild);

  // Fair random index in [0, n)
  function randomIndex(n) {
    const max = Math.floor(0x100000000 / n) * n, buf = new Uint32Array(1);
    do crypto.getRandomValues(buf); while (buf[0] >= max);
    return buf[0] % n;
  }

  let rolling = false;
  $("drawGo").addEventListener("click", () => {
    if (rolling) return;
    const taken = new Set(winners.map((w) => w.name.toLowerCase()));
    const pool = $("drawNoRepeat").checked ? entries.filter((n) => !taken.has(n.toLowerCase())) : entries;
    if (!pool.length) { $("drawName").textContent = "No quedan participantes"; return; }
    const winner = pool[randomIndex(pool.length)], prize = prizeName();
    rolling = true; $("drawGo").disabled = true;
    $("drawStage").classList.add("rolling"); $("drawStage").classList.remove("won");
    $("drawPrizeLabel").textContent = prize;
    const t0 = performance.now(), dur = 3200;
    (function spin(t) {
      const k = (t - t0) / dur;
      if (k < 1) {
        $("drawName").textContent = pool[randomIndex(pool.length)];
        setTimeout(() => requestAnimationFrame(spin), 40 + k * k * 260); // slows down like a roulette
        return;
      }
      $("drawName").textContent = winner;
      $("drawStage").classList.remove("rolling"); $("drawStage").classList.add("won");
      winners.push({ name: winner, prize, at: new Date() });
      renderWinners(); confetti();
      rolling = false; $("drawGo").disabled = false;
    })(t0);
  });

  function renderWinners() {
    $("drawWinners").innerHTML = winners.length
      ? winners.map((w) => `<li><b>${esc(w.name)}</b><span>${esc(w.prize)}</span><time class="mono">${w.at.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</time></li>`).join("")
      : `<li class="empty">Todavía no hay ganadores.</li>`;
    $("drawCopy").hidden = !winners.length;
  }
  $("drawCopy").addEventListener("click", () => {
    const txt = winners.map((w) => `${w.prize} → ${w.name}`).join("\n");
    navigator.clipboard.writeText(txt).then(() => { $("drawCopy").textContent = "¡Copiado!"; setTimeout(() => { $("drawCopy").textContent = "Copiar resultados"; }, 2000); });
  });

  function confetti() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cv = $("drawConfetti"), ctx = cv.getContext("2d"), C = ["#ea6f18", "#009bfe", "#c04cf0", "#2bd96b", "#ffd200"];
    cv.width = innerWidth; cv.height = innerHeight;
    const bits = Array.from({ length: 180 }, () => ({ x: Math.random() * cv.width, y: -20 - Math.random() * cv.height * 0.5, s: 6 + Math.random() * 7,
      vy: 2.5 + Math.random() * 3, vx: -1.5 + Math.random() * 3, r: Math.random() * 6, vr: -0.2 + Math.random() * 0.4, c: C[Math.floor(Math.random() * C.length)] }));
    const end = performance.now() + 4500;
    (function frame(t) {
      ctx.clearRect(0, 0, cv.width, cv.height);
      bits.forEach((p) => { p.x += p.vx; p.y += p.vy; p.r += p.vr; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore(); });
      if (t < end) requestAnimationFrame(frame); else ctx.clearRect(0, 0, cv.width, cv.height);
    })(performance.now());
  }
})();
