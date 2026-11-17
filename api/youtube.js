/* StradiFans - Stradi's latest YouTube videos, from the channel's public feed (no API key needed).
   Uses the "long videos only" uploads playlist, so Shorts don't take the spots; falls back to all uploads.
   Response (cached 30 min at the edge): { videos: [{ id, title, published, thumb, url }] } */
const CHANNEL = "UCkdCRv-q-Z4NbzMEcstqICw"; // youtube.com/stradi

const decode = (s) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

function parse(xml) {
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((m) => {
    const e = m[1];
    const id = (/<yt:videoId>([^<]+)</.exec(e) || [])[1];
    const title = (/<title>([^<]*)<\/title>/.exec(e) || [])[1] || "";
    const published = (/<published>([^<]+)</.exec(e) || [])[1] || "";
    return id ? { id, title: decode(title), published, thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, url: `https://www.youtube.com/watch?v=${id}` } : null;
  }).filter(Boolean);
}

module.exports = async (req, res) => {
  try {
    const feeds = [
      `https://www.youtube.com/feeds/videos.xml?playlist_id=UULF${CHANNEL.slice(2)}`,
      `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL}`
    ];
    let videos = [];
    for (const f of feeds) {
      const r = await fetch(f);
      if (r.ok) videos = parse(await r.text());
      if (videos.length) break;
    }
    if (!videos.length) throw new Error("empty");
    videos.sort((a, b) => Date.parse(b.published) - Date.parse(a.published));
    res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=86400");
    res.status(200).json({ videos: videos.slice(0, 6) });
  } catch (err) {
    res.status(502).json({ error: "youtube_error" });
  }
};
