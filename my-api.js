
require("dotenv").config();

const express = require("express");

const app = express();
app.use(express.json({ limit: "2mb" }));

const PORT = process.env.PORT || 3000;

const WAVESPEED_URL =
  "https://api.wavespeed.ai/api/v3/wavespeed-ai/wan-2.2/t2v-480p-ultra-fast";

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    api: "Animation AI Unified API",
    provider: "WaveSpeedAI",
    status: "ready"
  });
});

app.post("/api/video/text", async (req, res) => {
  try {
    const { prompt, duration = 5, size = "832*480" } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: "prompt is required"
      });
    }

    if (!process.env.WAVESPEED_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "WAVESPEED_API_KEY is missing in .env"
      });
    }

    const response = await fetch(WAVESPEED_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.WAVESPEED_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: prompt.trim(),
        duration: Number(duration),
        size,
        seed: -1
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        provider: "wavespeed",
        error: data
      });
    }

    const task = data.data || data;

    res.json({
      success: true,
      provider: "wavespeed",
      jobId: task.id,
      status: task.status || "created",
      message: "Video generation job submitted"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get("/api/video/status/:jobId", async (req, res) => {
  try {
    if (!process.env.WAVESPEED_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "WAVESPEED_API_KEY is missing in .env"
      });
    }

    const url =
      `https://api.wavespeed.ai/api/v3/predictions/${encodeURIComponent(req.params.jobId)}/result`;

    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${process.env.WAVESPEED_API_KEY}`
      }
    });

    const data = await response.json();

    res.status(response.ok ? 200 : response.status).json({
      success: response.ok,
      provider: "wavespeed",
      data: data.data || data
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Animation AI Unified API running on port ${PORT}`);
});
