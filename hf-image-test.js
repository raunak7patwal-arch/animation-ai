const fs = require("fs");
const { InferenceClient } = require("@huggingface/inference");

async function testImage() {
  try {
    console.log("🎨 AI image generation शुरू हो रहा है...");

    if (!process.env.HF_TOKEN) {
      throw new Error("HF_TOKEN is missing");
    }

    const client = new InferenceClient(process.env.HF_TOKEN);

    const imageBlob = await client.textToImage({
      provider: "hf-inference",
      model: "stabilityai/stable-diffusion-3-medium-diffusers",
      inputs: "A cute colorful 3D cartoon boy and a friendly robot walking through a futuristic city, cinematic animation, high quality"
    });

    const buffer = Buffer.from(await imageBlob.arrayBuffer());

    if (buffer.length < 1000) {
      throw new Error(
        `Response is too small to be a valid AI image: ${buffer.length} bytes`
      );
    }

    fs.writeFileSync("test-ai-image.png", buffer);

    console.log("✅ AI IMAGE CREATED");
    console.log("📁 File: test-ai-image.png");
    console.log(`📦 Size: ${buffer.length} bytes`);

  } catch (error) {
    console.error("\n❌ FULL ERROR:");
    console.error(error);
    console.error("\nMessage:", error.message);

    if (error.cause) {
      console.error("\nCause:");
      console.error(error.cause);
    }
  }
}

testImage();
