const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));

const projectsDir = path.join(__dirname, "projects");

if (!fs.existsSync(projectsDir)) {
  fs.mkdirSync(projectsDir, { recursive: true });
}

/* ==========================================
   ANIMATION AI - STORY ENGINE
========================================== */

function cleanTitle(prompt) {
  let title = prompt
    .replace(/एक मजेदार/gi, "")
    .replace(/animated कहानी बनाओ/gi, "")
    .replace(/कहानी बनाओ/gi, "")
    .trim();

  if (title.length > 65) {
    title = title.substring(0, 65).trim();
  }

  return title || "The Unexpected Adventure";
}

function getVideoSettings(aspectRatio, quality) {
  const settings = {
    "16:9": {
      type: "YouTube Landscape",
      resolutions: {
        "720p": "1280x720",
        "1080p": "1920x1080",
        "2K": "2560x1440",
        "4K": "3840x2160"
      }
    },
    "9:16": {
      type: "YouTube Shorts",
      resolutions: {
        "720p": "720x1280",
        "1080p": "1080x1920",
        "2K": "1440x2560",
        "4K": "2160x3840"
      }
    },
    "1:1": {
      type: "Square Video",
      resolutions: {
        "720p": "720x720",
        "1080p": "1080x1080",
        "2K": "1440x1440",
        "4K": "2160x2160"
      }
    }
  };

  const selected = settings[aspectRatio] || settings["16:9"];

  return {
    aspectRatio: aspectRatio || "16:9",
    videoType: selected.type,
    quality: quality || "1080p",
    resolution:
      selected.resolutions[quality || "1080p"] ||
      selected.resolutions["1080p"],
    fps: quality === "4K" ? 60 : 30,
    format: "MP4"
  };
}

function createCharacters() {
  return [
    {
      id: 1,
      name: "Aman",
      role: "Main Character",
      personality: "Funny, energetic, expressive and sometimes lazy",
      voice: "Funny expressive male voice",
      expressions: [
        "Happy",
        "Shocked",
        "Confused",
        "Scared",
        "Laughing"
      ]
    },
    {
      id: 2,
      name: "Riya",
      role: "Best Friend",
      personality: "Smart, sarcastic, funny and quick-thinking",
      voice: "Funny expressive female voice",
      expressions: [
        "Sarcastic smile",
        "Shocked",
        "Laughing",
        "Angry",
        "Confused"
      ]
    },
    {
      id: 3,
      name: "Mr. Sharma",
      role: "Teacher / Supporting Character",
      personality: "Serious but unintentionally funny",
      voice: "Expressive adult male voice",
      expressions: [
        "Angry",
        "Confused",
        "Surprised",
        "Serious"
      ]
    },
    {
      id: 4,
      name: "Narrator",
      role: "Story Narrator",
      personality: "Fast-paced, funny and energetic storyteller",
      voice: "Professional funny narrator voice",
      expressions: []
    }
  ];
}

function createScenes(prompt, duration) {
  return [
    {
      sceneNumber: 1,
      title: "THE CRAZY HOOK",
      duration: "0:00 - 0:25",
      visual:
        "Start immediately with a surprising and funny situation related to the story.",
      narrator:
        "कुछ कहानियाँ इतनी अजीब होती हैं कि सुनकर दिमाग भी पूछता है... भाई, ये हो क्या रहा है?!",
      dialogue: [
        {
          character: "Aman",
          line: "अरे नहीं नहीं नहीं! ये तो बिल्कुल प्लान में नहीं था!"
        },
        {
          character: "Riya",
          line: "तुम्हारे प्लान में कभी कुछ होता भी है क्या?"
        }
      ],
      animation: [
        "Fast camera zoom",
        "Funny facial reaction",
        "Quick movement",
        "Comedic pause"
      ],
      soundEffects: [
        "Funny whoosh",
        "Cartoon surprise sound"
      ]
    },

    {
      sceneNumber: 2,
      title: "THE STORY BEGINS",
      duration: "0:25 - 1:00",
      visual: `Introduce the main character and establish the situation: ${prompt}`,
      narrator:
        "तो कहानी शुरू होती है हमारे महान हीरो अमन से... जो महान काम कम और महान गलतियाँ ज्यादा करता था!",
      dialogue: [
        {
          character: "Aman",
          line: "देखो, इस बार सब कुछ बिल्कुल कंट्रोल में है!"
        },
        {
          character: "Riya",
          line: "तुमने ये पिछली बार भी कहा था... और फिर स्कूल की घंटी छत पर पहुँच गई थी!"
        }
      ],
      animation: [
        "Character entrance",
        "Background movement",
        "Funny reaction close-up"
      ],
      soundEffects: [
        "Cartoon pop",
        "Light comedy music"
      ]
    },

    {
      sceneNumber: 3,
      title: "THE BIG PROBLEM",
      duration: "1:00 - 1:45",
      visual:
        "A major unexpected problem suddenly appears and makes everything chaotic.",
      narrator:
        "लेकिन तभी... ऐसा हुआ जिसकी किसी ने कल्पना भी नहीं की थी!",
      dialogue: [
        {
          character: "Aman",
          line: "रुको... ये चीज़ यहाँ कैसे आ गई?!"
        },
        {
          character: "Riya",
          line: "मैं तो शुरू से कह रही थी कि तुम्हारा आइडिया खतरनाक है!"
        },
        {
          character: "Aman",
          line: "खतरनाक नहीं... experimental था!"
        }
      ],
      animation: [
        "Camera shake",
        "Fast zoom",
        "Multiple shocked reactions"
      ],
      soundEffects: [
        "Boom",
        "Record scratch",
        "Funny panic sound"
      ]
    },

    {
      sceneNumber: 4,
      title: "THE FUNNY CHAOS",
      duration: "1:45 - 2:35",
      visual:
        "Characters try different ridiculous solutions, but every attempt makes the situation worse.",
      narrator:
        "और अब शुरू हुआ वो मिशन... जिसमें प्लान कम और पागलपन ज्यादा था!",
      dialogue: [
        {
          character: "Aman",
          line: "मेरे पास एक शानदार प्लान है!"
        },
        {
          character: "Riya",
          line: "बस यही सुनना बाकी था..."
        },
        {
          character: "Aman",
          line: "पहले हम इसे दबाएँगे!"
        },
        {
          character: "Riya",
          line: "और अगर दबाने से ये और बड़ा हो गया तो?"
        },
        {
          character: "Aman",
          line: "...तो फिर दूसरा प्लान!"
        }
      ],
      animation: [
        "Slapstick comedy movement",
        "Fast cuts",
        "Funny expressions",
        "Physical comedy"
      ],
      soundEffects: [
        "Boing",
        "Slide whistle",
        "Funny fall sound"
      ]
    },

    {
      sceneNumber: 5,
      title: "THE SECRET DISCOVERY",
      duration: "2:35 - 3:25",
      visual:
        "The characters discover an unexpected clue that changes their understanding of the problem.",
      narrator:
        "लेकिन तभी रिया की नजर एक ऐसी चीज़ पर पड़ी... जिसने पूरी कहानी पलट दी!",
      dialogue: [
        {
          character: "Riya",
          line: "रुको... मुझे लगता है मुझे कुछ समझ आया है!"
        },
        {
          character: "Aman",
          line: "वाह! मुझे भी कुछ समझ आया है!"
        },
        {
          character: "Riya",
          line: "क्या?"
        },
        {
          character: "Aman",
          line: "कि मुझे कुछ भी समझ नहीं आया!"
        }
      ],
      animation: [
        "Mystery zoom",
        "Close-up on clue",
        "Sudden funny reaction"
      ],
      soundEffects: [
        "Mystery sting",
        "Funny reveal sound"
      ]
    },

    {
      sceneNumber: 6,
      title: "THE FINAL PLAN",
      duration: "3:25 - 4:20",
      visual:
        "The characters create their final plan with fast-paced comedy and unexpected obstacles.",
      narrator:
        "अब था आखिरी मौका... या तो सब ठीक होता, या फिर अमन का रिकॉर्ड एक और महान गलती से भर जाता!",
      dialogue: [
        {
          character: "Aman",
          line: "इस बार प्लान 100% काम करेगा!"
        },
        {
          character: "Riya",
          line: "तुम्हारा confidence देखकर मुझे डर लग रहा है!"
        }
      ],
      animation: [
        "Fast action montage",
        "Running animation",
        "Camera tracking",
        "Comedy timing"
      ],
      soundEffects: [
        "Running sounds",
        "Whoosh",
        "Impact sounds"
      ]
    },

    {
      sceneNumber: 7,
      title: "THE BIG FUNNY TWIST",
      duration: "4:20 - END",
      visual:
        "Everything appears solved, but a final unexpected and hilarious twist happens.",
      narrator:
        "और जब सबको लगा कि आखिरकार सब ठीक हो गया है...",
      dialogue: [
        {
          character: "Aman",
          line: "देखा! मैंने कहा था ना, मैं genius हूँ!"
        },
        {
          character: "Riya",
          line: "हाँ... बस दुनिया को अभी तक पता नहीं चला!"
        },
        {
          character: "Mr. Sharma",
          line: "अमन!!!"
        },
        {
          character: "Aman",
          line: "ओह... लगता है दुनिया को पता चल गया!"
        }
      ],
      animation: [
        "Final reaction zoom",
        "Funny freeze frame",
        "Fast ending",
        "End card"
      ],
      soundEffects: [
        "Record scratch",
        "Funny ending sting",
        "Audience laugh"
      ]
    }
  ];
}

function createThumbnail(title, prompt) {
  return {
    generatedByAI: true,
    concept:
      "Create a highly expressive funny moment from the story with strong facial reactions and dramatic composition.",
    mainText: title.substring(0, 35),
    style:
      "Bright animated YouTube thumbnail, expressive faces, high contrast, dramatic reaction, clean composition",
    characters: [
      "Aman with shocked funny face",
      "Riya laughing or reacting dramatically"
    ],
    background:
      "The most chaotic and interesting moment from the story",
    recommendedSize: "1280x720",
    prompt: `YouTube thumbnail for animated comedy story: ${prompt}`
  };
}

function createProject(data) {
  const prompt = data.prompt.trim();

  const videoSettings = getVideoSettings(
    data.aspectRatio || "16:9",
    data.quality || "1080p"
  );

  const projectId =
    "animation_" +
    Date.now() +
    "_" +
    Math.random().toString(36).substring(2, 8);

  const title = data.title || cleanTitle(prompt);

  return {
    id: projectId,
    title,
    prompt,
    duration: data.duration || "5 minutes",
    language: data.language || "Hindi",
    voiceMode: data.voiceMode || "automatic",

    videoSettings,

    characters: createCharacters(),

    script: {
      style:
        "Original fast-paced funny animated storytelling with expressive reactions and unexpected twists",
      hook:
        "Start with a surprising moment within the first few seconds.",
      retentionStrategy: [
        "Strong opening hook",
        "Fast scene progression",
        "Funny dialogue",
        "Reaction moments",
        "Unexpected twists",
        "Strong ending"
      ],
      scenes: createScenes(prompt, data.duration)
    },

    thumbnail: createThumbnail(title, prompt),

    productionPipeline: {
      story: "completed",
      script: "completed",
      characters: "completed",
      scenePlanning: "completed",
      voiceGeneration: "pending",
      imageGeneration: "pending",
      animation: "pending",
      soundEffects: "pending",
      videoRendering: "pending",
      thumbnailGeneration: "planned"
    },

    finalOutput: {
      format: "MP4",
      status: "VIDEO GENERATION ENGINE NOT CONNECTED YET",
      downloadUrl: null
    },

    createdAt: new Date().toISOString()
  };
}

/* ==========================================
   API
========================================== */

app.get("/api/status", (req, res) => {
  res.json({
    success: true,
    message: "Animation AI Production Server is running!",
    version: "3.0",
    features: [
      "Story generation",
      "Professional script",
      "Character system",
      "Dialogue generation",
      "Scene planning",
      "Voice planning",
      "Frame size selection",
      "Quality selection",
      "Thumbnail planning"
    ]
  });
});

app.post("/generate", (req, res) => {
  try {
    const data = req.body;

    if (!data || !data.prompt || !data.prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: "Please enter a story prompt."
      });
    }

    const project = createProject(data);

    const projectPath = path.join(
      projectsDir,
      `${project.id}.json`
    );

    fs.writeFileSync(
      projectPath,
      JSON.stringify(project, null, 2)
    );

    res.json({
      success: true,
      message: "Professional animation project created successfully!",
      project
    });

  } catch (error) {
    console.error("Generation error:", error);

    res.status(500).json({
      success: false,
      error: error.message || "Project generation failed."
    });
  }
});

app.get("/api/projects", (req, res) => {
  try {
    const files = fs
      .readdirSync(projectsDir)
      .filter(file => file.endsWith(".json"));

    const projects = files.map(file => {
      const content = fs.readFileSync(
        path.join(projectsDir, file),
        "utf8"
      );

      return JSON.parse(content);
    });

    res.json({
      success: true,
      projects
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get("/api/project/:id", (req, res) => {
  try {
    const file = path.join(
      projectsDir,
      `${req.params.id}.json`
    );

    if (!fs.existsSync(file)) {
      return res.status(404).json({
        success: false,
        error: "Project not found."
      });
    }

    const project = JSON.parse(
      fs.readFileSync(file, "utf8")
    );

    res.json({
      success: true,
      project
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/* ==========================================
   VIDEO PIPELINE PLACEHOLDER
   NEXT STEP WILL CONNECT:
   VOICE + IMAGES + ANIMATION + FFmpeg
========================================== */

app.post("/api/render/:id", async (req, res) => {
  res.json({
    success: false,
    message:
      "Rendering engine is the next module being installed.",
    nextPipeline: [
      "Generate character voices",
      "Generate scene visuals",
      "Create animation clips",
      "Add sound effects",
      "Render final MP4"
    ]
  });
});

/* ==========================================
   FRONTEND FALLBACK
========================================== */

app.use((req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "index.html")
  );
});

/* ==========================================
   START SERVER
========================================== */

app.listen(PORT, "0.0.0.0", () => {
  console.log("\n====================================");
  console.log("🎬 Animation AI v3.0 is running!");
  console.log("🌍 Production server enabled");
  console.log(`📍 Port: ${PORT}`);
  console.log("🎭 Story Engine: ACTIVE");
  console.log("📝 Script Engine: ACTIVE");
  console.log("🎬 Video Engine: NEXT STEP");
  console.log("====================================\n");
});
