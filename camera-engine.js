function getCameraMotion(sceneNumber) {

  const motions = [
    {
      name: "SLOW CINEMATIC ZOOM",
      zoom: "1.00 → 1.08"
    },
    {
      name: "DRAMATIC PUSH",
      zoom: "1.04 → 1.12"
    },
    {
      name: "FUNNY CLOSE-UP",
      zoom: "1.06 → 1.14"
    },
    {
      name: "SHAKY ACTION CAMERA",
      zoom: "1.03 → 1.10"
    },
    {
      name: "THINKING SLOW PAN",
      zoom: "1.02 → 1.09"
    },
    {
      name: "FAST ACTION PUSH",
      zoom: "1.05 → 1.15"
    },
    {
      name: "CELEBRATION ZOOM",
      zoom: "1.00 → 1.12"
    }
  ];

  const motion =
    motions[(sceneNumber - 1) % motions.length];

  console.log(
    `📷 V9 Scene ${sceneNumber}: ${motion.name}`
  );

  return motion;
}

module.exports = {
  getCameraMotion
};
