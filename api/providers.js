require("dotenv").config();

const WAVESPEED_BASE = "https://api.wavespeed.ai/api/v3";

async function wavespeedSubmit(model, input) {
  if (!process.env.WAVESPEED_API_KEY) {
    throw new Error("WAVESPEED_API_KEY is missing");
  }

  const response = await fetch(`${WAVESPEED_BASE}/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.WAVESPEED_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(60000)
  });

  const text = await response.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { message: text };
  }

  if (!response.ok || data.code !== 200) {
    const error = new Error(
      data.message || `WaveSpeed request failed: ${response.status}`
    );
    error.provider = "wavespeed";
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data.data;
}

async function wavespeedResult(taskId) {
  if (!process.env.WAVESPEED_API_KEY) {
    throw new Error("WAVESPEED_API_KEY is missing");
  }

  const response = await fetch(
    `${WAVESPEED_BASE}/predictions/${encodeURIComponent(taskId)}/result`,
    {
      headers: {
        Authorization: `Bearer ${process.env.WAVESPEED_API_KEY}`
      },
      signal: AbortSignal.timeout(30000)
    }
  );

  const text = await response.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    throw new Error(data.message || `Result request failed: ${response.status}`);
  }

  return data.data || data;
}

module.exports = {
  wavespeedSubmit,
  wavespeedResult
};
