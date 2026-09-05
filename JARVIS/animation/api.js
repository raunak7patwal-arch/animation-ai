const express = require("express");
const path = require("path");
const {generate} = require("./orchestrator");

function installAnimationAPI(app) {
  const jobs = new Map();

  app.use(
    "/jarvis-animation",
    express.static(path.join(__dirname,"output"))
  );

  app.post("/api/jarvis/animation/generate", async (req,res)=>{
    const prompt = String(req.body?.prompt || "").trim();

    if(!prompt)
      return res.status(400).json({
        success:false,
        error:"prompt_required"
      });

    const jobId = require("crypto")
      .randomBytes(8).toString("hex");

    jobs.set(jobId,{
      id:jobId,
      status:"queued",
      progress:0
    });

    res.json({
      success:true,
      jobId,
      status:"queued"
    });

    setImmediate(async()=>{
      try {
        jobs.set(jobId,{
          ...jobs.get(jobId),
          status:"generating",
          progress:20
        });

        const result = await generate(prompt);

        jobs.set(jobId,{
          ...jobs.get(jobId),
          ...result,
          status:"completed",
          progress:100
        });
      } catch(e) {
        jobs.set(jobId,{
          ...jobs.get(jobId),
          status:"failed",
          progress:100,
          error:e.message
        });
      }
    });
  });

  app.get("/api/jarvis/animation/job/:id",(req,res)=>{
    const job = jobs.get(req.params.id);

    if(!job)
      return res.status(404).json({
        success:false,
        error:"job_not_found"
      });

    res.json({
      success:true,
      job
    });
  });
}

module.exports = {installAnimationAPI};
