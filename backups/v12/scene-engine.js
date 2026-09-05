function createScenes({ prompt, duration }) {

  const totalSeconds =
    parseInt(duration) * 60 || 60;

  const sceneCount = 7;

  const secondsPerScene =
    Math.max(
      8,
      Math.floor(totalSeconds / sceneCount)
    );

  return [

    {
      number: 1,
      title: "Introduction",
      text: `कहानी शुरू होती है। ${prompt}`,
      visualPrompt:
        "cinematic animated opening scene, expressive characters, professional animation",
      duration: secondsPerScene
    },

    {
      number: 2,
      title: "Funny Problem",
      text:
        "अचानक एक अजीब और मजेदार समस्या सामने आती है और सभी लोग हैरान रह जाते हैं।",
      visualPrompt:
        "funny animated problem, exaggerated reactions, cinematic composition",
      duration: secondsPerScene
    },

    {
      number: 3,
      title: "Discovery",
      text:
        "फिर characters को कुछ ऐसा पता चलता है जिसकी किसी ने उम्मीद नहीं की थी।",
      visualPrompt:
        "animated discovery scene, surprise expressions, detailed environment",
      duration: secondsPerScene
    },

    {
      number: 4,
      title: "Funny Chaos",
      text:
        "एक छोटी सी गलती अचानक पूरे माहौल को मजेदार chaos में बदल देती है।",
      visualPrompt:
        "funny animated chaos, expressive faces, energetic action",
      duration: secondsPerScene
    },

    {
      number: 5,
      title: "Crazy Plan",
      text:
        "अब सभी मिलकर एक अजीब लेकिन शानदार plan बनाते हैं।",
      visualPrompt:
        "characters making a crazy plan, animated comedy, cinematic lighting",
      duration: secondsPerScene
    },

    {
      number: 6,
      title: "Big Twist",
      text:
        "लेकिन तभी कहानी में एक ऐसा बड़ा twist आता है जो सबको चौंका देता है।",
      visualPrompt:
        "dramatic animated twist, shocked funny expressions, cinematic scene",
      duration: secondsPerScene
    },

    {
      number: 7,
      title: "Funny Ending",
      text:
        "आखिर में सब कुछ ठीक हो जाता है, लेकिन एक बड़ा funny surprise सभी को फिर से हंसा देता है।",
      visualPrompt:
        "funny animated ending, happy characters, cinematic final scene",
      duration: secondsPerScene
    }

  ];
}

module.exports = {
  createScenes
};
