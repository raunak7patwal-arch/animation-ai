require("dotenv").config();

const { fal } = require("@fal-ai/client");
const fs = require("fs");

if (!process.env.FAL_KEY) {
  console.error("FAL_KEY_MISSING");
  process.exit(1);
}

fal.config({
  credentials: process.env.FAL_KEY
});

async function main() {
  console.log("Starting real fal.ai video generation...");
  console.log("Model: Wan 2.2 5B");

  try {
    const result = await fal.subscribe(
      "fal-ai/wan/v2.2-5b/text-to-video",
      {
        input: {
          prompt:
            "A cute animated robot walking through a colorful futuristic city, cinematic cartoon animation, smooth camera movement",
          num_frames: 81,
          frames_per_second: 16,
          resolution: "480p"
        },
        logs: true,
        onQueueUpdate(update) {
          if (update.status === "IN_PROGRESS") {
            console.log("AI generation in progress...");
          }
        }
      }
    );

    const videoUrl = result?.data?.video?.url;

    if (!videoUrl) {
      console.log(JSON.stringify(result.data || result, null, 2));
      throw new Error("Video URL not found");
    }

    console.log("GENERATION_COMPLETE");
    console.log("Downloading video...");

    const response = await fetch(videoUrl);

    if (!response.ok) {
      throw new Error(`Download failed: HTTP ${response.status}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    fs.writeFileSync("fal-test-video.mp4", buffer);

    console.log("VIDEO_CREATED");
    console.log(`Size: ${buffer.length} bytes`);
    console.log("Saved: fal-test-video.mp4");

  } catch (error) {
    console.error("FAL_VIDEO_TEST_FAILED");
    console.error(error.message || error);
    process.exit(1);
  }
}

main();
