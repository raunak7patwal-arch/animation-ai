
/* ==========================================================
   SPEED-FIRST ENGINE ENABLED
   Existing generation features remain untouched.
   ========================================================== */
process.env.ANIMATION_FAST_MODE =
  process.env.ANIMATION_FAST_MODE || "true";

process.env.ANIMATION_CONCURRENCY =
  process.env.ANIMATION_CONCURRENCY || "2";

process.env.ANIMATION_AVOID_DUPLICATE_ENCODE =
  process.env.ANIMATION_AVOID_DUPLICATE_ENCODE || "true";

console.log("⚡ SPEED-FIRST ENGINE: ACTIVE");

const express = require("express");
const {installAnimationAPI}=require('./JARVIS/animation/api');
const cors = require("cors");
const path = require("path");

const { generateVideo } = require("./video-engine");

const app = express();

// ===== PRODUCTION API HEALTH CHECK =====
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    engine: "Animation AI Backend",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    engine: "Animation AI Backend"
  });
});

const PORT = process.env.PORT || 3000;

/* ==========================================
   MIDDLEWARE
========================================== */

app.use(cors());
app.use(express.json({ limit: "50mb" }));

installAnimationAPI(app);
app.use(express.urlencoded({ extended: true }));

/* ==========================================
   STATIC FILES
========================================== */

app.use(express.static(path.join(__dirname, "public")));

app.use(
  "/output",
  express.static(path.join(__dirname, "output"))
);

app.use(
  "/audio",
  express.static(path.join(__dirname, "audio"))
);

/* ==========================================
   HEALTH CHECK
========================================== */

app.get("/api/status", (req, res) => {
  res.json({
    success: true,
    app: "Animation AI",
    version: "3.0",
    status: "online",
    engines: {
      story: true,
      script: true,
      video: true
    }
  });
});

/* ==========================================
   STORY GENERATION
========================================== */

app.post("/generate", (req, res) => {
  try {
    const {
      prompt,
      duration = "5 minutes",
      voiceMode = "automatic"
    } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: "Please enter a story prompt"
      });
    }

    const project = {
      title: prompt.substring(0, 60),
      prompt,
      duration,
      voiceMode,

      characters: [
        {
          id: 1,
          name: "Aman",
          role: "Main Character",
          personality: "Funny and energetic",
          suggestedVoice: "Funny Male",
          voice: "Funny Male"
        },
        {
          id: 2,
          name: "Riya",
          role: "Friend",
          personality: "Smart and sarcastic",
          suggestedVoice: "Funny Female",
          voice: "Funny Female"
        },
        {
          id: 3,
          name: "Narrator",
          role: "Narrator",
          personality: "Expressive storyteller",
          suggestedVoice: "Story Narrator",
          voice: "Story Narrator"
        }
      ],

      scenes: [
        {
          sceneNumber: 1,
          type: "Introduction",
          description: `Story begins: ${prompt}`
        },
        {
          sceneNumber: 2,
          type: "Problem",
          description: "A strange and funny problem suddenly appears."
        },
        {
          sceneNumber: 3,
          type: "Discovery",
          description: "The characters discover something unexpected."
        },
        {
          sceneNumber: 4,
          type: "Funny Moment",
          description: "A funny mistake changes everything."
        },
        {
          sceneNumber: 5,
          type: "Plan",
          description: "The characters create a crazy plan."
        },
        {
          sceneNumber: 6,
          type: "Twist",
          description: "An unexpected twist surprises everyone."
        },
        {
          sceneNumber: 7,
          type: "Ending",
          description: "The story ends with a big funny surprise."
        }
      ],

      status: "Story and scenes generated successfully"
    };

    res.json({
      success: true,
      project
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


/* ==========================================
   VIDEO JOB QUEUE — STABILITY SYSTEM
========================================== */

const videoJobs = new Map();
const videoQueue = [];

let videoWorkerRunning = false;

function createJobId() {
  return (
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2, 10)
  );
}

async function processVideoQueue() {

  if (videoWorkerRunning) return;

  videoWorkerRunning = true;

  console.log("🟢 VIDEO QUEUE WORKER STARTED");

  try {

    while (videoQueue.length > 0) {

      const jobId = videoQueue.shift();

      const job = videoJobs.get(jobId);

      if (!job) continue;

      job.status = "processing";
      job.startedAt = new Date().toISOString();

      console.log("\n====================================");
      console.log(`🎬 PROCESSING JOB: ${jobId}`);
      console.log(`📦 QUEUE LEFT: ${videoQueue.length}`);
      console.log("====================================");

      try {

        const result = await generateVideo(job.options);

        job.status = "completed";
        job.result = result;
        job.completedAt = new Date().toISOString();

        console.log(`✅ JOB COMPLETED: ${jobId}`);

      } catch (error) {

        job.status = "failed";
        job.error =
          error?.message || "Video generation failed";

        job.completedAt = new Date().toISOString();

        console.error(`❌ JOB FAILED: ${jobId}`);
        console.error(error);

      }

    }

  } finally {

    videoWorkerRunning = false;

    console.log("⚪ VIDEO QUEUE WORKER IDLE");

  }

}


/* ==========================================
   VIDEO GENERATION
========================================== */


/* ==========================================
   VIDEO GENERATION API
========================================== */


/* ============================================================
   UI COMPATIBILITY API
   Premium UI -> existing video queue
   ============================================================ */
app.post("/api/generate", async (req, res) => {
  try {
    const b = req.body || {};
    const mode = String(b.mode || "video");
    const prompt = String(b.prompt || "").trim();

    if (mode === "parody") {
      const url = String(b.url || "").trim();

      if (!/^https?:\/\/.+/i.test(url)) {
        return res.status(400).json({
          success:false,
          error:"Valid YouTube video link is required"
        });
      }
    }

    const finalPrompt =
      mode === "parody"
        ? `Create a completely original animated parody inspired only by the broad concept of this YouTube reference: ${b.url}. Do not copy footage, audio, exact dialogue, characters, logos or shots. Create original characters, scenes, dialogue, comedy and music.`
        : prompt;

    if (!finalPrompt) {
      return res.status(400).json({
        success:false,
        error:"Prompt is required"
      });
    }

    const durationSeconds = Math.max(
      60,
      Math.min(1200, Number(b.duration) || 60)
    );

    const jobId = createJobId();

    const job = {
      id: jobId,
      status: "queued",
      createdAt: new Date().toISOString(),
      options: {
        title: mode === "parody"
          ? "Original AI Parody"
          : "Animation AI Video",
        prompt: finalPrompt,
        duration: `${Math.round(durationSeconds / 60)} minutes`,
        quality: String(b.quality || "1080p"),
        frameSize: String(b.ratio || "16:9"),
        style: String(b.style || "Cinematic Animation"),
        mode
      }
    };

    videoJobs.set(jobId, job);
    videoQueue.push(jobId);

    processVideoQueue().catch(err => {
      console.error("UI API QUEUE ERROR:", err);
    });

    return res.status(202).json({
      success:true,
      jobId,
      status:"queued",
      message:"Generation started"
    });

  } catch (error) {
    console.error("UI API ERROR:", error);

    return res.status(500).json({
      success:false,
      error:error.message || "Generation failed"
    });
  }
});

/* UI status alias */
app.get("/api/generation/status/:jobId", (req, res) => {
  const job = videoJobs.get(req.params.jobId);

  if (!job) {
    return res.status(404).json({
      success:false,
      error:"Generation job not found"
    });
  }

  let progress = 1;
  let stage = "Story";
  let message = "Generation queued...";

  if (job.status === "processing") {
    progress = 50;
    stage = "Animation";
    message = "Rendering your video...";
  }

  if (job.status === "completed") {
    progress = 100;
    stage = "Encoding";
    message = "Generation completed.";
  }

  if (job.status === "failed") {
    progress = 0;
    stage = "Failed";
    message = job.error || "Generation failed.";
  }

  return res.json({
    success:true,
    jobId:job.id,
    status:job.status,
    progress,
    stage,
    message,
    error:job.error || null,
    result:job.result || null
  });
});

app.post("/generate-video", async (req, res) => {

  try {

    const {
      title,
      prompt,
      duration,
      quality,
      frameSize
    } = req.body || {};

    if (!prompt || !String(prompt).trim()) {

      return res.status(400).json({
        success: false,
        error: "Prompt is required"
      });

    }

    const jobId = createJobId();

    const job = {

      id: jobId,

      status: "queued",

      createdAt: new Date().toISOString(),

      options: {
        title: title || "Animation AI Video",
        prompt: String(prompt).trim(),
        duration: duration || "5 minutes",
        quality: quality || "1080p",
        frameSize: frameSize || "16:9"
      }

    };

    videoJobs.set(jobId, job);

    videoQueue.push(jobId);

    console.log(
      `📥 VIDEO JOB QUEUED: ${jobId} | Position: ${videoQueue.length}`
    );

    processVideoQueue().catch(error => {
      console.error("❌ VIDEO QUEUE WORKER ERROR:", error);
    });

    return res.status(202).json({

      success: true,

      jobId,

      status: "queued",

      message: "Video generation has been added to the queue.",

      queuePosition: videoQueue.length

    });

  } catch (error) {

    console.error("❌ VIDEO QUEUE ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Unable to create video job"
    });

  }

});


/* ==========================================
   VIDEO JOB STATUS API
========================================== */

app.get("/api/video-job/:jobId", (req, res) => {

  const job = videoJobs.get(req.params.jobId);

  if (!job) {

    return res.status(404).json({
      success: false,
      error: "Video job not found"
    });

  }

  const response = {

    success: true,

    jobId: job.id,

    status: job.status,

    createdAt: job.createdAt,

    startedAt: job.startedAt || null,

    completedAt: job.completedAt || null

  };

  if (job.status === "queued") {

    const position =
      videoQueue.indexOf(job.id) + 1;

    response.queuePosition =
      position > 0 ? position : 0;

  }

  if (job.status === "completed") {

    response.project = job.result;

  }

  if (job.status === "failed") {

    response.error = job.error;

  }

  return res.json(response);

});


/* ==========================================
   VIDEO QUEUE STATUS
========================================== */

app.get("/api/video-queue", (req, res) => {

  return res.json({

    success: true,

    workerRunning: videoWorkerRunning,

    queued: videoQueue.length,

    jobs: Array.from(videoJobs.values()).map(job => ({
      jobId: job.id,
      status: job.status,
      createdAt: job.createdAt
    }))

  });

});


/* ==========================================
   FRONTEND FALLBACK
========================================== */



/* ==========================================
   START SERVER
========================================== */


// ============================================================
// V14 — VIDEO → PARODY API
// ============================================================

app.post("/api/parody/analyze", async (req, res) => {
  try {
    const { url, style = "funny", comedy = "high" } = req.body || {};

    if (!url || typeof url !== "string") {
      return res.status(400).json({
        success: false,
        error: "Video URL is required"
      });
    }

    if (!/^https?:\/\//i.test(url.trim())) {
      return res.status(400).json({
        success: false,
        error: "Invalid video URL"
      });
    }

    return res.json({
      success: true,
      mode: "parody",
      sourceUrl: url.trim(),
      style,
      comedy,
      analysis: {
        status: "ready",
        message: "Video reference accepted for transformative parody."
      }
    });

  } catch (error) {
    console.error("V14 parody analyze error:", error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post("/api/parody/script", async (req, res) => {
  try {
    const {
      url,
      style = "funny",
      comedy = "high",
      duration = "1 minutes"
    } = req.body || {};

    if (!url) {
      return res.status(400).json({
        success: false,
        error: "Video URL is required"
      });
    }

    const script = {
      title: "AI Generated Parody",
      sourceUrl: url,
      style,
      comedy,
      duration,

      rules: [
        "Create an original parody",
        "Use newly generated fictional characters",
        "Use newly generated dialogue",
        "Use newly generated visuals",
        "Do not reproduce source footage",
        "Do not reproduce source audio"
      ],

      scenes: [
        {
          number: 1,
          type: "intro",
          instruction: "Create an original comedic introduction."
        },
        {
          number: 2,
          type: "setup",
          instruction: "Introduce original characters and the parody situation."
        },
        {
          number: 3,
          type: "escalation",
          instruction: "Increase the comedy with an unexpected problem."
        },
        {
          number: 4,
          type: "chaos",
          instruction: "Create an exaggerated original comedic sequence."
        },
        {
          number: 5,
          type: "ending",
          instruction: "Finish with an original punchline."
        }
      ]
    };

    return res.json({
      success: true,
      mode: "parody",
      script
    });

  } catch (error) {
    console.error("V14 parody script error:", error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});




// ============================================================
// V15 — ORIGINAL PARODY GENERATOR
// ============================================================

app.post("/api/parody/generate", async (req, res) => {
  try {
    const {
      url,
      style = "funny",
      comedy = "high",
      duration = "1 minutes",
      quality = "1080p"
    } = req.body || {};

    if (!url) {
      return res.status(400).json({
        success: false,
        error: "Video URL is required"
      });
    }

    if (!/^https?:\/\/.+/i.test(String(url).trim())) {
      return res.status(400).json({
        success: false,
        error: "Invalid video URL"
      });
    }

    const minutes = Math.max(
      1,
      Math.min(20, parseInt(String(duration), 10) || 1)
    );

    // ========================================================
    // ORIGINAL PARODY CONCEPT
    // Source media is NOT copied or reused.
    // ========================================================

    const prompt =
      `Create a completely original animated parody inspired only by the broad premise of this reference URL: ${url}. ` +
      `Do not copy source footage, source audio, exact dialogue, characters, logos, or shots. ` +
      `Style: ${style}. Comedy level: ${comedy}. ` +
      `Use original characters, original dialogue, original visual composition, ` +
      `exaggerated reactions, visual comedy and a clear beginning, middle and ending. ` +
      `Main characters: Milo, an overconfident hero, and Robo, a sarcastic deadpan robot. ` +
      `The story should escalate into chaos and end with an unexpected funny solution.`;

    // ========================================================
    // Try to invoke the existing video-generation route
    // ========================================================

    const port = process.env.PORT || 3000;
    // V15 FIX: वीडियो generation को बीच में abort मत करो.
    // Long videos on mobile can take several minutes.
    let pipelineResponse;

    pipelineResponse = await fetch(

        `http://127.0.0.1:${port}/generate-video`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            prompt,
            duration: `${minutes} minutes`,
            quality,
            style,
            mode: "parody",
            parody: true
          }),
          
        }
      
    );


    const contentType =
      pipelineResponse.headers.get("content-type") || "";

    let pipelineData;

    if (contentType.includes("application/json")) {
      pipelineData = await pipelineResponse.json();
    } else {
      pipelineData = {
        success: pipelineResponse.ok,
        raw: await pipelineResponse.text()
      };
    }

    if (!pipelineResponse.ok) {
      return res.status(500).json({
        success: false,
        mode: "parody",
        error:
          pipelineData.error ||
          pipelineData.message ||
          "Existing video pipeline failed",
        pipeline: pipelineData
      });
    }

    return res.json({
      success: true,
      mode: "parody",
      original: true,
      requestedDuration: `${minutes} minutes`,
      quality,
      sourceUrl: url,
      pipeline: pipelineData,
      message:
        "Original parody generation has been sent to the Animation AI video pipeline."
    });

  } catch (error) {
    console.error("❌ Parody pipeline error:", error);

    return res.status(500).json({
      success: false,
      mode: "parody",
      error:
        error.message || "Parody generation failed"
    });
  }
});



/* ============================================================
   API JSON SAFETY GUARD
   API endpoints must NEVER fall through to HTML.
   ============================================================ */
app.use("/api", (req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    return res.status(404).json({
      success: false,
      error: `API endpoint not found: ${req.method} ${req.path}`,
      api: true
    });
  }
  return next();
});

// Frontend fallback — API routes के बाद
// Express 5 compatible: wildcard route की जरूरत नहीं
app.use((req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    return next();
  }

  res.sendFile(
    path.join(__dirname, "public", "index.html")
  );
});



/* ============================================
   VIDEO REFERENCE → ORIGINAL REMIX ENGINE
   ============================================ */

function isAllowedVideoReference(url) {
  try {
    const u = new URL(url);
    return [
      "youtube.com",
      "www.youtube.com",
      "youtu.be",
      "m.youtube.com",
      "vimeo.com"
    ].includes(u.hostname);
  } catch {
    return false;
  }
}

app.post("/api/remix/analyze", async (req, res) => {
  try {
    const { url, style = "animated", intensity = "medium" } = req.body || {};

    if (!url || !isAllowedVideoReference(url)) {
      return res.status(400).json({
        success: false,
        error: "Please enter a valid supported video reference URL."
      });
    }

    return res.json({
      success: true,
      mode: "reference-remix",
      reference: url,
      style,
      intensity,
      message:
        "Reference accepted. The new video will be generated as an original work inspired by broad visual and storytelling characteristics."
    });

  } catch (error) {
    console.error("Remix analyze error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Unable to analyze reference."
    });
  }
});


app.post("/api/remix/generate", async (req, res) => {
  try {

    const {
      url,
      title = "Original AI Remix",
      style = "animated",
      intensity = "medium",
      prompt = "",
      duration = "30 seconds",
      quality = "720p",
      frameSize = "16:9"
    } = req.body || {};

    if (!url || !isAllowedVideoReference(url)) {
      return res.status(400).json({
        success: false,
        error: "A valid video reference URL is required."
      });
    }

    const stylePrompts = {
      animated:
        "Create a polished original animated interpretation with expressive characters and cinematic movement.",
      anime:
        "Create an original anime-inspired visual treatment with dynamic camera movement and expressive scenes.",
      cartoon:
        "Create an original colorful cartoon interpretation with exaggerated expressions and smooth animation.",
      cinematic:
        "Create an original cinematic reinterpretation with dramatic lighting and camera composition.",
      funny:
        "Create an original humorous animated interpretation with comedic timing and fresh characters."
    };

    const intensityPrompts = {
      low: "Keep only a very loose thematic inspiration.",
      medium: "Use broad storytelling inspiration while creating completely new scenes and characters.",
      high: "Transform the concept heavily into a distinctly new creative work."
    };

    const generationPrompt = `
TITLE: ${title}

VIDEO REFERENCE:
${url}

IMPORTANT:
Do not copy, reproduce, download, or recreate the source video frame-by-frame.
Do not reuse the original video's exact dialogue, soundtrack, characters, or scenes.

Create a NEW and ORIGINAL animated video.

STYLE:
${stylePrompts[style] || stylePrompts.animated}

TRANSFORMATION:
${intensityPrompts[intensity] || intensityPrompts.medium}

USER CREATIVE DIRECTION:
${prompt || "Create a fresh entertaining story with original characters."}

OUTPUT REQUIREMENTS:
- Original characters
- Original scenes
- New dialogue/storytelling
- Smooth animation
- Suitable for ${frameSize}
- Target duration: ${duration}
- Target quality: ${quality}

The reference is only for broad creative inspiration.
`;

    const baseUrl =
      process.env.PUBLIC_URL ||
      process.env.RENDER_EXTERNAL_URL ||
      `http://127.0.0.1:${PORT}`;

    const response = await fetch(`${baseUrl}/generate-video`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        prompt: generationPrompt,
        duration,
        quality,
        frameSize,
        mode: "reference-remix"
      })
    });

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(
        "Video pipeline returned a non-JSON response: " +
        text.substring(0, 200)
      );
    }

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.json({
      success: true,
      mode: "reference-remix",
      reference: url,
      original: true,
      ...data
    });

  } catch (error) {
    console.error("Remix generation error:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Remix generation failed."
    });
  }
});


app.listen(PORT, "0.0.0.0", () => {

  console.log("\n====================================");
  console.log("🎬 Animation AI v3.0 is running!");
  console.log("🌍 Production server enabled");
  console.log(`📍 Port: ${PORT}`);
  console.log("🎭 Story Engine: ACTIVE");
  console.log("📝 Script Engine: ACTIVE");
  console.log("🎬 Video Engine: ACTIVE");
  console.log("====================================\n");

});
try{
 const jarvisAPI=require("./JARVIS/api/jarvis-api");
 app.use(jarvisAPI);
}catch(e){console.error("JARVIS API:",e.message)}
try{app.use(require("./JARVIS/api/final-api"))}catch(e){console.error("JARVIS:",e.message)}
