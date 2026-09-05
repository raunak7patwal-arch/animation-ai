const express=require("express");
const {generateImage}=require("../ai/real-image");
const orchestrator=require("../animation/orchestrator");
const app=express();
app.use(express.json({limit:"100mb"}));

function duration(x){
 x=String(x||60);let p=x.split(":");
 let n=p.length===2?+p[0]*60+ +p[1]:+x;
 return Math.max(60,Math.min(1200,n||60));
}

app.get("/api/jarvis/health",(q,r)=>r.json({
 success:true,name:"JARVIS",status:"online",
 duration:"1-20 minutes",quality:["HD","1080p","1440p","4K"]
}));

app.post("/api/jarvis/image",async(q,r)=>{
 try{r.json(await generateImage(q.body.prompt,q.body))}
 catch(e){r.status(500).json({success:false,error:e.message})}
});

app.post("/api/jarvis/video",async(q,r)=>{
 try{
  const b=q.body||{};
  r.json(await orchestrator.generate(
   b.prompt||b.story||"Create an original animated story",
   {
    duration:duration(b.duration),
    resolution:b.resolution||"1920x1080",
    quality:b.quality||"1080p",
    character:b.character||null,
    image:b.image||null,
    parody:!!b.parody
   }
  ));
 }catch(e){r.status(500).json({success:false,error:e.message})}
});

app.post("/api/jarvis/image-to-video",async(q,r)=>{
 try{
  const b=q.body||{};
  r.json(await orchestrator.generate(
   b.prompt||"Animate the supplied image",
   {duration:duration(b.duration),resolution:b.resolution||"1920x1080",image:b.image}
  ));
 }catch(e){r.status(500).json({success:false,error:e.message})}
});

app.post("/api/parody/analyze",(q,r)=>r.json({success:true,mode:"original-parody"}));
app.post("/api/parody/script",(q,r)=>r.json({success:true,mode:"original-parody"}));
app.post("/api/parody/generate",async(q,r)=>{
 try{
  const b=q.body||{};
  r.json(await orchestrator.generate(
   b.prompt||"Create an original parody animation",
   {duration:duration(b.duration),resolution:b.resolution||"1920x1080",parody:true}
  ));
 }catch(e){r.status(500).json({success:false,error:e.message})}
});

module.exports=app;
