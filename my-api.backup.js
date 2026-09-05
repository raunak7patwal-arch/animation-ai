const express = require("express");
const app = express();

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ success: true, api: "Animation AI API" });
});

app.post("/api/video", (req, res) => {
  res.json({
    success: true,
    message: "Video request received",
    prompt: req.body.prompt || ""
  });
});

app.listen(3000, () => {
  console.log("Animation AI API running on port 3000");
});
