/* ==========================================================================
   StradiFans - content file
   Everything the site shows lives here. Edit this file to add lore,
   glossary entries, timeline milestones, sounds, FAQ answers, etc.
   Entries marked "PENDIENTE" are placeholders waiting for real content.
   ========================================================================== */

window.SITE = {
  version: "1.1.0",
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
    { label: "Su volante", value: "Artura Ultimate", note: "Ascher Racing McLaren" },
    { label: "Sus pedales", value: "SRP GT-R", note: "3P Black Edition" },
    { label: "Seguidores", value: "57K+", note: "en Twitch" }
  ],

  /* Stradipedia. Rarity uses iRacing license classes: R, D, C, B, A, PRO.
     Optional "clip": link to a Twitch clip ("clipAlt" + "clipAltLabel" for a second one).
     Optional "emote": image URL shown on the card. Optional "link" + "linkLabel": any other link. */
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
      clip: "https://www.twitch.tv/stradi/clip/StupidBumblingToothDBstyle-I4sRk2Af_5UBMwJo"
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
      text: "Su coche de verdad: un Honda Civic Sport Plus 1.5 Turbo de 182 CV, blanco. Su \"nuevo mejor amigo\" desde 2019."
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
    { sort: "2026-11-29", date: "29 nov 2026", title: "46 años", text: "El paddock entero celebra el cumple de Stradi." }
  ],

  /* Baúl (memes / edits / fan art). Put images in /vault. Fields: title, image, note (optional). */
  vault: [
    { title: "Jodemos tu vuelta", image: "/vault/jodemos-tu-vuelta.png", note: "JodemosTuVuelta.Stradi.es" }
  ],

  /* FAQ - "Lo que la gente busca en Google" */
  faq: [
    { q: "¿Está Stradi en directo ahora mismo?", a: "Mira la portada. Hay una sección entera para eso." },
    { q: "¿Por qué sale último los lunes?", a: "Es el lunes sin qualy: sale a clasificar con bandera negra para empezar desde el fondo. Es a propósito. Casi siempre." },
    { q: "¿Los rivales son actores pagados?", a: "Oficialmente, no. Extraoficialmente, mira el clip de los paid actors en la Stradipedia y juzga tú." },
    { q: "¿A qué apuesto mis Stradipuntos?", a: "Ganancia de iRating, pérdida de iRating o retirada. Esto no es asesoramiento financiero." },
    { q: "¿Quién es Valdeon86?", a: "El ingeniero. Consumo, ventanas de boxes, tiempos del P2. Y algún que otro \"gas a tope\"." },
    { q: "¿Qué coche tiene?", a: "Un Honda Civic Sport Plus 1.5 Turbo de 182 CV, blanco. Desde 2019 es su \"nuevo mejor amigo\"." },
    { q: "¿Qué volante usa?", a: "Base Simagic Alpha EVO Ultra con volantes Simagic GT Neo y Ascher McLaren Artura Ultimate. Todo su setup está en la página Setup." },
    { q: "¿Por qué hace lo que hace?", a: "Escribe !porque en el chat y te lo explica él mismo." }
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
