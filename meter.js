/* StradiFans - chat meter: counts what the chat spams most.
   Counts are kept per browser for the current day (localStorage, best effort). */
(function () {
  const STOP = new Set(("a al algo ahi ahí asi así bien como con de del el ella en era es esa ese eso esta está estan están este esto ha han hay he la las le les lo los me mi mis muy mas más ni no nos o os para pero por que qué se si sí sin su sus te tu tú un una uno y ya yo the to and is it you i of in on for this that").split(" "));
  const KEY = "sf_meter_" + new Date().toISOString().slice(0, 10);

  let counts = {}, emotes = {}, total = 0;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (saved) { counts = saved.counts || {}; emotes = saved.emotes || {}; total = saved.total || 0; }
  } catch (_) {}

  let saveTimer = null;
  function save() {
    if (saveTimer) return;
    saveTimer = setTimeout(() => {
      saveTimer = null;
      try { localStorage.setItem(KEY, JSON.stringify({ counts, emotes, total })); } catch (_) {}
    }, 2000);
  }

  function normalize(tok) {
    if (tok.emote) return tok.text; // emotes are case sensitive
    let w = tok.text;
    if (/^https?:\/\//i.test(w) || w.startsWith("@")) return null;
    if (/^[?!¿¡.]+$/.test(w)) return w.length >= 2 ? w.slice(0, 3) : null; // "???" style
    w = w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
    if (!w || w.length > 25) return null;
    const lower = w.toLowerCase();
    if (STOP.has(lower)) return null;
    return w === w.toUpperCase() && w.length > 1 ? w : lower; // keep SHOUTING as its own entry
  }

  function add(msg) {
    if (msg.historical) return;
    total++;
    const seen = new Set();
    msg.tokens.forEach((t) => {
      if (t.text === " ") return;
      const k = normalize(t);
      if (!k || seen.has(k)) return;
      seen.add(k);
      counts[k] = (counts[k] || 0) + 1;
      if (t.emote) emotes[k] = t.emote;
    });
    save();
  }

  function top(n) {
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([term, count]) => ({ term, count, emote: emotes[term] || window.StradiChat.emoteUrl(term) }));
  }

  function reset() {
    counts = {}; emotes = {}; total = 0;
    try { localStorage.removeItem(KEY); } catch (_) {}
  }

  window.StradiMeter = { add, top, reset, total: () => total };
})();
