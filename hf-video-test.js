const { InferenceClient } = require("@huggingface/inference");

async function main() {
  if (!process.env.HF_TOKEN) {
    throw new Error("HF_TOKEN is not set");
  }

  console.log("Checking Hugging Face video access...");
  console.log("Model: Wan-AI/Wan2.2-TI2V-5B");
  console.log("Provider: fal-ai");

  const client = new InferenceClient(process.env.HF_TOKEN);

  try {
    await client.textToVideo({
      provider: "fal-ai",
      model: "Wan-AI/Wan2.2-TI2V-5B",
      inputs: "A cute cartoon robot walking through a colorful futuristic city"
    });

    console.log("VIDEO_GENERATION_AVAILABLE");
  } catch (err) {
    const msg = String(err?.message || err);

    if (
      msg.toLowerCase().includes("depleted") ||
      msg.toLowerCase().includes("credits")
    ) {
      console.log("");
      console.log("HF_FREE_CREDIT_EXHAUSTED");
      console.log("No video was generated.");
      console.log("No automatic payment will be attempted.");
      process.exit(2);
    }

    console.error("VIDEO_GENERATION_FAILED");
    console.error(msg);
    process.exit(1);
  }
}

main();
