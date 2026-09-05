function extractVideoId(url) {
  const value = String(url || "").trim();

  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/i,
    /youtu\.be\/([^?&]+)/i,
    /youtube\.com\/shorts\/([^?&]+)/i
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match) return match[1];
  }

  return null;
}

function analyzeUrl(url) {
  const videoId = extractVideoId(url);

  if (!videoId) {
    throw new Error("Invalid YouTube URL.");
  }

  return {
    success: true,
    videoId,
    source: url,
    mode: "permitted-metadata-analysis",
    analysis: {
      scenes: [],
      topics: [],
      structure: [],
      pacing: [],
      originalRemixIdeas: []
    },
    note:
      "URL-only mode does not download or reproduce third-party video. Authorized media can be supplied separately for deeper processing."
  };
}

module.exports = { extractVideoId, analyzeUrl };
