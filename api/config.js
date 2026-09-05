require("dotenv").config();

module.exports = {
  port: Number(process.env.PORT || 3000),

  providers: {
    wavespeed: !!process.env.WAVESPEED_API_KEY,
    fal: !!process.env.FAL_KEY,
    huggingface: !!process.env.HF_TOKEN
  }
};
