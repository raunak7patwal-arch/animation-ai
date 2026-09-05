function createScenes({ prompt, duration = "5 minutes" }) {

  const minutes = Math.max(
    1,
    Math.min(20, parseInt(duration, 10) || 5)
  );

  const totalSeconds = minutes * 60;

  // लगभग 10 सेकंड प्रति scene
  // फोन को overload होने से बचाने के लिए limit
  const sceneCount = Math.max(
    7,
    Math.min(120, Math.ceil(totalSeconds / 10))
  );

  const baseSeconds = Math.floor(totalSeconds / sceneCount);
  const remainder = totalSeconds % sceneCount;

  console.log("====================================");
  console.log("🎭 V12 DYNAMIC STORY ENGINE");
  console.log(`⏱️ Requested Duration: ${minutes} minutes`);
  console.log(`🎬 Dynamic Scenes: ${sceneCount}`);
  console.log(`⏳ Seconds Per Scene: ${secondsPerScene}`);
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

      duration: baseSeconds + (i < remainder ? 1 : 0)
    });
  }

  return scenes;
}

module.exports = {
  createScenes
};
