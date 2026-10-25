
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method tidak diizinkan."
    });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "API key belum dikonfigurasi di server."
    });
  }

  const { url } = req.body || {};

  if (typeof url !== "string" || url.length > 2048) {
    return res.status(400).json({
      error: "URL tidak valid."
    });
  }

  let parsed;

  try {
    parsed = new URL(url);
  } catch {
    return res.status(400).json({
      error: "Format URL tidak valid."
    });
  }

  const host = parsed.hostname.toLowerCase();

  const allowedHosts = [
    "youtube.com",
    "www.youtube.com",
    "m.youtube.com",
    "youtu.be",
    "www.youtube-nocookie.com"
  ];

  if (!allowedHosts.includes(host)) {
    return res.status(400).json({
      error: "Masukkan tautan YouTube yang valid."
    });
  }

  let videoId;

  if (host === "youtu.be") {
    videoId = parsed.pathname.split("/").filter(Boolean)[0];
  } else if (host === "www.youtube-nocookie.com") {
    videoId = parsed.pathname.split("/").filter(Boolean).at(-1);
  } else {
    videoId = parsed.searchParams.get("v");

    if (!videoId) {
      const parts = parsed.pathname.split("/").filter(Boolean);

      if (["shorts", "embed", "live"].includes(parts[0])) {
        videoId = parts[1];
      }
    }
  }

  if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return res.status(400).json({
      error: "ID video tidak ditemukan di URL."
    });
  }

  try {
    const endpoint = new URL(
      "https://www.googleapis.com/youtube/v3/videos"
    );

    endpoint.searchParams.set("part", "snippet,contentDetails");
    endpoint.searchParams.set("id", videoId);
    endpoint.searchParams.set("key", apiKey);

    const response = await fetch(endpoint);

    if (!response.ok) {
      return res.status(502).json({
        error: "Gagal mengambil data dari YouTube API."
      });
    }

    const data = await response.json();
    const video = data.items?.[0];

    if (!video) {
      return res.status(404).json({
        error: "Video tidak ditemukan atau tidak tersedia."
      });
    }

    return res.status(200).json({
      id: video.id,
      title: video.snippet.title,
      channel: video.snippet.channelTitle,
      thumbnail:
        video.snippet.thumbnails.high?.url ||
        video.snippet.thumbnails.default?.url,
      duration: video.contentDetails.duration
    });
  } catch {
    return res.status(502).json({
      error: "Server gagal menghubungi YouTube API."
    });
  }
      }
