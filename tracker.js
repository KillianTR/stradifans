/* StradiFans - stream tracker: every stream day and every break since April 2020.
   History comes from tracker-data.js; days after it are filled in from Twitch (/api/stream-stats). */
(function () {
  const H = window.STREAM_DAYS;
  const $ = (id) => document.getElementById(id);
  if (!H || !$("trkGrid")) return;

  const MON = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const DOW = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
  const LONG = 7; // a break this long (days) counts as a long one
  const pad = (n) => String(n).padStart(2, "0");

  // Dates are handled as UTC midnights so day maths never trips over daylight saving
  const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return Date.UTC(y, m - 1, d); };
  const DAY = 86400000;
  const key = (t) => new Date(t).toISOString().slice(0, 10);
  const madridKey = (ms) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date(ms));
  const todayKey = madridKey(Date.now());
  const today = parse(todayKey);
  const first = parse(H.from), histEnd = parse(H.to);

  // day -> 1 (stream) / 0 (no stream); days after the history are added when Twitch answers
  const days = new Map();
  const bits = H.days.replace(/\s/g, "");
  for (let i = 0; i < bits.length; i++) days.set(key(first + i * DAY), bits[i] === "1" ? 1 : 0);

  let view = "12";
  let sessions = [], live = false, liveStart = null;

  function fillRecent() {
    const on = new Set(sessions.map((s) => madridKey(s.start)));
    if (live && liveStart) on.add(madridKey(liveStart));
    for (let t = histEnd + DAY; t <= today; t += DAY) {
      const k = key(t);
      if (on.has(k)) days.set(k, 1);
      else if (t < today) days.set(k, 0);
      else days.delete(k); // today without a stream yet: still to come
    }
  }

  // Breaks = runs of days without a stream between two stream days (the current one too)
  function breaks() {
    const out = [];
    let start = null;
    for (let t = first; t <= today; t += DAY) {
      const v = days.get(key(t));
      if (v === 0) { if (start === null) start = t; }
      else if (v === 1 && start !== null) { out.push({ from: start, to: t - DAY, len: Math.round((t - start) / DAY) }); start = null; }
    }
    if (start !== null) out.push({ from: start, to: today - DAY, len: Math.round((today - start) / DAY), current: true });
    return out;
  }
  const longDays = () => {
    const set = new Set();
    breaks().filter((b) => b.len >= LONG).forEach((b) => { for (let t = b.from; t <= b.to; t += DAY) set.add(key(t)); });
    return set;
  };
  function streak(from, to) {
    let best = 0, run = 0;
    for (let t = from; t <= to; t += DAY) { if (days.get(key(t)) === 1) { run++; best = Math.max(best, run); } else run = 0; }
    return best;
  }
  const fmt = (t, withYear = true) => { const d = new Date(t); return `${d.getUTCDate()} ${MON[d.getUTCMonth()]}${withYear ? " " + d.getUTCFullYear() : ""}`; };

  function renderStats() {
    const br = breaks();
    const longest = br.reduce((a, b) => (b.len > a.len ? b : a), { len: 0 });
    const total = [...days.values()].filter((v) => v === 1).length;
    const d = new Date(today), monthStart = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
    let month = 0;
    for (let t = monthStart; t <= today; t += DAY) if (days.get(key(t)) === 1) month++;
    // Usual go-live time: median start hour (Madrid) of the recent streams
    let usual = "";
    if (sessions.length) {
      const mins = sessions.map((s) => {
        const p = new Intl.DateTimeFormat("es-ES", { timeZone: "Europe/Madrid", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date(s.start));
        return Number(p.find((x) => x.type === "hour").value) * 60 + Number(p.find((x) => x.type === "minute").value);
      }).sort((a, b) => a - b);
      const m = Math.round(mins[Math.floor(mins.length / 2)] / 5) * 5;
      usual = `${pad(Math.floor(m / 60) % 24)}:${pad(m % 60)}`;
    }
    const rows = [
      ["Parada más larga", longest.len ? `${longest.len} días (${MON[new Date(longest.from).getUTCMonth()]} ${new Date(longest.from).getUTCFullYear()})` : "—"],
      ["Días con directo este mes", month],
      ["Suele empezar", usual ? usual + " (hora española)" : "—"],
      ["Días con directo en total", total.toLocaleString("es-ES")],
      ["Racha más larga", `${streak(first, today)} días seguidos`],
      ["Primer directo", fmt(first)]
    ];
    $("trkStats").innerHTML = rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");

    $("trkBreaks").innerHTML = br.filter((b) => b.len >= LONG).sort((a, b) => b.from - a.from).map((b) =>
      `<span class="trk-break${b.current ? " now" : ""}"><b>${b.len} días</b> ${fmt(b.from, new Date(b.from).getUTCFullYear() !== new Date(b.to).getUTCFullYear())} – ${b.current ? "hoy" : fmt(b.to)}</span>`
    ).join("") || `<p class="empty">Ninguna. Este hombre no para.</p>`;
  }

  function renderTabs() {
    const years = [];
    for (let y = new Date(today).getUTCFullYear(); y >= new Date(first).getUTCFullYear(); y--) years.push(String(y));
    $("trkTabs").innerHTML = [["12", "12 meses"], ...years.map((y) => [y, y])].map(([v, l]) =>
      `<button class="trk-tab" role="tab" aria-selected="${v === view}" data-v="${v}">${l}</button>`).join("");
  }

  function renderGrid() {
    let from, to;
    if (view === "12") {
      const d = new Date(today);
      from = Date.UTC(d.getUTCFullYear() - 1, d.getUTCMonth(), 1);
      to = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0);
    } else {
      from = Date.UTC(+view, 0, 1); to = Date.UTC(+view, 11, 31);
    }
    const long = longDays();
    const startDow = (new Date(from).getUTCDay() + 6) % 7; // Monday = 0
    const gridStart = from - startDow * DAY;
    const weeks = Math.ceil((to - gridStart + DAY) / (7 * DAY));
    let cells = "", months = "", lastMonth = -1, streamed = 0;
    for (let w = 0; w < weeks; w++) {
      for (let r = 0; r < 7; r++) {
        const t = gridStart + (w * 7 + r) * DAY;
        if (t < from || t > to) { cells += `<span class="trk-c c-out" style="grid-area:${r + 1}/${w + 1}"></span>`; continue; }
        const k = key(t), v = days.get(k);
        const cls = v === 1 ? "c-on" : v === 0 ? (long.has(k) ? "c-long" : "c-off") : "c-none";
        if (v === 1) streamed++;
        const dt = new Date(t);
        const label = `${DOW[dt.getUTCDay()]} ${fmt(t)} · ${v === 1 ? "directo" : v === 0 ? (long.has(k) ? "parada larga" : "sin directo") : "aún no"}`;
        cells += `<span class="trk-c ${cls}${k === todayKey ? " today" : ""}" style="grid-area:${r + 1}/${w + 1}" title="${label}"></span>`;
        if (dt.getUTCDate() <= 7 && r === 0 || (t === from && dt.getUTCMonth() !== lastMonth)) {
          if (dt.getUTCMonth() !== lastMonth) { months += `<span style="grid-column:${w + 1}">${MON[dt.getUTCMonth()]}</span>`; lastMonth = dt.getUTCMonth(); }
        }
      }
    }
    $("trkGrid").style.setProperty("--weeks", weeks);
    $("trkGrid").innerHTML = `<div class="trk-months">${months}</div><div class="trk-days"><span>lun</span><span></span><span>mié</span><span></span><span>vie</span><span></span><span>dom</span></div><div class="trk-grid">${cells}</div>`;
    $("trkSum").textContent = `${streamed} días con directo · racha más larga ${streak(Math.max(from, first), Math.min(to, today))} días`;
  }

  function renderAll() { renderStats(); renderTabs(); renderGrid(); }

  $("trkTabs").addEventListener("click", (e) => {
    const b = e.target.closest(".trk-tab"); if (!b) return;
    view = b.dataset.v; renderTabs(); renderGrid();
  });

  // LED: time since the last stream ended, or since it started if he's live
  let ledFrom = null;
  setInterval(() => {
    if (ledFrom === null) return;
    const s = Math.max(0, Math.floor((Date.now() - ledFrom) / 1000));
    $("ledD").textContent = pad(Math.floor(s / 86400));
    $("ledH").textContent = pad(Math.floor((s % 86400) / 3600));
    $("ledM").textContent = pad(Math.floor((s % 3600) / 60));
  }, 1000);

  renderAll();
  if (window.onLiveStatus) {
    window.onLiveStatus((st) => {
      if (!st || !st.sessions) return;
      sessions = st.sessions.map((x) => ({ start: Date.parse(x.start), end: Date.parse(x.end) })).filter((x) => !isNaN(x.start)).sort((a, b) => a.start - b.start);
      live = !!st.live; liveStart = st.startedAt ? Date.parse(st.startedAt) : null;
      fillRecent();
      renderAll();
      $("ledTimer").classList.toggle("is-live", live);
      $("trkSinceLabel").textContent = live ? "En directo desde hace" : "Desde el último directo";
      const done = live ? sessions.slice(0, -1) : sessions;
      ledFrom = live && liveStart ? liveStart : (done.length ? done[done.length - 1].end : null);
    });
  }
})();
