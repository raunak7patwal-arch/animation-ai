require("dotenv").config();

module.exports = {
  name: "JARVIS",
  version: "1.0.0",

  host: process.env.JARVIS_HOST || "127.0.0.1",
  port: Number(process.env.JARVIS_PORT || 3010),

  maxMemoryItems: Number(process.env.JARVIS_MAX_MEMORY || 500),
  maxRequestSize: process.env.JARVIS_MAX_REQUEST || "2mb",

  providers: {
    wavespeed: Boolean(process.env.WAVESPEED_API_KEY),
    fal: Boolean(process.env.FAL_KEY),
    huggingface: Boolean(process.env.HF_TOKEN)
  },

  security: {
    rootMode: false,
    systemPartitionAccess: false,
    arbitraryShell: false,
    destructiveActionsRequireConfirmation: true
  }
};
