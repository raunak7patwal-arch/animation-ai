
const titleInput = document.getElementById("title");
const promptInput = document.getElementById("prompt");

const durationInput = document.getElementById("duration");
const qualityInput = document.getElementById("quality");
const frameSizeInput = document.getElementById("frameSize");

const generateBtn = document.getElementById("generateBtn");

const progressCard = document.getElementById("progressCard");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const progressPercent = document.getElementById("progressPercent");

const resultCard = document.getElementById("resultCard");
const videoPlayer = document.getElementById("videoPlayer");
const downloadBtn = document.getElementById("downloadBtn");

const errorCard = document.getElementById("errorCard");
const errorText = document.getElementById("errorText");

const newVideoBtn = document.getElementById("newVideoBtn");

const serverStatus = document.getElementById("serverStatus");


async function checkServer() {

  try {

    const response = await fetch("/api/status");

    if (!response.ok) {
      throw new Error();
    }

    serverStatus.innerHTML = "🟢 Animation Engine Online";

  } catch {

    serverStatus.innerHTML = "🔴 Engine Offline";

  }

}


function setProgress(percent, text) {

  progressFill.style.width = percent + "%";

  progressPercent.textContent = percent + "%";

  progressText.textContent = text;

}


function hideResults() {

  resultCard.classList.add("hidden");

  errorCard.classList.add("hidden");

}


generateBtn.addEventListener("click", async () => {

  const title = titleInput.value.trim();

  const prompt = promptInput.value.trim();


  if (!title || !prompt) {

    alert("Please enter both Video Title and Story Prompt!");

    return;

  }


  hideResults();

  progressCard.classList.remove("hidden");

  generateBtn.disabled = true;

  generateBtn.innerHTML = "⏳ Generating Animation...";


  const stages = [

    [5, "🎭 Understanding your story..."],

    [15, "📝 Creating scenes..."],

    [30, "🖼️ Creating visuals..."],

    [45, "🧍🤖 Creating characters..."],

    [60, "🎙️ Generating voices..."],

    [75, "🎬 Animating scenes..."],

    [88, "📷 Adding cinematic effects..."],

    [96, "✨ Final quality enhancement..."]

  ];


  let stageIndex = 0;


  setProgress(
    stages[0][0],
    stages[0][1]
  );


  const progressTimer = setInterval(() => {

    if (stageIndex < stages.length - 1) {

      stageIndex++;

      setProgress(
        stages[stageIndex][0],
        stages[stageIndex][1]
      );

    }

  }, 5000);


  try {

    const response = await fetch("/generate-video", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({

        title,

        prompt,

        duration: durationInput.value,

        quality: qualityInput.value,

        frameSize: frameSizeInput.value

      })

    });


    clearInterval(progressTimer);


    const data = await response.json();


    if (!response.ok || !data.success) {

      throw new Error(
        data.error ||
        data.message ||
        "Video generation failed"
      );

    }


    setProgress(
      100,
      "🎉 Animation completed successfully!"
    );


    const videoUrl =
      data.project?.videoFile ||
      data.videoFile;


    if (!videoUrl) {

      throw new Error(
        "Video created but video URL was not returned"
      );

    }


    setTimeout(() => {

      progressCard.classList.add("hidden");

      resultCard.classList.remove("hidden");

      videoPlayer.src = videoUrl;

      downloadBtn.href = videoUrl;

    }, 800);


  } catch (error) {

    clearInterval(progressTimer);

    progressCard.classList.add("hidden");

    errorCard.classList.remove("hidden");

    errorText.textContent =
      error.message ||
      "Unknown error occurred";

  } finally {

    generateBtn.disabled = false;

    generateBtn.innerHTML =
      "🚀 Generate Animation";

  }

});


newVideoBtn.addEventListener("click", () => {

  resultCard.classList.add("hidden");

  titleInput.value = "";

  promptInput.value = "";

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

});


checkServer();

setInterval(checkServer, 10000);



// ============================================================
// V14 — VIDEO → PARODY FRONTEND
// ============================================================



/* =========================================================
   V15 — REAL VIDEO → PARODY PIPELINE
   ========================================================= */
(function initParodyEngineV15() {
  const analyzeBtn = document.getElementById("analyzeParodyBtn");
  const generateBtn = document.getElementById("generateParodyBtn");
  const urlInput = document.getElementById("parodyUrl");
  const styleInput = document.getElementById("parodyStyle");
  const comedyInput = document.getElementById("parodyComedy");
  const durationInput = document.getElementById("parodyDuration");
  const status = document.getElementById("parodyStatus");

  if (!urlInput) return;

  function showStatus(message) {
    if (!status) return;
    status.style.display = "block";
    status.textContent = message;
  }

  async function postJSON(url, body) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(
        "Server ने JSON के बजाय दूसरा response दिया."
      );
    }

    if (!response.ok || !data.success) {
      throw new Error(
        data.error || data.message || "Request failed"
      );
    }

    return data;
  }

  if (analyzeBtn) {
    analyzeBtn.onclick = async () => {
      const url = urlInput.value.trim();

      if (!url) {
        showStatus("❌ पहले video URL डालो.");
        return;
      }

      analyzeBtn.disabled = true;
      showStatus("🔍 Reference analyze हो रहा है...");

      try {
        const data = await postJSON(
          "/api/parody/analyze",
          {
            url,
            style: styleInput?.value || "funny",
            comedy: comedyInput?.value || "high"
          }
        );

        showStatus(
          "✅ Reference accepted.\n\n" +
          "🎭 Original parody mode READY.\n" +
          "🎬 अब Generate Parody दबाओ."
        );

        if (generateBtn) {
          generateBtn.style.display = "block";
        }

        window.currentParodyAnalysis = data;

      } catch (error) {
        showStatus("❌ " + error.message);
      } finally {
        analyzeBtn.disabled = false;
      }
    };
  }

  if (generateBtn) {
    generateBtn.onclick = async () => {
      const url = urlInput.value.trim();

      if (!url) {
        showStatus("❌ Video URL required.");
        return;
      }

      generateBtn.disabled = true;

      showStatus(
        "🧠 Creating original parody...\n\n" +
        "1/4 🎭 Original concept\n" +
        "2/4 📝 Script\n" +
        "3/4 🎬 Animation pipeline\n" +
        "4/4 🎞️ Final MP4"
      );

      try {
        const data = await postJSON(
          "/api/parody/generate",
          {
            url,
            style: styleInput?.value || "funny",
            comedy: comedyInput?.value || "high",
            duration: durationInput?.value || "1 minutes",
            quality: "1080p"
          }
        );

        window.currentParodyResult = data;

        let output = "";

        if (data.pipeline) {
          output =
            data.pipeline.output ||
            data.pipeline.outputFile ||
            data.pipeline.video ||
            data.pipeline.videoUrl ||
            "";
        }

        showStatus(
          "✅ PARODY GENERATION STARTED / COMPLETED\n\n" +
          "🎭 Mode: Original Parody\n" +
          "😂 Comedy: " +
          (comedyInput?.value || "high") +
          "\n⏱️ Duration: " +
          (durationInput?.value || "1 minutes") +
          "\n🎬 Quality: 1080p\n\n" +
          (output
            ? "🎞️ Output: " + output
            : "🎞️ Animation pipeline response received.")
        );

        // Show a playable video if pipeline returned a URL.
        if (output) {
          let video = document.getElementById("parodyResultVideo");

          if (!video) {
            video = document.createElement("video");
            video.id = "parodyResultVideo";
            video.controls = true;
            video.playsInline = true;
            video.style.width = "100%";
            video.style.marginTop = "16px";

            const panel =
              document.getElementById("parodyPanel") ||
              status.parentElement;

            panel.appendChild(video);
          }

          const src =
            String(output).startsWith("http")
              ? output
              : "/" +
                String(output)
                  .replace(/^\/+/, "");

          video.src = src;
          video.load();
        }

      } catch (error) {
        showStatus("❌ " + error.message);
      } finally {
        generateBtn.disabled = false;
      }
    };
  }
})();
