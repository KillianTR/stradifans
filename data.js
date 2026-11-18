/* ==========================================================================
   StradiFans - content file
   Everything the site shows lives here. Edit this file to add lore,
   glossary entries, timeline milestones, sounds, FAQ answers, etc.
   Entries marked "PENDIENTE" are placeholders waiting for real content.
   ========================================================================== */

window.SITE = {
  version: "1.34.4",
  author: "KillianTR",
  authorUrl: "https://killiantr.vercel.app",
  authorX: "VznumR6", // X/Twitter handle shown in the footer (e.g. "KillianTR"); empty = link to authorUrl
  twitchUser: "stradi",
  twitchId: "178443161",

  /* Birthday banner: shows a countdown and celebrates on the day */
  birthday: { year: 1981, month: 11, day: 29 },

  /* Upcoming event shown on the home page. It hides itself after "until". */
  event: {
    label: "Próximo evento",
    title: "Extensible TOTOYIL",
    when: "Sábado 21 de noviembre · 13:00 (hora peninsular)",
    text: "Toyota GR Cup en iRacing de 5 a 24 horas. ¡Tú decides cuánto dura!",
    tags: ["Toyota GR Cup", "iRacing", "Mín. 5 h · Máx. 24 h", "Sorteos para todos"],
    command: "!extensible",
    // How the stream gets longer
    extend: [
      { what: "Sub T1 / Prime", time: "+3 min" },
      { what: "Sub T2", time: "+5 min" },
      { what: "Sub T3", time: "+12 min" },
      { what: "100 bits", time: "+40 s" }
    ],
    // Giveaways for all active subs, by hours on air
    prizes: [
      { at: "6 h", prize: "Vale de 200 € en SimtechPro" },
      { at: "12 h", prize: "Pedales SRP GT-S" },
      { at: "18 h", prize: "Vale de 400 € en SimtechPro" },
      { at: "24 h", prize: "¡Sorteazo de los pedales SRP GT-R!", big: true }
    ],
    prizesNote: "Para todos los subs activos. Cada sub regalada da 1 participación extra.",
    extras: [
      { every: "Cada 2 h", text: "Código de descuento de SRP" },
      { every: "Cada 5 carreras", text: "¡No qualy! Y sorteo de una licencia de StintLogic de 1 año entre los presentes en el chat (subs y no subs)" }
    ],
    start: "2026-11-21T13:00:00+01:00", // 13:00 Spanish peninsular time (CET)
    until: "2026-11-22T23:59:59"
  },

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
    { label: "Su volante", value: "Artura Ultimate", note: "Ascher Racing McLaren" },
    { label: "Sus pedales", value: "SRP GT-R", note: "3P Black Edition" },
    { label: "Seguidores", value: "57K+", note: "en Twitch" }
  ],

  /* Stradipedia. Rarity uses iRacing license classes: R, D, C, B, A, PRO.
     Optional "clip": link to a Twitch clip ("clipAlt" + "clipAltLabel" for a second one).
     Optional "emote": image URL shown next to the title. Optional "link" + "linkLabel": any other link.
     Optional "image": picture shown when hovering the entry (if missing, the clip thumbnail is used).
     Optional "sound": key of a sound in "sounds" (plays it from the entry). */
  glossary: [
    {
      term: "Verstappen guarro", rarity: "PRO",
      text: "Stradi se ha cruzado más de una vez en iRacing con Max Verstappen, cuatro veces campeón de F1. De uno de esos encuentros nació el grito que el chat ya nunca olvidará.",
      clip: "https://www.twitch.tv/stradi/clip/RepleteCuteMetalMikeHogu-e8h4Km65hfCf9-AM",
      sound: "1"
    },
    {
      term: "Paid actors", rarity: "PRO",
      text: "Cuando Stradi adelanta demasiado fácil, el chat lo tiene claro: los rivales son actores pagados. Ni pelean, se apartan solos.",
      clip: "https://www.twitch.tv/stradi/clip/CovertHumbleGoatAMPEnergyCherry-g3cgxovRFlrqQyhl"
    },
    {
      term: "Saxo pide indicaciones", rarity: "PRO",
      text: "En plenas 24 horas de Nürburgring en iRacing, SaxoGaming pidió indicaciones por radio. Para muchos, el mejor clip de la historia del canal. Sin discusión.",
      clip: "https://www.twitch.tv/stradi/clip/PlausibleRockyTapirTheTarFu-J7deoLWRUY6jA6ke",
      clipAlt: "https://www.twitch.tv/saxogamingtv/clip/SwissWrongTortoiseBudStar-snp6CPhNz7UEfJSE",
      clipAltLabel: "Versión de SaxoGamingTV"
    },
    {
      term: "Ganador de las 24h de Nürburgring", rarity: "PRO",
      text: "Hace dos años, Stradi ganó las 24 horas de Nürburgring en iRacing junto a SaxoGaming y Keny500. Un día entero en el Infierno Verde y la victoria para casa.",
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
      clip: "https://www.twitch.tv/stradi/clip/StupidBumblingToothDBstyle-I4sRk2Af_5UBMwJo",
      sound: "2"
    },
    {
      term: "Valdeon86, el ingeniero", rarity: "PRO",
      text: "El ingeniero que todo el mundo querría en el muro. En las carreras de resistencia le canta el consumo objetivo, cuándo entrar a boxes, si el P2 ha parado y con qué tiempo. Eso sí: siempre se le recuerda el \"gas a tope\" justo cuando no hay que ahorrar.",
      emote: "https://static-cdn.jtvnw.net/emoticons/v2/301793648/default/dark/3.0"
    },
    {
      term: "Gas a tope / cuidao con el ahorro", rarity: "A",
      text: "La coña eterna con Valdeon86: o vamos a fondo cuando hay que ahorrar, o ahorramos cuando hay que ir a fondo. Cuidao con el ahorro."
    },
    {
      term: "Lunes sin qualy", rarity: "PRO",
      text: "Un clásico del canal. Cada lunes, todas las carreras del directo las corre sin hacer clasificación: sale a la qualy con bandera negra y empieza desde el fondo de la parrilla. Y mientras remonta, el chat apuesta sus Stradipuntos: ganancia de iRating, pérdida de iRating o retirada.",
      emote: "https://static-cdn.jtvnw.net/emoticons/v2/303908798/default/dark/3.0"
    },
    {
      term: "¡ESREEEPEEEE!", rarity: "A",
      text: "Cuando Stradi clava frenos, se salva por centímetros o esquiva un accidente en el último momento, el chat se lo agradece a sus pedales SRP GT-R 3P Black Edition (SimRacing Pro). Pero no lo escribe: lo grita. ESREEEPEEEE.",
      link: "https://www.simracing-pro.com/?ref=stradi", linkLabel: "Pedales SRP"
    },
    {
      term: "Las salvadas de Stradi", rarity: "A",
      text: "Cuando el coche ya está cruzado y el chat ya ha escrito F, Stradi lo recoge. Una de tantas:",
      clip: "https://www.twitch.tv/stradi/clip/SingleBlightedKleeGrammarKing-uRg6uxuAKLDvGq16",
      emote: "https://static-cdn.jtvnw.net/emoticons/v2/303908742/default/dark/3.0"
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
      term: "El piloto de F4", rarity: "D",
      text: "Stradi imitando al piloto típico de la Fórmula 4: alguien que acaba de sacarse la licencia D en iRacing y, como le encantan los fórmulas, se pasa el día entero corriendo ahí. Total, de la D ya no se puede volver a Rookie: iRacing no lo permite.",
      clip: "https://www.twitch.tv/stradi/clip/NurturingEagerReindeerBudStar-HN1Se6M3JsTBgUPH"
    },
    {
      term: "Stradipuntos", rarity: "B",
      text: "Los puntos del canal que ganas viendo el directo. El chat ludópata se los juega en cada carrera: ganancia de iRating, pérdida de iRating o retirada.",
      emote: "https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_7b11c1d9e81a40669c768609391b0ad4/default/dark/3.0"
    },
    {
      term: "¡Stradi liada!", rarity: "A",
      text: "A veces Stradi la lía. Y cuando la lía, el chat lo celebra con su propio emote. Este es el clip del que viene.",
      emote: "https://static-cdn.jtvnw.net/emoticons/v2/301793622/default/dark/3.0",
      clip: "https://www.twitch.tv/stradi/clip/RacyColorfulWrenAMPEnergyCherry-ilHoofy6sd3G2RR0"
    },
    {
      term: "Peligro", rarity: "C",
      text: "En pista siempre hay peligro: gente que parece que no sepa conducir y accidentes que esquivar en cada vuelta. Stradi corre en modo precaución permanente.",
      emote: "https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_680742d3726f44ca88d53319f80d92fd/default/dark/3.0"
    },
    {
      term: "Temblor", rarity: "C",
      text: "El miedo a morir en carrera, convertido en emote. Para cuando la cosa se pone fea de verdad.",
      emote: "https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_2cfc96959cfc49c7a7330d233ac90833/default/dark/3.0"
    },
    {
      term: "Bíceps", rarity: "C",
      text: "Stradi jugó a balonmano muchos años, y se nota: tremendo bíceps. El chat lo sabe y tiene emote para recordarlo.",
      emote: "https://static-cdn.jtvnw.net/emoticons/v2/303908837/default/dark/3.0"
    },
    {
      term: "Retirada", rarity: "B",
      text: "La apuesta maldita: el coche no llega a meta por un contacto, un golpe o un abrazo con el muro."
    },
    {
      term: "Calvo", rarity: "A",
      text: "Uno de los clásicos del chat: llamarle calvo. Tan clásico que el canal tiene hasta su propio emote para ello: Calvo.",
      emote: "https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_f95f907fa4a64e45951bae4cece2b81f/default/dark/3.0",
      clip: "https://www.twitch.tv/stradi/clip/AliveRacyFlamingoOSsloth-bvgt42N6AYuKP0HO"
    },
    {
      term: "!porque", rarity: "A",
      text: "Cada vez que el chat le pregunta el porqué de algo, alguien tira del comando !porque. La respuesta oficial del canal: \"Porque me sale de los huevos\"."
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
      term: "Trusi, la gata de Stradi", rarity: "B",
      text: "Trusi es la gata de Stradi y la única del canal con varios emotes propios: Trusi (la que gira), Trusi1 y Trusi2.",
      emote: "https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_c215360c75db452cb5c90673c1bc9c26/default/dark/3.0"
    },
    {
      term: "El Civic", rarity: "C",
      text: "Su coche de verdad: un Honda Civic Sport Plus 1.5 Turbo de 182 CV, blanco. Su \"nuevo mejor amigo\" desde 2019.",
      image: "/vault/civic.jpg"
    }
  ],

  /* Channel emotes gallery (Stradipedia page). Image: Twitch CDN url (dark/3.0 for sharp images).
     "name" is shown under the image; leave it empty if unknown. */
  emotes: [
    { name: "Calvo", image: "https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_f95f907fa4a64e45951bae4cece2b81f/default/dark/3.0" },
    { name: "Liada", image: "https://static-cdn.jtvnw.net/emoticons/v2/301793622/default/dark/3.0" },
    { name: "Trusi", image: "https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_c215360c75db452cb5c90673c1bc9c26/default/dark/3.0" },
    { name: "Enfado plus", image: "https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_f2e64d8b977b4da5b37b6e51418b955c/default/dark/3.0" },
    { name: "Temblor", image: "https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_2cfc96959cfc49c7a7330d233ac90833/default/dark/3.0" },
    { name: "Ojo", image: "https://static-cdn.jtvnw.net/emoticons/v2/301793648/default/dark/3.0" },
    { name: "Gafas de sol", image: "https://static-cdn.jtvnw.net/emoticons/v2/301793635/default/dark/3.0" },
    { name: "Peligro", image: "https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_680742d3726f44ca88d53319f80d92fd/default/dark/3.0" },
    { name: "Face2", image: "https://static-cdn.jtvnw.net/emoticons/v2/300951950/default/dark/3.0" },
    { name: "Bíceps", image: "https://static-cdn.jtvnw.net/emoticons/v2/303908837/default/dark/3.0" },
    { name: "Cara2", image: "https://static-cdn.jtvnw.net/emoticons/v2/303908875/default/dark/3.0" },
    { name: "Enfado", image: "https://static-cdn.jtvnw.net/emoticons/v2/303908906/default/dark/3.0" },
    { name: "Cono", image: "https://static-cdn.jtvnw.net/emoticons/v2/303908798/default/dark/3.0" },
    { name: "Genial", image: "https://static-cdn.jtvnw.net/emoticons/v2/303908742/default/dark/3.0" },
    { name: "Trusi1", image: "https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_22c3ed59489c4967b0f5a6d59af683c9/default/dark/3.0" },
    { name: "Trusi2", image: "https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_b47b9e44d3914836b2dcf6239e5d17f8/default/dark/3.0" },
    { name: "Chat liada", image: "https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_7b11c1d9e81a40669c768609391b0ad4/default/dark/3.0" },
    { name: "Cara1", image: "https://static-cdn.jtvnw.net/emoticons/v2/301793657/default/dark/3.0" },
    { name: "Enfado2", image: "https://static-cdn.jtvnw.net/emoticons/v2/303908951/default/dark/3.0" },
    { name: "Wakala", image: "https://static-cdn.jtvnw.net/emoticons/v2/303994522/default/dark/3.0" },
    { name: "Cono plus", image: "https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_423385f46dd74ebfa1b4fb571d29e23b/default/dark/3.0" }
  ],

  /* Excuse generator */
  excuses: [
    "He cambiado el Damper Mode, lo tenía puesto en 2 y ahora lo he puesto en 1, y las sensaciones son un poco diferentes. Y aquí, que vamos en el súper súper súper alambre, la verdad es que me está costando un poquito.",
    "¡Me ha caído un coche encima!",
    "No apretaron bien la rueda.",
    "El ventilador del PC va a salir volando.",
    "Mi tiempo de vuelta no es malo, el tema es que he hecho offtrack.",
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
    "Es lunes. Salía último a propósito.",
    "Los SRP no han hecho ESREEEPEEEE a tiempo."
  ],

  /* Soundboard: put mp3 files in /sounds. Only sounds with a "file" are shown. "key": keyboard shortcut. */
  sounds: [
    { title: "Verstappen guarro", file: "/sounds/verstappen-guarro.mp3", key: "1" },
    { title: "Keny, estás despedido", file: "/sounds/keny-estas-despedido.mp3", key: "2" },
    { title: "¡No, noooo!", file: "/sounds/no-noooo.mp3", key: "3" }
  ],

  /* Lore timeline (horizontal, with polaroids).
     "clip": Twitch clip id -> its thumbnail and date are loaded automatically.
     "date": display text; leave it out to use the clip's date. "image": a picture instead of a clip thumbnail.
     "sort": optional ISO date to place items that have no clip (e.g. "2019-09-22"). */
  timeline: [
    { sort: "2019-09-22", date: "22 sep 2019", title: "Llega el Civic", text: "Presenta a su \"nuevo mejor amigo\": un Honda Civic Sport Plus 1.5 Turbo de 182 CV, blanco.", image: "/vault/civic.jpg" },
    { clip: "TangentialFriendlyGoshawkStrawBeary-GGNQrPzucq0hwyOq", title: "Primer podio en la Porsche All Star", text: "Primera vez en el podio de la Porsche All Star." },
    { clip: "CrazyColdbloodedTruffleMoreCowbell-DaAt-l1FHnEFgd7O", title: "Primera victoria en la Porsche All Star", text: "Por fin en lo más alto del podio." },
    { clip: "JoyousGrossButterNomNom-WUhvTGJQUpLypBGr", title: "Gana las 24h de Nürburgring", text: "Victoria en iRacing junto a SaxoGaming y Keny500." },
    { clip: "PlausibleRockyTapirTheTarFu-J7deoLWRUY6jA6ke", title: "Saxo pide indicaciones", text: "En plenas 24h de Nürburgring. El mejor clip del canal." },
    { clip: "RepleteCuteMetalMikeHogu-e8h4Km65hfCf9-AM", title: "Verstappen guarro", text: "Se cruza con Max Verstappen en iRacing y nace un clásico." },
    { clip: "DifferentLivelyDaikonNononoCat-bKIH-JAJAW2uL0Oz", title: "Adiós al volante de Fanatec", text: "No aguantó más golpes." },
    { clip: "TsundereObservantWatermelonEleGiggle-9YrvNzwF3qNp-fCA", title: "2.000 subs en un mes", text: "Un hito para el canal y para toda la comunidad." },
    { clip: "PolishedAntediluvianGarbageTBTacoRight-fzmVLwo0MuoqidwJ", title: "P2 en las 24h de Daytona", text: "Con JaSoiLRace y Keny500, y trompo a propósito en la meta." },
    { sort: "2026-11-29", date: "29 nov 2026", title: "45 años", text: "El paddock entero celebra el cumple de Stradi." }
  ],

  /* Baúl (memes / edits / fan art). Put images in /vault. Fields: title, image, note (optional). */
  vault: [
    { title: "Jodemos tu vuelta", image: "/vault/jodemos-tu-vuelta.png", note: "JodemosTuVuelta.Stradi.es" }
  ],

  /* Perfil: datos de su cuenta de iRacing (capturas del 16 nov 2026) */
  profile: {
    name: "Javier Soto",
    country: "España",
    bio: "Streamer español de simracing. Corre en iRacing desde 2011 y en Twitch desde 2020: GT, resistencias, fórmulas y algún que otro lunes sin qualy.",
    iracingSince: 2011,
    asOf: "16 nov 2026",
    licenses: [
      { cat: "Oval", cls: "A", sr: "2.50", ir: 3446, tt: 1256 },
      { cat: "Sports Car", cls: "A", sr: "4.34", ir: 5625, tt: 1298 },
      { cat: "Formula", cls: "B", sr: "1.93", ir: 3973, tt: 1350 },
      { cat: "Dirt Oval", cls: "R", sr: "2.61", ir: null, tt: 1350 },
      { cat: "Dirt Road", cls: "R", sr: "2.63", ir: null, tt: 1350 }
    ],
    // Career stats per category: starts, wins, top 5, poles, laps, laps led
    career: [
      { cat: "Sports Car", starts: 3201, wins: 451, top5: 1610, poles: 388, laps: 59208, led: 4185 },
      { cat: "Road (retirada)", starts: 3911, wins: 448, top5: 1905, poles: 513, laps: 62279, led: 4850 },
      { cat: "Formula", starts: 1234, wins: 114, top5: 602, poles: 79, laps: 13032, led: 1062 },
      { cat: "Oval", starts: 439, wins: 13, top5: 123, poles: 21, laps: 20785, led: 940 },
      { cat: "Dirt Road", starts: 2, wins: 0, top5: 1, poles: 0, laps: 19, led: 0 },
      { cat: "Dirt Oval", starts: 1, wins: 0, top5: 1, poles: 0, laps: 30, led: 3 }
    ],
    recaps: [
      { title: "2025", image: "/assets/recaps/iracing-2025.webp", starts: 1649, avgStart: 9, avgFinish: 8, wins: 224, top5: 814, laps: 28830, led: 1890 },
      { title: "2026 · Temporada 3", image: "/assets/recaps/iracing-2026-s3.webp", starts: 140, avgStart: 10, avgFinish: 10, wins: 19, top5: 68, laps: 2436, led: 188 }
    ],
    palmares: [
      { date: "jun 2026", title: "Campeón de la GT Endurance Series", text: "2026 Temporada 2, by Simucube. 1.º en la general." },
      { date: "jun 2026", title: "3.º en la GT Sprint Series", text: "2026 Temporada 2, by Simucube. División 1." },
      { date: "may 2026", title: "2.º en las 500 Millas de Indianápolis", text: "iRacing.com Indy 500 2026, split 2." },
      { date: "ago 2024", title: "Supera los 6.000 de iRating", text: "En Sports Car." },
      { date: "abr 2024", title: "Primera victoria en fórmulas", text: "Formula 1600 Rookie Sim-Motion Series." },
      { date: "mar 2024", title: "Primera victoria en Sports Car", text: "Ring Meister Ricmotech Series." },
      { date: "dic 2021", title: "3.º en la Production Car Sim-Lab Challenge", text: "2021 Temporada 4, división 1. 4.º en la general." },
      { date: "dic 2020", title: "2.º en el BMW 12.0 Challenge", text: "2020 Temporada 4, división 2." },
      { date: "mar 2017", title: "Campeón del club Iberia", text: "2017 Temporada 1, región 4." },
      { date: "dic 2013", title: "Primera victoria en óvalos", text: "iRacing Street Stock Series." },
      { date: "nov 2013", title: "Supera los 5.000 de iRating", text: "En Road." },
      { date: "abr 2012", title: "3.º en la Grand Touring Cup", text: "2012 Temporada 1, división 1." }
    ]
  },

  /* FAQ - "Lo que la gente busca en Google" */
  faqCategories: [
    { id: "personal", name: "Personal", color: "#8b9bb0" },
    { id: "directos", name: "Directos", color: "#009bfe" },
    { id: "simracing", name: "Simracing y setup", color: "#c04cf0" },
    { id: "comunidad", name: "Comunidad y lore", color: "#ea6f18" },
    { id: "web", name: "Sobre StradiFans", color: "#ffd200" }
  ],
  // FAQ: "cat" = category id above; {edad} is replaced by Stradi's current age; optional "link" = page with more info
  faq: [
    { cat: "personal", q: "¿Quién es Stradi?", a: "Javier Soto, streamer español de simracing en Twitch. Corre sobre todo en iRacing y también en Le Mans Ultimate. Ganador de las 24 horas de Nürburgring en iRacing, rey del lunes sin qualy y dueño de un chat que apuesta sus puntos a que no acaba la carrera." },
    { cat: "personal", q: "¿Cómo se llama Stradi de verdad?", a: "Javier Soto." },
    { cat: "personal", q: "¿Cuántos años tiene Stradi?", a: "Tiene {edad} años. Nació el 29 de noviembre de 1981. Experiencia de sobra en pista; la paciencia con los de la F4, ya es otra cosa." },
    { cat: "personal", q: "¿Cuándo es el cumpleaños de Stradi?", a: "El 29 de noviembre. Es Sagitario. En 2026 cumple 45 y la cuenta atrás está arriba del todo de la web." },
    { cat: "personal", q: "¿De dónde es Stradi?", a: "De España. Por eso el directo es en español y los gritos también." },
    { cat: "personal", q: "¿Stradi tiene mascota?", a: "Sí: Trusi, su gata. Es la única del canal con varios emotes propios: Trusi, Trusi1 y Trusi2.", link: "/stradipedia/" },
    { cat: "personal", q: "¿Stradi ha hecho deporte?", a: "Jugó a balonmano muchos años, y se nota: tremendo bíceps. El chat tiene emote para recordárselo.", link: "/stradipedia/" },
    { cat: "personal", q: "¿Stradi es calvo?", a: "El chat lleva años diciéndoselo. Tanto que el canal tiene su propio emote: Calvo. Saca tus propias conclusiones.", link: "/stradipedia/" },
    { cat: "personal", q: "¿Qué coche tiene Stradi en la vida real?", a: "Un Honda Civic Sport Plus 1.5 Turbo de 182 CV, blanco. Su \"nuevo mejor amigo\" desde 2019." },
    { cat: "directos", q: "¿Está Stradi en directo ahora mismo?", a: "Mira la portada: arriba del todo pone si está en directo y, si no, cuánto lleva sin emitir.", link: "/" },
    { cat: "directos", q: "¿Cuántos seguidores tiene Stradi en Twitch?", a: "Más de 57.000. Y en un mes llegó a los 2.000 subs." },
    { cat: "directos", q: "¿A qué juega Stradi?", a: "Sobre todo a iRacing. También corre en Le Mans Ultimate. Coches de GT, resistencias y, cuando toca sufrir, algún fórmula." },
    { cat: "directos", q: "¿Qué es el lunes sin qualy?", a: "Un clásico del canal: cada lunes sale a la qualy con bandera negra y empieza todas las carreras desde el fondo de la parrilla. Mientras remonta, el chat apuesta sus Stradipuntos.", link: "/stradipedia/" },
    { cat: "directos", q: "¿Qué son los Stradipuntos?", a: "Los puntos del canal que ganas viendo el directo. Se apuestan en cada carrera: ganancia de iRating, pérdida de iRating o retirada. Esto no es asesoramiento financiero.", link: "/stradipedia/" },
    { cat: "directos", q: "¿Cuál es el próximo evento del canal?", a: "El Extensible TOTOYIL: el sábado 21 de noviembre a las 13:00 (hora peninsular), de 5 a 24 horas de Toyota GR Cup en iRacing, con sorteos para subs y no subs. Cada sub y cada bit alargan el directo: tú decides cuánto dura.", link: "/" },
    { cat: "directos", q: "¿Dónde más puedo seguir a Stradi?", a: "En YouTube, Instagram, X y TikTok. Tienes todos los enlaces al final de la portada.", link: "/#enlaces" },
    { cat: "simracing", q: "¿Qué volante usa Stradi?", a: "Una base Simagic Alpha EVO Ultra de 28 Nm con dos volantes: el Simagic GT Neo y el Ascher Racing McLaren Artura Ultimate.", link: "/setup/" },
    { cat: "simracing", q: "¿Qué pedales usa Stradi?", a: "Unos SRP GT-R 3P Black Edition de SimRacing Pro. Si alguna vez oyes al chat gritar ESREEEPEEEE, ya sabes por qué.", link: "/stradipedia/" },
    { cat: "simracing", q: "¿Qué PC tiene Stradi?", a: "Para correr, un Ryzen 7 9800X3D con una RTX 5080 y 64 GB de RAM. Para el stream, otro PC aparte. Todo el detalle en Setup.", link: "/setup/" },
    { cat: "simracing", q: "¿Qué ha ganado Stradi en iRacing?", a: "Las 24 horas de Nürburgring junto a SaxoGaming y Keny500, un P2 en las 24 horas de Daytona con JaSoiLRace y Keny500, y podios y victorias en la Porsche All Star.", link: "/lore/" },
    { cat: "simracing", q: "¿Stradi ha corrido contra Verstappen?", a: "Sí, se ha cruzado más de una vez con Max Verstappen en iRacing. De uno de esos encuentros nació el grito de \"Verstappen guarro\".", link: "/stradipedia/" },
    { cat: "simracing", q: "¿Qué le pasó al volante de Fanatec?", a: "No aguantó más golpes y se rompió. Descanse en paz.", link: "/stradipedia/" },
    { cat: "simracing", q: "¿Qué es el piloto de F4?", a: "Stradi imitando al piloto típico de la Fórmula 4: el que acaba de sacarse la licencia D en iRacing y se pasa el día en los fórmulas. Total, de la D ya no se puede volver a Rookie.", link: "/stradipedia/" },
    { cat: "comunidad", q: "¿Quién es Valdeon86?", a: "El ingeniero. En las resistencias le canta el consumo, cuándo entrar a boxes y qué hace el P2. Y alguna vez, \"gas a tope\".", link: "/stradipedia/" },
    { cat: "comunidad", q: "¿Qué significa \"gas a tope\" o \"cuidao con el ahorro\"?", a: "La coña eterna con Valdeon86: o vamos a fondo cuando hay que ahorrar, o ahorramos cuando hay que ir a fondo.", link: "/stradipedia/" },
    { cat: "comunidad", q: "¿Por qué el chat dice \"Santi pesao\"?", a: "Porque santih91 es el rey del cariño en el chat. Cada vez que escribe, el chat le responde lo mismo.", link: "/stradipedia/" },
    { cat: "comunidad", q: "¿Quién es Sergio Tarrias?", a: "Mod del canal y miembro fijo del departamento de chistes. Si hay broma en el chat, probablemente la ha empezado él.", link: "/stradipedia/" },
    { cat: "comunidad", q: "¿Quién es topotamadre_x?", a: "Sub de la casa. Entra, saluda y suelta un chiste de los malos. Malos, pero a veces divertidos.", link: "/stradipedia/" },
    { cat: "comunidad", q: "¿Los rivales de Stradi son actores pagados?", a: "Oficialmente, no. Pero cuando adelanta demasiado fácil, el chat lo tiene claro: paid actors.", link: "/stradipedia/" },
    { cat: "comunidad", q: "¿Por qué Stradi despide a JaSoiLRace y Keny500?", a: "Es la coña de siempre: los despide del equipo. Los mismos con los que se sube al podio.", link: "/stradipedia/" },
    { cat: "comunidad", q: "¿Qué es \"Saxo pide indicaciones\"?", a: "En plenas 24 horas de Nürburgring, SaxoGaming pidió indicaciones por radio. Para muchos, el mejor clip de la historia del canal.", link: "/stradipedia/" },
    { cat: "comunidad", q: "¿Por qué Stradi hace lo que hace?", a: "Escribe !porque en el chat. La respuesta oficial: \"Porque me sale de los huevos\".", link: "/stradipedia/" },
    { cat: "web", q: "¿StradiFans es la web oficial de Stradi?", a: "No. Es una web fan no oficial, hecha por y para la comunidad. Ni Stradi ni Twitch la gestionan." }
  ],

  /* Setup page. Optional "url" per item. */
  setup: [
    { group: "Setup simracing", items: [
      { label: "Cockpit", value: "Next Level Racing GT ELITE", url: "https://tienda.simtechpro.com/tienda/cockpits/next-level-racing-gt-elite/" },
      { label: "Base", value: "Simagic Alpha EVO Ultra 28 Nm", url: "https://tienda.simtechpro.com/tienda/bases-de-volante/simagic-alpha-evo-ultra-28nm/" },
      { label: "Volante", value: "Simagic GT Neo", url: "https://tienda.simtechpro.com/tienda/marca/simagic/" },
      { label: "Volante", value: "Ascher McLaren Artura Ultimate", url: "https://ascher-racing.com/int/shop/mclaren-lenkrader/ascher-racing-mclaren-artura-ultimate/" },
      { label: "Pedales", value: "SRP GT-R 3P Black Edition", url: "https://www.simracing-pro.com/?ref=stradi" },
      { label: "Monitor principal", value: "LG UltraGear 34GN73A" },
      { label: "Monitor secundario", value: "BenQ ZOWIE XL2411P" }
    ]},
    { group: "PC simracing", items: [
      { label: "CPU", value: "AMD Ryzen 7 9800X3D 5.2 GHz Socket AM5" },
      { label: "Placa base", value: "Asus ROG Strix X870E-E Gaming WiFi Socket AM5" },
      { label: "RAM", value: "DDR5 Corsair Vengeance RGB 64 GB (2×32 GB) 6400 MHz CL32" },
      { label: "Gráfica", value: "MSI GeForce RTX 5080 Gaming Trio OC 16 GB GDDR7 DLSS4" },
      { label: "Disco", value: "M.2 Corsair MP700 Pro 2 TB Gen5 PCIe x4 NVMe" },
      { label: "Caja", value: "DeepCool Morpheus Digital Mesh Negro" },
      { label: "Refrigeración", value: "Líquida DeepCool LS720 SE" },
      { label: "Fuente", value: "Corsair RM1000x 80 Plus Gold 1000 W ATX 3.1 PCIe 5.1 Modular" }
    ]},
    { group: "PC stream", items: [
      { label: "CPU", value: "AMD Ryzen 7 5800X 4.7 GHz" },
      { label: "Placa base", value: "Asus ROG Strix X570-E Gaming" },
      { label: "RAM", value: "Corsair Vengeance LPX Black 32 GB" },
      { label: "Gráfica", value: "Asus TUF Gaming GeForce RTX 5060 Ti OC 16 GB GDDR7 DLSS4" },
      { label: "Disco", value: "MP600 Force Series 1 TB PCIe Gen 4.0 x4 NVMe" },
      { label: "Caja", value: "Corsair iCUE 4000X RGB Chasis ATX" },
      { label: "Fuente", value: "Corsair RM850x 80 Plus Gold" }
    ]}
  ],

  /* Where to find him */
  links: [
    { name: "Twitch", url: "https://www.twitch.tv/stradi" },
    { name: "YouTube", url: "https://www.youtube.com/stradi" },
    { name: "Instagram", url: "https://www.instagram.com/stradi_81/" },
    { name: "X", url: "https://x.com/Stradi81" },
    { name: "TikTok", url: "https://www.tiktok.com/@stradi81" }
  ],

  /* "¿Eres el verdadero Stradi?" test. Each answer gives 0-100 Stradi points; the result is the average. */
  quiz: [
    { q: "Es lunes. ¿Cómo sales a la carrera?", a: [
      ["Bandera negra en la qualy y a remontar desde el fondo", 100],
      ["Hago la qualy normal, como una persona seria", 20],
      ["Los lunes no corro", 0] ] },
    { q: "Adelantas a tres coches seguidos y ninguno te pelea la posición. ¿Qué piensas?", a: [
      ["Paid actors. Clarísimo", 100],
      ["Que hoy voy rapidísimo", 25],
      ["Que se han quedado sin ruedas", 60] ] },
    { q: "Valdeon86 te dice por radio que toca ahorrar combustible.", a: [
      ["Gas a tope. Cuidao con el ahorro", 100],
      ["Ahorro exactamente lo que me diga el ingeniero", 45],
      ["¿Qué ingeniero?", 10] ] },
    { q: "Clavas frenos y te salvas de un accidente por centímetros. ¿Qué grita el chat?", a: [
      ["ESREEEPEEEE", 100],
      ["F", 20],
      ["GG", 40] ] },
    { q: "Alguien en el chat pregunta por qué has hecho algo.", a: [
      ["!porque → Porque me sale de los huevos", 100],
      ["Se lo explico con calma y con datos", 15],
      ["Hago como que no lo he leído", 45] ] },
    { q: "Acabáis de hacer podio con Keny500 y JaSoiLRace. ¿Qué haces?", a: [
      ["Los despido del equipo", 100],
      ["Les doy las gracias por la carrera", 30],
      ["Pido que me paguen la gasolina", 55] ] },
    { q: "Te cruzas con Max Verstappen en un server de iRacing.", a: [
      ["Verstappen guarro", 100],
      ["Le pido un autógrafo por el chat", 30],
      ["Me aparto, que es el campeón", 20] ] },
    { q: "santih91 escribe en el chat.", a: [
      ["Santi pesao", 100],
      ["Hola Santi, ¿qué tal?", 50],
      ["¿Quién es Santi?", 0] ] },
    { q: "¿A qué apuestas tus Stradipuntos?", a: [
      ["Retirada. Siempre retirada", 100],
      ["Ganancia de iRating", 60],
      ["No apuesto, soy una persona responsable", 10] ] },
    { q: "Llegas a la meta en P2 de las 24h de Daytona.", a: [
      ["Trompo a propósito en la línea de meta", 100],
      ["Cruzo la meta tranquilamente", 30],
      ["Me quedo sin gasolina a 100 metros", 50] ] },
    { q: "¿Qué coche tienes en el garaje de casa?", a: [
      ["Un Honda Civic blanco, mi mejor amigo", 100],
      ["Un coche cualquiera", 20],
      ["El simulador cuenta como coche", 55] ] },
    { q: "¿De dónde sale ese bíceps?", a: [
      ["De años de balonmano", 100],
      ["Del gimnasio", 35],
      ["De pelearme con el volante de Fanatec hasta romperlo", 75] ] }
  ],

  /* Result tiers for the test (from the highest "min") */
  quizTiers: [
    { min: 90, title: "Stradi certificado", text: "O eres Stradi o vives en su chat. Probablemente las dos cosas.", color: "#ea6f18" },
    { min: 70, title: "Mod de confianza", text: "Te sabes el lore mejor que el propio Stradi. Sergio Tarrias estaría orgulloso.", color: "#009bfe" },
    { min: 50, title: "Sub de la casa", text: "Entras, saludas y te sabes los memes. Nivel topotamadre_x.", color: "#c04cf0" },
    { min: 30, title: "Paid actor", text: "Te dejas adelantar demasiado fácil. Sospechoso.", color: "#2bd96b" },
    { min: 0,  title: "Piloto de F4", text: "Recién sacada la licencia D y sin poder volver a Rookie. Hay que ver más directos.", color: "#8b9bb0" }
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
    "WildSingleWaspPlanking-WVg8LtYdQX4kQHHi",
    "PlausibleRockyTapirTheTarFu-J7deoLWRUY6jA6ke",
    "RacyColorfulWrenAMPEnergyCherry-ilHoofy6sd3G2RR0",
    "CrazyObliviousBadgerHassanChop-YYLDgZ4gdXH5H4M6",
    "DirtyPoorPoultryDAESuppy-rLtd9bOu_9-ZgC8x",
    "AssiduousDignifiedShrimpPMSTwin-NzK1L-doXA-qMDG-"
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
