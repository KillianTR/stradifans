/* ==========================================================================
   StradiFans - content file
   Everything the site shows lives here. Edit this file to add lore,
   glossary entries, timeline milestones, sounds, FAQ answers, etc.
   Entries marked "PENDIENTE" are placeholders waiting for real content.
   ========================================================================== */

window.SITE = {
  version: "0.2.0",
  author: "Vznum",
  twitchUser: "stradi",
  twitchId: "178443161",

  /* Birthday banner: shows a countdown and celebrates on the day */
  birthday: { year: 1980, month: 11, day: 29 },

  /* Captions under the big SÍ / NO answer (one is picked at random) */
  liveCaptions: [
    "está en boxes. o eso dice.",
    "peleando por la P1 (o por la P14).",
    "echándole la culpa al netcode.",
    "vuelta 1, curva 1. rezad por él."
  ],
  offlineCaptions: [
    "estará ajustando el force feedback.",
    "el coche está en parque cerrado.",
    "hasta los simracers duermen. supuestamente.",
    "bandera roja. sesión suspendida."
  ],

  /* Pit wall stats (static for now) */
  stats: [
    { label: "Sim principal", value: "iRacing", note: "y Le Mans Ultimate" },
    { label: "Su coche", value: "Honda Civic", note: "Sport Plus 1.5 Turbo · 182 CV" },
    { label: "Seguidores", value: "57K+", note: "en Twitch" }
  ],

  /* Glossary. Rarity uses iRacing license classes: R, D, C, B, A, PRO */
  glossary: [
    { term: "PENDIENTE: frase mítica", rarity: "PRO", text: "PENDIENTE: qué significa y de dónde viene." },
    { term: "Santi pesao", rarity: "A", text: "santih91 es el rey del cariño en el chat. Tanto, que cada vez que escribe, el chat responde lo mismo: \"Santi pesao\"." },
    { term: "PENDIENTE: piñazo histórico", rarity: "B", text: "PENDIENTE: qué carrera, qué circuito, qué pasó." },
    { term: "Sergio Tarrias", rarity: "A", text: "Mod del canal y miembro fijo del departamento de chistes. Si hay broma en el chat, probablemente la ha empezado él." },
    { term: "Los chistes de topotamadre_x", rarity: "B", text: "Sub de la casa. Entra, saluda y te suelta un chiste de los malos. Malos, pero a veces divertidos." },
    { term: "PENDIENTE: meme del chat", rarity: "C", text: "PENDIENTE: descríbelo." },
    { term: "PENDIENTE: emote", rarity: "D", text: "PENDIENTE: para qué se usa." },
    { term: "PENDIENTE: momento rookie", rarity: "R", text: "PENDIENTE: descríbelo." }
  ],

  /* Excuse generator */
  excuses: [
    "El netcode. Al 100% el netcode.",
    "Las ruedas estaban frías. Todas. Toda la carrera.",
    "Me estaba doblando, os juro que se movió en la frenada.",
    "Los pedales se desconectaron justo en esa curva.",
    "El setup era de clasificación, no de carrera.",
    "Me daba el sol en los ojos. En un simulador.",
    "Estaba leyendo el chat.",
    "Los límites de pista son orientativos.",
    "Ha patinado la rueda, no el piloto.",
    "Estrategia del muro (o sea, del chat)."
  ],

  /* Soundboard: put mp3 files in /sounds and reference them here */
  sounds: [
    { title: "PENDIENTE: clip 1", file: "" },
    { title: "PENDIENTE: clip 2", file: "" },
    { title: "PENDIENTE: clip 3", file: "" }
  ],

  /* Lore timeline */
  timeline: [
    { date: "PENDIENTE", title: "Primer directo", text: "PENDIENTE" },
    { date: "PENDIENTE", title: "Partner de Twitch", text: "PENDIENTE" },
    { date: "22/09/2019", title: "Llega el Civic", text: "Presenta a su \"nuevo mejor amigo\": un Honda Civic Sport Plus 1.5 Turbo de 182 CV, blanco." },
    { date: "PENDIENTE", title: "PENDIENTE: gran hito", text: "PENDIENTE" },
    { date: "29/11/2026", title: "46 años", text: "El paddock entero celebra el cumple de Stradi." }
  ],

  /* Vault (memes / edits / fan art). Put images in /vault */
  vault: [
    // { title: "Título del meme", image: "vault/meme1.webp" }
  ],

  /* FAQ - "Cosas que la gente busca en Google" */
  faq: [
    { q: "¿Está Stradi en directo ahora mismo?", a: "Sube un poco. Hay una sección entera para eso." },
    { q: "¿Qué volante usa?", a: "PENDIENTE" },
    { q: "¿Es rápido?", a: "PENDIENTE" },
    { q: "¿Qué coche tiene?", a: "Un Honda Civic Sport Plus 1.5 Turbo de 182 CV, blanco. Desde 2019 es su \"nuevo mejor amigo\"." }
  ],

  /* Where to find him */
  links: [
    { name: "Twitch", url: "https://www.twitch.tv/stradi" },
    { name: "YouTube", url: "https://www.youtube.com/stradi" },
    { name: "Instagram", url: "https://www.instagram.com/stradi_81/" },
    { name: "X", url: "https://x.com/Stradi81" },
    { name: "TikTok", url: "https://www.tiktok.com/@stradi81" }
  ],

  /* Clip roulette tiers (by view count). Odds are in % and must add up to 100. */
  clipTiers: [
    { id: "legend",  name: "★ Leyenda", min: 100000, odds: 0.26,  color: "#ffd200" },
    { id: "podium",  name: "Podio",          min: 10000,  odds: 0.64,  color: "#ea6f18" },
    { id: "points",  name: "Puntos",         min: 1000,   odds: 3.20,  color: "#c04cf0" },
    { id: "pack",    name: "Pelotón",        min: 100,    odds: 15.98, color: "#009bfe" },
    { id: "backmarker", name: "Cola",        min: 0,      odds: 79.92, color: "#8b9bb0" }
  ]
};
