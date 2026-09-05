require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const config = require("./config/config");
const { answer } = require("./core/brain");
const { videoStatus } = require("./skills/video");
const memory = require("./core/memory");
const { createBackup } = require("./core/backup");

const app = express();

app.use(cors());
app.use(express.json({
  limit: config.maxRequestSize
}));

app.get("/", (req, res) => {
  res.json({
    success: true,
    name: config.name,
    version: config.version,
    status: "online"
  });
});

app.get("/api/jarvis/health", (req, res) => {
  res.json({
    success: true,
    name: "JARVIS",
    status: "online",
    architecture: "Termux user-space",
    rootAccess: false,
    systemPartitionAccess: false,
    providers: config.providers,
    modules: [
      "brain",
      "command-router",
      "memory",
      "backup",
      "cybersecurity",
      "termux",
      "text-to-video",
      "image-to-video",
      "story-to-video",
      "character-animation",
      "voice",
      "image",
      "youtube-analysis",
      "original-remix",
      "device-control"
    ]
  });
});

app.post("/api/jarvis", async (req, res) => {
  try {
    const command = String(req.body.command || "").trim();

    const result = await answer(command, req.body);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post("/api/jarvis/video", async (req, res) => {
  try {
    const result = await answer(
      req.body.prompt || "create video",
      req.body
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get("/api/jarvis/video/:jobId", async (req, res) => {
  try {
    const result = await videoStatus(req.params.jobId);

    res.json({
      success: true,
      jobId: req.params.jobId,
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post("/api/jarvis/youtube/analyze", async (req, res) => {
  try {
    const result = await answer(
      "analyze youtube video",
      {
        url: req.body.url
      }
    );

    res.json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

app.get("/api/jarvis/memory", (req, res) => {
  res.json({
    success: true,
    recent: memory.getRecent(20),
    facts: memory.getFacts(),
    preferences: memory.getPreferences()
  });
});

app.post("/api/jarvis/backup", async (req, res) => {
  try {
    res.json(await createBackup());
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(config.port, config.host, () => {
  console.log("");
  console.log("==============================================");
  console.log("              JARVIS ONLINE");
  console.log("==============================================");
  console.log(`Local API: http://${config.host}:${config.port}`);
  console.log("Root access: DISABLED");
  console.log("System partition: PROTECTED");
  console.log("Termux user-space mode: ENABLED");
  console.log("==============================================");
});
