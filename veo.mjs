import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

async function generateVideo() {
  try {
    console.log("🎬 Veo 3.1 Fast शुरू हो रहा है...");

    const output = await replicate.run(
      "google/veo-3.1-fast",
      {
        input: {
          prompt: "A cinematic anime warrior standing on a mountain at sunset, wind blowing through his clothes, dramatic camera movement, epic atmosphere, highly detailed, cinematic lighting"
        }
      }
    );

    console.log("✅ वीडियो तैयार!");
    console.log(output);
  } catch (error) {
    console.error("❌ ERROR:");
    console.error(error);
  }
}

generateVideo();
