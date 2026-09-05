require("dotenv").config();
const fs = require("fs");

const API_KEY = process.env.WAVESPEED_API_KEY;

if (!API_KEY) {
  console.error("WAVESPEED_KEY_MISSING");
  process.exit(1);
}

const API_URL =
  "https://api.wavespeed.ai/api/v3/wavespeed-ai/wan-2.2/t2v-480p-ultra-fast";

async function main() {
  console.log("Starting WaveSpeed real AI video generation...");
  console.log("Model: Wan 2.2 T2V 480p Ultra-Fast");
  console.log("Duration: 5 seconds");

  const submit = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      prompt:
        "A cute animated robot walking through a colorful futuristic city, cinematic cartoon animation, smooth camera movement",
      size: "832*480",
      duration: 5
    })
  });

  const submitText = await submit.text();

  if (!submit.ok) {
    console.error("WAVESPEED_SUBMIT_FAILED");
    console.error(submitText);
    process.exit(1);
  }

  const submitData = JSON.parse(submitText);
  const task = submitData.data || submitData;
  const id = task.id;

  if (!id) {
    console.error("NO_TASK_ID");
    console.error(submitText);
    process.exit(1);
  }

  console.log("TASK_CREATED:", id);

  const resultUrl =
    task.urls?.get ||
    `https://api.wavespeed.ai/api/v3/predictions/${id}/result`;

  while (true) {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const response = await fetch(resultUrl, {
      headers: {
        Authorization: `Bearer ${API_KEY}`
      }
    });

    const text = await response.text();

    if (!response.ok) {
      console.error("WAVESPEED_STATUS_FAILED");
      console.error(text);
      process.exit(1);
    }

    const data = JSON.parse(text);
    const result = data.data || data;
    const status = result.status;

    console.log("STATUS:", status);

    if (status === "completed") {
      const outputs = result.outputs;

      if (!outputs || !outputs.length) {
        console.error("VIDEO_OUTPUT_MISSING");
        console.error(JSON.stringify(result, null, 2));
        process.exit(1);
      }

      const videoUrl =
        typeof outputs[0] === "string"
          ? outputs[0]
          : outputs[0].url;

      console.log("VIDEO_READY");

      const video = await fetch(videoUrl);

      if (!video.ok) {
        throw new Error(`Video download failed: ${video.status}`);
      }

      const buffer = Buffer.from(await video.arrayBuffer());

      fs.writeFileSync("wavespeed-test-video.mp4", buffer);

      console.log("VIDEO_CREATED");
      console.log(`Size: ${buffer.length} bytes`);
      console.log("Saved: wavespeed-test-video.mp4");

      break;
    }

    if (
      status === "failed" ||
      status === "cancelled" ||
      status === "timeout" ||
      status === "deleted"
    ) {
      console.error("VIDEO_GENERATION_FAILED");
      console.error(JSON.stringify(result, null, 2));
      process.exit(1);
    }
  }
}

main().catch(error => {
  console.error("WAVESPEED_TEST_FAILED");
  console.error(error.message || error);
  process.exit(1);
});
