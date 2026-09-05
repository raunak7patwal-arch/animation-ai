function parseDuration(duration = "5 minutes") {
  const text = String(duration).trim().toLowerCase();

  const number = parseFloat(text);

  if (!Number.isFinite(number) || number <= 0) {
    return 300;
  }

  if (
    text.includes("second") ||
    text.includes("sec")
  ) {
    return Math.max(5, Math.min(1200, Math.round(number)));
  }

  if (
    text.includes("minute") ||
    text.includes("min")
  ) {
    return Math.max(5, Math.min(1200, Math.round(number * 60)));
  }

  // अगर सिर्फ number दिया हो तो minutes मानेंगे
  return Math.max(5, Math.min(1200, Math.round(number * 60)));
}

function createScenes({ prompt, duration = "5 minutes" }) {

  const totalSeconds = parseDuration(duration);

  // छोटे वीडियो में कम scenes, लंबे वीडियो में reasonable limit
  let sceneCount;

  if (totalSeconds <= 30) {
    sceneCount = 3;
  } else if (totalSeconds <= 60) {
    sceneCount = 5;
  } else {
    // लगभग 12 सेकंड प्रति scene
    sceneCount = Math.ceil(totalSeconds / 12);
  }

  sceneCount = Math.max(
    2,
    Math.min(40, sceneCount)
  );

  const baseSeconds = Math.floor(totalSeconds / sceneCount);
  const remainder = totalSeconds % sceneCount;

  console.log("====================================");
  console.log("🎭 V13 SMART STORY ENGINE");
  console.log(`⏱️ Requested Duration: ${duration}`);
  console.log(`⏳ Total Seconds: ${totalSeconds}`);
  console.log(`🎬 Scenes: ${sceneCount}`);
  console.log("====================================");

  const sceneTypes = [
    "cinematic opening and introduction",
    "funny situation and reaction",
    "unexpected problem",
    "mysterious discovery",
    "funny chaos and movement",
    "creative plan",
    "surprising twist",
    "fast action sequence",
    "emotional reaction",
    "new challenge",
    "funny mistake",
    "dramatic discovery",
    "teamwork moment",
    "exciting action",
    "comic chaos",
    "clever solution",
    "surprise reaction",
    "adventure continues",
    "big challenge",
    "funny recovery",
    "celebration preparation",
    "happy ending buildup",
    "cinematic celebration",
    "funny final ending"
  ];

  const scenes = [];

  for (let i = 0; i < sceneCount; i++) {

    const type = sceneTypes[i % sceneTypes.length];

    scenes.push({
      number: i + 1,

      title: `Scene ${i + 1}`,

      prompt:
        `${prompt}. ` +
        `Scene ${i + 1} of ${sceneCount}. ` +
        `${type}. ` +
        `Expressive animated characters, cinematic composition, ` +
        `clear action and visual storytelling.`,

      // कुछ engines description/text भी पढ़ते हैं
      description:
        `${prompt}. ${type}. ` +
        `Clear action, expressive characters, cinematic animated scene.`,

      visualPrompt:
        `${prompt}. ${type}. ` +
        `High quality colorful cinematic 3D animation scene.`,

      duration: baseSeconds + (i < remainder ? 1 : 0)
    });
  }

  return scenes;
}

module.exports = {
  createScenes
};
