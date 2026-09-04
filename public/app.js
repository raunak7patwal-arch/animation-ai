async function generateAnimation() {
  const prompt = document.getElementById("prompt").value.trim();
  const duration = document.getElementById("duration").value;
  const voiceMode = document.getElementById("voiceMode").value;

  if (!prompt) {
    alert("पहले अपनी कहानी का Prompt लिखो!");
    return;
  }

  const progressCard = document.getElementById("progressCard");
  const resultCard = document.getElementById("resultCard");
  const progress = document.getElementById("progress");
  const status = document.getElementById("status");
  const button = document.getElementById("generateBtn");

  progressCard.classList.remove("hidden");
  resultCard.classList.add("hidden");
  button.disabled = true;

  const steps = [
    ["📝 कहानी समझी जा रही है...", 15],
    ["🎭 Characters बनाए जा रहे हैं...", 30],
    ["🎬 Scenes तैयार किए जा रहे हैं...", 50],
    ["🎙️ Voices चुनी जा रही हैं...", 70],
    ["✨ Animation Project तैयार हो रहा है...", 90]
  ];

  try {
    for (const [text, percent] of steps) {
      status.textContent = text;
      progress.style.width = percent + "%";
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const response = await fetch(window.location.origin + "/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt,
        duration,
        voiceMode
      })
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Generation failed");
    }

    const project = data.project;

    progress.style.width = "100%";
    status.textContent = "✅ Story Project तैयार हो गया!";

    let output = "";

    output += "🎬 TITLE\n";
    output += project.title + "\n\n";

    output += "💡 ORIGINAL PROMPT\n";
    output += project.prompt + "\n\n";

    output += "⏱️ DURATION\n";
    output += project.duration + "\n\n";

    output += "🎙️ VOICE MODE\n";
    output += project.voiceMode + "\n\n";

    output += "━━━━━━━━━━━━━━━━━━\n";
    output += "🎭 CHARACTERS & VOICES\n";
    output += "━━━━━━━━━━━━━━━━━━\n\n";

    project.characters.forEach(character => {
      output += `👤 ${character.name}\n`;
      output += `Role: ${character.role}\n`;
      output += `Personality: ${character.personality}\n`;
      output += `🎙️ Voice: ${character.voice}\n\n`;
    });

    output += "━━━━━━━━━━━━━━━━━━\n";
    output += "🎬 SCENES\n";
    output += "━━━━━━━━━━━━━━━━━━\n\n";

    project.scenes.forEach(scene => {
      output += `SCENE ${scene.sceneNumber}: ${scene.type}\n`;
      output += scene.description + "\n\n";
    });

    output += "━━━━━━━━━━━━━━━━━━\n";
    output += "📊 STATUS\n";
    output += project.status + "\n\n";

    output += "🚀 NEXT STEP: Animation + Voice + Video Generation";

    document.getElementById("result").textContent = output;

    resultCard.classList.remove("hidden");

  } catch (error) {
    status.textContent = "❌ Error: " + error.message;
    console.error(error);
  }

  button.disabled = false;
}
