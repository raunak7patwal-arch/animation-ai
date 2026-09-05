
module.exports = {
  enabled: true,

  // Keep quality choices unchanged.
  hd: {
    width: 1280,
    height: 720,
    fps: 24,
    crf: 30,
    preset: "ultrafast"
  },

  fullhd: {
    width: 1920,
    height: 1080,
    fps: 24,
    crf: 28,
    preset: "ultrafast"
  },

  qhd: {
    width: 2560,
    height: 1440,
    fps: 24,
    crf: 27,
    preset: "veryfast"
  },

  uhd4k: {
    width: 3840,
    height: 2160,
    fps: 24,
    crf: 27,
    preset: "veryfast"
  },

  maxParallelScenes: 2,
  avoidDuplicateEncode: true,
  preferHardwareEncoder: true
};
