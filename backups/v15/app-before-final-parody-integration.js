
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

(function initParodyEngine() {

  const analyzeBtn = document.getElementById("analyzeParodyBtn");
  const generateBtn = document.getElementById("generateParodyBtn");
  const urlInput = document.getElementById("parodyUrl");
  const styleInput = document.getElementById("parodyStyle");
  const comedyInput = document.getElementById("parodyComedy");
  const durationInput = document.getElementById("parodyDuration");
  const status = document.getElementById("parodyStatus");

  if (!analyzeBtn || !urlInput) return;

  function showStatus(message) {
    if (status) {
      status.style.display = "block";
      status.textContent = message;
    }
  }

  analyzeBtn.addEventListener("click", async () => {

    const url = urlInput.value.trim();

    if (!url) {
      showStatus("❌ Please paste a video URL first.");
      return;
    }

    showStatus("🔍 Analyzing video reference...");

    try {

      const response = await fetch("/api/parody/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          url,
          style: styleInput?.value || "funny",
          comedy: comedyInput?.value || "high"
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Analysis failed");
      }

      showStatus(
        "✅ Video accepted!\n\n" +
        "🎭 Original parody mode ready.\n" +
        "Characters, dialogue and visuals will be newly generated."
      );

      if (generateBtn) {
        generateBtn.style.display = "block";
      }

    } catch (error) {
      showStatus("❌ " + error.message);
    }

  });

  if (generateBtn) {

    generateBtn.addEventListener("click", async () => {

      const url = urlInput.value.trim();

      if (!url) {
        showStatus("❌ Video URL required.");
        return;
      }

      showStatus("🧠 Creating original parody script...");

      try {

        const response = await fetch("/api/parody/script", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            url,
            style: styleInput?.value || "funny",
            comedy: comedyInput?.value || "high",
            duration: durationInput?.value || "1 minutes"
          })
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Script generation failed");
        }

        window.currentParodyScript = data.script;

        showStatus(
          "✅ Parody script created!\n\n" +
          "🎬 " + data.script.title + "\n" +
          "🎨 Style: " + data.script.style + "\n" +
          "😂 Comedy: " + data.script.comedy + "\n" +
          "⏱️ Duration: " + data.script.duration + "\n\n" +
          "🚀 Animation pipeline ready."
        );

      } catch (error) {
        showStatus("❌ " + error.message);
      }

    });

  }

})();
