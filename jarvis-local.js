const fs = require("fs");
const readline = require("readline");
const path = require("path");

const DATA = path.join(__dirname, "jarvis", "memory");
fs.mkdirSync(DATA, { recursive: true });

const memoryFile = path.join(DATA, "local-memory.json");

let memory = {};
if (fs.existsSync(memoryFile)) {
  try { memory = JSON.parse(fs.readFileSync(memoryFile, "utf8")); }
  catch { memory = {}; }
}

function saveMemory() {
  fs.writeFileSync(memoryFile, JSON.stringify(memory, null, 2));
}

function think(input) {
  input = input.replace(/^\\s*JARVIS\\s*>\\s*/i, "").trim();
  const text = input.toLowerCase().trim();

  if (text === "exit" || text === "quit" || text === "बंद हो जाओ") {
    return "__EXIT__";
  }

  if (
    text.includes("hello") ||
    text.includes("hi") ||
    text.includes("हेलो") ||
    text.includes("नमस्ते")
  ) {
    return "नमस्ते सर। JARVIS ऑनलाइन है। बताइए क्या करना है?";
  }

  if (text.includes("नाम") || text.includes("name")) {
    return "मेरा नाम JARVIS है। मैं आपका local AI assistant हूँ।";
  }

  if (text.includes("तुम कौन") || text.includes("who are you")) {
    return "मैं JARVIS हूँ — अभी मेरा local brain शुरुआती अवस्था में है, लेकिन इसे हम धीरे-धीरे अपना AI बना सकते हैं।";
  }

  if (text.includes("समय") || text.includes("time")) {
    return `अभी समय ${new Date().toLocaleTimeString("hi-IN")} है।`;
  }

  if (text.startsWith("याद रखो ")) {
    const fact = input.slice(9).trim();

    if (!fact) return "क्या याद रखना है सर?";

    const id = Date.now();
    memory[id] = fact;
    saveMemory();

    return `ठीक है सर। मैंने याद रख लिया: ${fact}`;
  }

  if (
    text.includes("क्या याद") ||
    text.includes("मेरी memory") ||
    text.includes("what do you remember")
  ) {
    const values = Object.values(memory);

    if (!values.length) {
      return "अभी मेरी memory खाली है।";
    }

    return "मुझे यह बातें याद हैं:\n- " + values.join("\n- ");
  }

  if (text.includes("जोड़") || text.includes("add")) {
    return "समझ गया। यह command आगे मेरे task system को भेजी जा सकती है।";
  }

  if (text.includes("वीडियो") || text.includes("video")) {
    return "Video command समझ गया। अभी मैं इसे local video engine को भेजने के लिए तैयार हूँ।";
  }

  if (text.includes("साइबर") || text.includes("cyber") || text.includes("linux")) {
    return "Cybersecurity mode तैयार है। Authorized testing, Linux, networking और security tasks पर काम कर सकते हैं।";
  }

  if (text.includes("धन्यवाद") || text.includes("thanks")) {
    return "Anytime, सर.";
  }

  return `मैंने सुना: "${input}"\nअभी मेरे local brain को इस विषय की जानकारी नहीं है। इसे अपने knowledge/data से train किया जा सकता है।`;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "JARVIS > "
});

console.log("");
console.log("================================");
console.log("       JARVIS LOCAL AI");
console.log("================================");
console.log("Paid API: OFF");
console.log("Cloud AI: OFF");
console.log("Local Memory: ON");
console.log("Type 'exit' to stop.");
console.log("");

rl.prompt();

rl.on("line", (input) => {
  const answer = think(input);

  if (answer === "__EXIT__") {
    console.log("JARVIS: Goodbye, सर.");
    rl.close();
    return;
  }

  console.log("\nJARVIS:", answer, "\n");
  rl.prompt();
});

rl.on("close", () => process.exit(0));
