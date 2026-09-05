const express=require("express");
const multer=require("multer");
const path=require("path");
const fs=require("fs");
const {generateVideo,generateImage,generateVoice,cfg}=require("../ai/router");

const app=express();
const upload=multer({dest:path.join(process.cwd(),"JARVIS","temp")});
app.use(express.json({limit:"50mb"}));
app.use(express.urlencoded({extended:true,limit:"50mb"}));

app.get("/api/jarvis/health",(q,r)=>r.json({success:true,name:"JARVIS",config:cfg}));
app.get("/api/jarvis/info",(q,r)=>r.json(cfg));

app.post("/api/jarvis/video",async(q,r)=>{
 try{
  const b=q.body||{};
  const x=await generateVideo(b.prompt||b.story||"Create an original animated story",{
   duration:b.duration||60,resolution:b.resolution||"1280x720",
   quality:b.quality,character:b.character,parody:b.parody,image:b.image
  });
  r.json(x);
 }catch(e){r.status(500).json({success:false,error:e.message})}
});

app.post("/api/jarvis/image",async(q,r)=>{
 try{r.json(await generateImage(q.body.prompt,q.body||{}))}
 catch(e){r.status(500).json({success:false,error:e.message})}
});

app.post("/api/jarvis/voice",async(q,r)=>{
 try{r.json(await generateVoice(q.body.text))}
 catch(e){r.status(500).json({success:false,error:e.message})}
});

app.post("/api/jarvis/image-to-video",upload.single("image"),async(q,r)=>{
 try{
  const x=await generateVideo(q.body.prompt||"Animate this image",{
   duration:q.body.duration||60,resolution:q.body.resolution||"1280x720",
   image:q.file?.path
  });
  r.json(x);
 }catch(e){r.status(500).json({success:false,error:e.message})}
});

app.post("/api/parody/analyze",(q,r)=>r.json({success:true,mode:"original-parody",input:q.body}));
app.post("/api/parody/script",(q,r)=>r.json({success:true,original:true,prompt:q.body}));
app.post("/api/parody/generate",async(q,r)=>{
 try{r.json(await generateVideo(q.body.prompt||"Create an original parody",{
  duration:q.body.duration||60,parody:true,resolution:q.body.resolution||"1280x720"
 }))}catch(e){r.status(500).json({success:false,error:e.message})}
});

module.exports=app;
