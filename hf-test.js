const { InferenceClient } = require("@huggingface/inference");

async function test() {
  try {
    console.log("🤖 Hugging Face AI से connect हो रहा है...");

    const client = new InferenceClient(process.env.HF_TOKEN);

    const result = await client.chatCompletion({
      provider: "auto",
      model: "google/gemma-2-2b-it",
      messages: [
        {
          role: "user",
          content: "Say hello in Hindi in one short sentence."
        }
      ],
      max_tokens: 50
    });

    console.log("✅ Connection successful!");
    console.log(result.choices[0].message.content);

  } catch (error) {
    console.error("❌ ERROR:");
    console.error(error.message || error);
  }
}

test();
