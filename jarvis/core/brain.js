const {
  detectIntent,
  makePlan
} = require("./router");

const memory = require("./memory");
const security = require("./security");
const termux = require("../tools/termux");
const video = require("../skills/video");
const youtube = require("../skills/youtube");
const backup = require("./backup");

async function answer(command, body = {}) {
  const text = String(command || "").trim();

  if (!text) {
    return {
      success: false,
      error: "command is required"
    };
  }

  const intent = detectIntent(text);
  const plan = makePlan(intent, text);

  let result = null;

  if (intent === "text-to-video") {
    result = await video.textToVideo({
      prompt: body.prompt || text,
      duration: body.duration,
      size: body.size,
      seed: body.seed
    });
  }

  else if (intent === "youtube-analysis") {
    result = youtube.analyzeUrl(body.url || text);
  }

  else if (intent === "backup") {
    result = await backup.createBackup();
  }

  else if (intent === "device") {
    const cmd = String(body.command || "").trim();

    const check = security.inspectCommand(cmd);

    if (!check.allowed) {
      result = {
        success: false,
        blocked: true,
        requiresConfirmation: check.requiresConfirmation,
        reason: check.reason
      };
    } else {
      const parts = cmd.split(/\s+/);
      result = await termux.runSafe(parts.shift(), parts);
    }
  }

  else if (intent === "cybersecurity") {
    result = {
      mode: "cybersecurity",
      status: "ready",
      scope: "authorized labs, defensive security and legitimate testing",
      capabilities: [
        "Linux/Termux",
        "networking",
        "HTTP/DNS",
        "Nmap concepts",
        "Wireshark analysis",
        "Python/Bash",
        "CTF/lab assistance",
        "vulnerability analysis",
        "secure coding",
        "log analysis"
      ],
      answer:
        "Cybersecurity mode is active. Give JARVIS the exact technical question, error, lab target or code."
    };
  }

  else {
    result = {
      mode: "chat",
      answer:
        "JARVIS core is online. Connect an LLM provider in .env for full natural-language reasoning."
    };
  }

  const response = {
    success: true,
    name: "JARVIS",
    intent,
    plan,
    result,
    timestamp: new Date().toISOString()
  };

  memory.rememberConversation(text, JSON.stringify(response));

  return response;
}

module.exports = { answer };
