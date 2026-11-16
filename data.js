/* ==========================================================================
   StradiFans - content file
   Everything the site shows lives here. Edit this file to add lore,
   glossary entries, timeline milestones, sounds, FAQ answers, etc.
   Entries marked "PENDIENTE" are placeholders waiting for real content.
   ========================================================================== */

window.SITE = {
  version: "0.4.0",
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
    "vuelta 1, curva 1. rezad por él.",
    "adelantando a paid actors."
  ],
  offlineCaptions: [
    "estará ajustando el force feedback.",
    "el coche está en parque cerrado.",
    "hasta los simracers duermen. supuestamente.",
    "bandera roja. sesión suspendida.",
    "Valdeon86 está calculando el consumo."
  ],

  /* Home stats (static) */
  stats: [
    { label: "Sim principal", value: "iRacing", note: "y Le Mans Ultimate" },
    { label: "Su coche", value: "Honda Civic", note: "Sport Plus 1.5 Turbo · 182 CV" },
    { label: "Seguidores", value: "57K+", note: "en Twitch" }
  ],

  /* Stradipedia. Rarity uses iRacing license classes: R, D, C, B, A, PRO.
     Optional "clip": link to a Twitch clip. Optional "emote": image URL shown on the card. */
  glossary: [
    {
      term: "Verstappen guarro", rarity: "PRO",
      text: "Stradi se ha cruzado más de una vez en iRacing con Max Verstappen, cuatro veces campeón de F1. De uno de esos encuentros nació el grito que el chat ya nunca olvidará.",
      clip: "https://www.twitch.tv/stradi/clip/RepleteCuteMetalMikeHogu-e8h4Km65hfCf9-AM"
    },
    {
      term: "Paid actors", rarity: "PRO",
      text: "Cuando Stradi adelanta demasiado fácil, el chat lo tiene claro: los rivales son actores pagados. Ni pelean, se apartan solos.",
      clip: "https://www.twitch.tv/stradi/clip/CovertHumbleGoatAMPEnergyCherry-g3cgxovRFlrqQyhl"
    },
    {
      term: "Ganador de las 24h de Nürburgring", rarity: "PRO",
      text: "Hace dos años, Stradi ganó las 24 horas de Nürburgring junto a SaxoGaming y Keny500. Un día entero en el Infierno Verde y la victoria para casa.",
      clip: "https://www.twitch.tv/stradi/clip/JoyousGrossButterNomNom-WUhvTGJQUpLypBGr"
    },
    {
      term: "Primer podio en la Porsche All Star", rarity: "B",
      text: "Hace tres años, Stradi pisó por primera vez el podio de la Porsche All Star. El principio de todo.",
      clip: "https://www.twitch.tv/stradi/clip/TangentialFriendlyGoshawkStrawBeary-GGNQrPzucq0hwyOq"
    },
    {
      term: "Primera victoria en la Porsche All Star", rarity: "A",
      text: "El día que Stradi se estrenó en lo más alto del podio de la Porsche All Star.",
      clip: "https://www.twitch.tv/stradi/clip/CrazyColdbloodedTruffleMoreCowbell-DaAt-l1FHnEFgd7O"
    },
    {
      term: "P2 en las 24h de Daytona", rarity: "PRO",
      text: "Segundos en las 24 horas de Daytona de este año junto a JaSoiLRace y Keny500. Y para celebrarlo, trompo a propósito cruzando la línea de meta.",
      clip: "https://www.twitch.tv/stradi/clip/PolishedAntediluvianGarbageTBTacoRight-fzmVLwo0MuoqidwJ"
    },
    {
      term: "2.000 subs en un mes", rarity: "PRO",
      text: "El mes en que el canal llegó a los 2.000 subs. Un hito para el canal y para toda la comunidad.",
      clip: "https://www.twitch.tv/stradi/clip/TsundereObservantWatermelonEleGiggle-9YrvNzwF3qNp-fCA"
    },
    {
      term: "¡Despedidos!", rarity: "A",
      text: "La coña de siempre: Stradi despide del equipo a JaSoiLRace y a Keny500. Los mismos con los que se sube al podio.",
      clip: "https://www.twitch.tv/stradi/clip/StupidBumblingToothDBstyle-I4sRk2Af_5UBMwJo"
    },
    {
      term: "Valdeon86, el ingeniero", rarity: "PRO",
      text: "El ingeniero que todo el mundo querría en el muro. En las carreras de resistencia le canta el consumo objetivo, cuándo entrar a boxes, si el P2 ha parado y con qué tiempo. Eso sí: siempre se le recuerda el \"gas a tope\" justo cuando no hay que ahorrar."
    },
    {
      term: "Gas a tope / cuidao con el ahorro", rarity: "A",
      text: "La coña eterna con Valdeon86: o vamos a fondo cuando hay que ahorrar, o ahorramos cuando hay que ir a fondo. Cuidao con el ahorro."
    },
    {
      term: "Lunes sin qualy", rarity: "A",
      text: "Los lunes Stradi sale a la clasificación con bandera negra para empezar desde el fondo de la parrilla. Remontada garantizada. Y paid actors, también."
    },
    {
      term: "Las salvadas de Stradi", rarity: "A",
      text: "Cuando el coche ya está cruzado y el chat ya ha escrito F, Stradi lo recoge. Una de tantas:",
      clip: "https://www.twitch.tv/stradi/clip/SingleBlightedKleeGrammarKing-uRg6uxuAKLDvGq16"
    },
    {
      term: "El volante de Fanatec roto", rarity: "PRO",
      text: "El día que el volante de Fanatec no aguantó más golpes y se rompió. Un clásico del canal.",
      clip: "https://www.twitch.tv/stradi/clip/DifferentLivelyDaikonNononoCat-bKIH-JAJAW2uL0Oz"
    },
    {
      term: "El volante dice basta", rarity: "C",
      text: "En mitad de carrera, el volante se cuelga o se desconecta. El coche sigue, el piloto no. Esta vez no era una excusa.",
      clip: "https://www.twitch.tv/stradi/clip/EagerAliveFalconUWot-jRwvrC93YeS3Wjqn"
    },
    {
      term: "Stradipuntos", rarity: "B",
      text: "Los puntos del canal que ganas viendo el directo. El chat ludópata se los juega en cada carrera: ganancia de iRating, pérdida de iRating o retirada."
    },
    {
      term: "Retirada", rarity: "B",
      text: "La apuesta maldita: el coche no llega a meta por un contacto, un golpe o un abrazo con el muro."
    },
    {
      term: "Calvo", rarity: "A",
      text: "Uno de los clásicos del chat: llamarle calvo. Tan clásico que el canal tiene hasta su propio emote para ello: stradiemotCalvo.",
      emote: "https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_f95f907fa4a64e45951bae4cece2b81f/default/dark/3.0",
      clip: "https://www.twitch.tv/stradi/clip/AliveRacyFlamingoOSsloth-bvgt42N6AYuKP0HO"
    },
    {
      term: "Santi pesao", rarity: "A",
      text: "santih91 es el rey del cariño en el chat. Tanto, que cada vez que escribe, el chat responde lo mismo: \"Santi pesao\"."
    },
    {
      term: "Sergio Tarrias", rarity: "A",
      text: "Mod del canal y miembro fijo del departamento de chistes. Si hay broma en el chat, probablemente la ha empezado él."
    },
    {
      term: "Los chistes de topotamadre_x", rarity: "B",
      text: "Sub de la casa. Entra, saluda y te suelta un chiste de los malos. Malos, pero a veces divertidos."
    },
    {
      term: "El Civic", rarity: "C",
      text: "Su coche de verdad: un Honda Civic Sport Plus 1.5 Turbo de 182 CV, blanco. Su \"nuevo mejor amigo\" desde 2019."
    }
  ],

  /* Excuse generator */
  excuses: [
    "El netcode. Al 100% el netcode.",
    "Las ruedas estaban frías. Todas. Toda la carrera.",
    "Me estaba doblando, os juro que se movió en la frenada.",
    "Los pedales se desconectaron justo en esa curva.",
    "Se me ha desconectado el volante. Esta vez de verdad, hay clip.",
    "El setup era de clasificación, no de carrera.",
    "Me daba el sol en los ojos. En un simulador.",
    "Estaba leyendo el chat.",
    "Los límites de pista son orientativos.",
    "Ha patinado la rueda, no el piloto.",
    "Estrategia del muro (o sea, del chat).",
    "Valdeon86 me dijo gas a tope.",
    "Era un paid actor que no se sabía el guion.",
    "Es lunes. Salía último a propósito."
  ],

  /* Soundboard: put mp3 files in /sounds and reference them here */
  sounds: [
    { title: "Verstappen guarro", file: "" },
    { title: "Keny, estás despedido", file: "" },
    { title: "PENDIENTE: clip 3", file: "" }
  ],

  /* Lore timeline */
  timeline: [
    { date: "22/09/2019", title: "Llega el Civic", text: "Presenta a su \"nuevo mejor amigo\": un Honda Civic Sport Plus 1.5 Turbo de 182 CV, blanco." },
    { date: "2023", title: "Primer podio en la Porsche All Star", text: "Primera vez en el podio de la Porsche All Star." },
    { date: "2024", title: "Gana las 24h de Nürburgring", text: "Victoria en las 24 horas de Nürburgring junto a SaxoGaming y Keny500." },
    { date: "2026", title: "P2 en las 24h de Daytona", text: "Segundo puesto en las 24 horas de Daytona con JaSoiLRace y Keny500, rematado con un trompo a propósito en la línea de meta." },
    { date: "PENDIENTE", title: "2.000 subs en un mes", text: "El canal alcanza los 2.000 subs en un solo mes." },
    { date: "PENDIENTE", title: "Primera victoria en la Porsche All Star", text: "Primera victoria de Stradi en la Porsche All Star." },
    { date: "PENDIENTE", title: "Verstappen guarro", text: "Se cruza con Max Verstappen en iRacing y nace un clásico del canal." },
    { date: "29/11/2026", title: "46 años", text: "El paddock entero celebra el cumple de Stradi." }
  ],

  /* Baúl (memes / edits / fan art). Put images in /vault */
  vault: [
    // { title: "Título del meme", image: "/vault/meme1.webp" }
  ],

  /* FAQ - "Lo que la gente busca en Google" */
  faq: [
    { q: "¿Está Stradi en directo ahora mismo?", a: "Mira la portada. Hay una sección entera para eso." },
    { q: "¿Por qué sale último los lunes?", a: "Es el lunes sin qualy: sale a clasificar con bandera negra para empezar desde el fondo. Es a propósito. Casi siempre." },
    { q: "¿Los rivales son actores pagados?", a: "Oficialmente, no. Extraoficialmente, mira el clip de los paid actors en la Stradipedia y juzga tú." },
    { q: "¿A qué apuesto mis Stradipuntos?", a: "Ganancia de iRating, pérdida de iRating o retirada. Esto no es asesoramiento financiero." },
    { q: "¿Quién es Valdeon86?", a: "El ingeniero. Consumo, ventanas de boxes, tiempos del P2. Y algún que otro \"gas a tope\"." },
    { q: "¿Qué coche tiene?", a: "Un Honda Civic Sport Plus 1.5 Turbo de 182 CV, blanco. Desde 2019 es su \"nuevo mejor amigo\"." },
    { q: "¿Qué volante usa?", a: "PENDIENTE" }
  ],

  /* Where to find him */
  links: [
    { name: "Twitch", url: "https://www.twitch.tv/stradi" },
    { name: "YouTube", url: "https://www.youtube.com/stradi" },
    { name: "Instagram", url: "https://www.instagram.com/stradi_81/" },
    { name: "X", url: "https://x.com/Stradi81" },
    { name: "TikTok", url: "https://www.tiktok.com/@stradi81" }
  ],

  /* Clips that are always in the roulette, on top of the most viewed ones.
     Use the clip id: the last part of the clip URL (without "?range=..."). */
  rouletteClips: [
    "NiceSecretiveCockroachRickroll-lYClPQznAl0gremp",
    "RepleteCuteMetalMikeHogu-e8h4Km65hfCf9-AM",
    "CovertHumbleGoatAMPEnergyCherry-g3cgxovRFlrqQyhl",
    "SingleBlightedKleeGrammarKing-uRg6uxuAKLDvGq16",
    "HyperAwkwardScallionBCWarrior-n1JY7ijjuAJub01u",
    "JoyousGrossButterNomNom-WUhvTGJQUpLypBGr",
    "SavorySteamyLlamaWow-sIA_PDyGu8m5Dzh1",
    "DarlingHelpfulSnailCmonBruh-DuPiHl6yaJ5o-bJv",
    "CrazyColdbloodedTruffleMoreCowbell-DaAt-l1FHnEFgd7O",
    "EagerAliveFalconUWot-jRwvrC93YeS3Wjqn",
    "TangentialFriendlyGoshawkStrawBeary-GGNQrPzucq0hwyOq",
    "AliveRacyFlamingoOSsloth-bvgt42N6AYuKP0HO",
    "CrepuscularSmallSwordWow-SEZroj9NQCSHJikO",
    "UglyBashfulParrotUnSane-cPpbx4Rj2wV-UZSR",
    "CrypticUnsightlyBaconChefFrank-rtefTBYSX8ncj_cl",
    "TenderCoweringBorkResidentSleeper-CpppOshUikzbxF3A",
    "PolishedAntediluvianGarbageTBTacoRight-fzmVLwo0MuoqidwJ",
    "DifferentLivelyDaikonNononoCat-bKIH-JAJAW2uL0Oz",
    "FilthyCrowdedSharkWow-cCWjyeMyo1AM4pAr",
    "TsundereObservantWatermelonEleGiggle-9YrvNzwF3qNp-fCA",
    "BoredHonorableSushiPeteZaroll-MLIa4ocHvfU_dpxT",
    "MagnificentResoluteBillJebaited--fommT8BNCu-px4K",
    "NurturingEagerReindeerBudStar-HN1Se6M3JsTBgUPH",
    "PoliteLachrymoseFiddleheadsPhilosoraptor-T9fVgsBR4IdghuDp",
    "RelentlessPlayfulCookieDendiFace-hV9JPO5fCC3XarFH",
    "LovelyEvilOpossumDeIlluminati-Ry-DHIHt5-IT3CDU",
    "ResourcefulTallPorcupineKeyboardCat-WJPhf2AVU4qwl2oB",
    "StupidBumblingToothDBstyle-I4sRk2Af_5UBMwJo",
    "WildSingleWaspPlanking-WVg8LtYdQX4kQHHi"
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
