/* ==========================================================================
   StradiFans - content file
   Everything the site shows lives here. Edit this file to add lore,
   glossary entries, timeline milestones, sounds, FAQ answers, etc.
   Entries marked "TODO" are placeholders waiting for real content.
   ========================================================================== */

window.SITE = {
  version: "0.1.1",
  author: "Vznum",
  twitchUser: "stradi",

  /* Captions shown under the big YES / NO answer (one is picked at random) */
  liveCaptions: [
    "he's in the pits.",
    "he's fighting for P1 (or P14).",
    "he's blaming the netcode.",
    "he's on lap 1, turn 1. pray for him."
  ],
  offlineCaptions: [
    "he's probably adjusting his FFB settings.",
    "the car is in parc fermé.",
    "even sim racers need sleep. allegedly.",
    "red flag. session suspended."
  ],

  /* Pit wall stats (static for now) */
  stats: [
    { label: "Longest break", value: "TODO", note: "TODO: date" },
    { label: "Main sim", value: "iRacing", note: "also LMU" },
    { label: "Followers", value: "57K+", note: "on Twitch" }
  ],

  /* Glossary. Rarity uses iRacing license classes: R, D, C, B, A, PRO */
  glossary: [
    { term: "TODO: catchphrase #1", rarity: "PRO", text: "TODO: what it means and where it comes from." },
    { term: "TODO: running joke", rarity: "A", text: "TODO: describe the joke." },
    { term: "TODO: iconic crash", rarity: "B", text: "TODO: which race, which track, what happened." },
    { term: "TODO: chat meme", rarity: "C", text: "TODO: describe it." },
    { term: "TODO: emote", rarity: "D", text: "TODO: what the emote is used for." },
    { term: "TODO: rookie moment", rarity: "R", text: "TODO: describe it." }
  ],

  /* Excuse generator (Toolbox) - generic sim racing excuses */
  excuses: [
    "Netcode. 100% netcode.",
    "The tyres were cold. All of them. For the whole race.",
    "He was lapping, I swear he moved under braking.",
    "My pedals disconnected for exactly one corner.",
    "Setup was built for qualifying, not for racing.",
    "The sun was in my eyes. In a sim.",
    "I was reading chat.",
    "Track limits are a suggestion.",
    "Wheel slip, not driver slip.",
    "Strategy call from the pit wall (chat)."
  ],

  /* Soundboard: put mp3 files in /sounds and reference them here */
  sounds: [
    { title: "TODO: clip 1", file: "" },
    { title: "TODO: clip 2", file: "" },
    { title: "TODO: clip 3", file: "" }
  ],

  /* Lore timeline */
  timeline: [
    { date: "TODO", title: "TODO: first stream", text: "TODO" },
    { date: "TODO", title: "TODO: Twitch Partner", text: "TODO" },
    { date: "TODO", title: "TODO: big milestone", text: "TODO" },
    { date: "2026", title: "TODO: latest milestone", text: "TODO" }
  ],

  /* Vault (memes / edits / fan art). Put images in /vault */
  vault: [
    // { title: "Meme title", image: "vault/meme1.webp" }
  ],

  /* FAQ - "Things people Google" */
  faq: [
    { q: "Is Stradi live right now?", a: "Scroll up. There's a whole section for that." },
    { q: "What wheel does he use?", a: "TODO" },
    { q: "Is he fast?", a: "TODO" },
    { q: "TODO: question", a: "TODO: answer" }
  ],

  /* Where to find him */
  links: [
    { name: "Twitch", url: "https://www.twitch.tv/stradi" },
    { name: "Twitch VODs", url: "https://www.twitch.tv/stradi/videos" },
    { name: "YouTube", url: "" },  // TODO
    { name: "Instagram", url: "" } // TODO
  ]
};
