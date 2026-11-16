# StradiFans

Unofficial fan hub for the Twitch streamer Stradi: live status, glossary, tools, soundboard, lore timeline, vault and FAQ.

Created by Vznum - v0.1.1

## Structure

- `index.html` - page layout
- `styles.css` - design (brand colors in `:root`)
- `app.js` - logic (live check, filters, tools)
- `data.js` - **all the content**: edit this file to add lore, glossary entries, sounds, timeline, FAQ and links
- `sounds/` - mp3 clips for the soundboard
- `vault/` - images for the vault

## Run locally

Open `index.html` in a browser, or run any static server (e.g. `npx serve .`).

## Deploy (Vercel)

Static site (Framework preset: "Other", no build command), hosted at https://stradifans.vercel.app.
The Vercel project is connected to this repository, so every push to `main` is published automatically.
On Windows, `publish.bat` commits the changes and pushes them.

## Live status

Uses the public `decapi.me` uptime endpoint for the Twitch channel, refreshed every 2 minutes. When the channel is live, the Twitch player is embedded automatically.

## Disclaimer

Unofficial fan site. Not run by Stradi and not affiliated with Twitch, iRacing or Le Mans Ultimate.
