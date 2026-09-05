
const { execFile } = require("child_process");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);

async function availableEncoder(name) {
  try {
    const r = await execFileAsync("ffmpeg", [
      "-hide_banner",
      "-encoders"
    ]);

    return r.stdout.includes(name);
  } catch (_) {
    return false;
  }
}

async function chooseEncoder() {
  if (
    process.platform === "android" &&
    await availableEncoder("h264_mediacodec")
  ) {
    return "h264_mediacodec";
  }

  return "libx264";
}

async function fastEncode(input, output, options={}) {
  const encoder = await chooseEncoder();

  const args = [
    "-y",
    "-hide_banner",
    "-loglevel", "error",
    "-i", input,
    "-c:v", encoder
  ];

  if (encoder === "h264_mediacodec") {
    args.push("-b:v", options.bitrate || "8M");
  } else {
    args.push(
      "-preset", options.preset || "ultrafast",
      "-crf", String(options.crf ?? 30)
    );
  }

  args.push(
    "-c:a", "aac",
    "-b:a", "128k",
    "-movflags", "+faststart",
    output
  );

  console.log(`⚡ FAST ENCODER: ${encoder}`);

  await execFileAsync("ffmpeg", args);

  return {
    output,
    encoder
  };
}

module.exports = {
  fastEncode,
  chooseEncoder
};
