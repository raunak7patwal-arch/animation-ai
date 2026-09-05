const {
  wavespeedSubmit,
  wavespeedResult
} = require("../../api/providers");

async function textToVideo(input) {
  if (!process.env.WAVESPEED_API_KEY) {
    return {
      success: false,
      provider: "wavespeed",
      status: "missing-or-empty-credits",
      message: "WaveSpeed API key/credits are not available."
    };
  }

  const prompt = String(input.prompt || "").trim();

  if (!prompt) {
    throw new Error("Video prompt is required.");
  }

  const duration = [5, 8].includes(Number(input.duration))
    ? Number(input.duration)
    : 5;

  const task = await wavespeedSubmit(
    "wavespeed-ai/wan-2.2/t2v-480p-ultra-fast",
    {
      prompt,
      duration,
      size: input.size || "832*480",
      seed: Number.isInteger(input.seed) ? input.seed : -1
    }
  );

  return {
    success: true,
    provider: "wavespeed",
    jobId: task.id,
    status: task.status || "created"
  };
}

async function videoStatus(jobId) {
  return wavespeedResult(jobId);
}

module.exports = {
  textToVideo,
  videoStatus
};
