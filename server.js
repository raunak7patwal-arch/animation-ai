const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/status", (req, res) => {
  res.json({
    success: true,
    message: "Animation AI server is running!",
    version: "2.0"
  });
});

function createCharacters() {
  return [
    {
      id: 1,
      name: "Aman",
      role: "Main Character",
      personality: "Funny and energetic",
      suggestedVoice: "Funny Male"
    },
    {
      id: 2,
      name: "Riya",
      role: "Friend",
      personality: "Smart and sarcastic",
      suggestedVoice: "Funny Female"
    },
    {
      id: 3,
      name: "Narrator",
      role: "Narrator",
      personality: "Expressive storyteller",
      suggestedVoice: "Story Narrator"
    }
  ];
}

function createScenes(prompt, duration) {
  const scenes = [
    ["Introduction", `Story starts with: ${prompt}`],
    ["Problem", "A strange and funny problem suddenly appears."],
    ["Discovery", "The characters discover something unexpected."],
    ["Funny Moment", "A funny mistake changes everything."],
    ["Plan", "The characters create a plan."],
    ["Twist", "An unexpected twist appears."],
    ["Ending", "The problem is solved with a funny ending."]
  ];

  if (duration === "10 minutes") {
    scenes.push(
      ["Adventure", "A new adventure begins."],
      ["Conflict", "The plan goes wrong."],
      ["Solution", "They find a creative solution."],
      ["Final Twist", "One last surprise appears."]
    );
  }

  return scenes.map((scene, index) => ({
    sceneNumber: index + 1,
    type: scene[0],
    description: scene[1]
  }));
}

app.post("/generate", (req, res) => {
  const { prompt, duration = "5 minutes", voiceMode = "automatic" } = req.body;

  if (!prompt || !prompt.trim()) {
    return res.status(400).json({
      success: false,
      error: "Please enter a prompt"
    });
  }

  const characters = createCharacters().map(character => ({
    ...character,
    voice: character.suggestedVoice
  }));

  const scenes = createScenes(prompt, duration);

  res.json({
    success: true,
    project: {
      title: prompt.substring(0, 60),
      prompt,
      duration,
      voiceMode,
      characters,
      scenes,
      status: "Story and scenes generated successfully"
    }
  });
});

app.listen(process.env.PORT || 3000, "0.0.0.0", () => {
  console.log("\n🎬 Animation AI v2.0 is running!");
  console.log("📍 http://127.0.0.1:3000\n");
});
