const express=require("express");
const cors=require("cors");
const path=require("path");

const app=express();

app.use(cors());
app.use(express.json({limit:"50mb"}));

const ROOT=process.cwd();

const engine=
  require("./JARVIS/animation/orchestrator");

app.get("/",(req,res)=>{
  res.json({
    success:true,
    name:"JARVIS",
    status:"online",
    free:true,
    paidProvider:false,
    hfRequired:false,
    localGeneration:true
  });
});

app.get("/api/health",(req,res)=>{
  res.json({
    success:true,
    status:"online",
    free:true,
    paidProvider:false,
    hfRequired:false,
    story:true,
    visual:true,
    character:true,
    voice:true,
    music:true,
    sfx:true,
    ffmpeg:true
  });
});

async function generate(req,res){
  try{
    const prompt=
      req.body.prompt ||
      req.body.text ||
      req.body.story;

    if(!prompt){
      return res.status(400).json({
        success:false,
        error:"prompt required"
      });
    }

    const result=
      await engine.generate(
        prompt,
        {
          duration:
            req.body.duration ||
            "10 seconds"
        }
      );

    res.json(result);

  }catch(e){
    console.error(e);

    res.status(500).json({
      success:false,
      error:e.message
    });
  }
}

app.post("/api/video/text",generate);
app.post("/api/jarvis/animation/generate",generate);

app.use(
  "/jarvis-animation",
  express.static(
    path.join(
      ROOT,
      "JARVIS/animation/output"
    )
  )
);

const PORT=
  Number(process.env.JARVIS_PORT)||3000;

app.listen(
  PORT,
  "0.0.0.0",
  ()=>{
    console.log(
      `JARVIS FREE API : http://127.0.0.1:${PORT}`
    );
  }
);
