# StradiFans

Unofficial fan hub for the Spanish sim racing streamer [Stradi](https://www.twitch.tv/stradi): live status, live chat, chat meter, clip roulette, glossary, soundboard, lore timeline and more. The site itself is in Spanish.

Created by Vznum - v1.19.1 - https://stradifans.vercel.app

## Structure

- `index.html` - home page
- `stradipedia/`, `garaje/`, `radio/`, `lore/`, `baul/`, `faq/` - one page per section
- `garaje/medidor-chat/` - chat meter (top 5 things the chat spams, live)
- `garaje/ruleta-clips/` - clip roulette
- `garaje/eres-stradi/` - "Are you the real Stradi?" quiz
- `garaje/tracker-directos/`, `tracker.js`, `tracker-data.js` - stream tracker: every stream day since April 2020
- `styles.css` - design (brand colors in `:root`)
- `data.js` - **all the content**: lore, glossary, sounds, timeline, FAQ, links, clip tiers
- `common.js` - shared header, menu, footer, live badge, birthday banner
- `chat.js` - read-only Twitch chat client (anonymous IRC over WebSocket) with Twitch + 7TV emotes
- `meter.js` - chat word/emote counter
- `app.js` - page logic (each block runs only on the page that has its elements)
- `vercel.json` - trailing slashes and redirects from old URLs
- `api/clips.js` - Vercel serverless function that returns the channel's clips from the Twitch API
- `assets/` - logo and favicon
- `sounds/` - mp3 clips for the soundboard
- `vault/` - images for the vault

## Clip roulette setup

The roulette needs a Twitch application:

1. Create an app at https://dev.twitch.tv/console/apps (OAuth redirect URL: `http://localhost`, category: Website Integration).
2. In the Vercel project, go to Settings > Environment Variables and add `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET`.
3. Redeploy.

## Deploy

Static site + one serverless function on Vercel. The Vercel project is connected to this repository, so every push to `main` is published automatically.

## Disclaimer

Unofficial fan site. Not run by Stradi and not affiliated with Twitch, iRacing or Le Mans Ultimate.
