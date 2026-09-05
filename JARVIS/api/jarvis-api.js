const express=require("express"),{image,voice,video}=require("../ai/jarvis");
const app=express();
app.use(express.json({limit:"100mb"}));
app.get("/api/jarvis/health",(q,r)=>r.json({success:true,name:"JARVIS",status:"online"}));
app.post("/api/jarvis/image",async(q,r)=>{try{r.json(await image(q.body.prompt,q.body))}catch(e){r.status(500).json({success:false,error:e.message})}});
app.post("/api/jarvis/voice",async(q,r)=>{try{r.json(await voice(q.body.text||"JARVIS voice test"))}catch(e){r.status(500).json({success:false,error:e.message})}});
app.post("/api/jarvis/video",async(q,r)=>{try{r.json(await video(q.body.prompt||"Create an original animated story",q.body))}catch(e){r.status(500).json({success:false,error:e.message})}});
app.post("/api/jarvis/image-to-video",async(q,r)=>{try{r.json(await video(q.body.prompt||"Animate this image",q.body))}catch(e){r.status(500).json({success:false,error:e.message})}});
app.post("/api/parody/analyze",(q,r)=>r.json({success:true,mode:"original-parody",input:q.body}));
app.post("/api/parody/script",(q,r)=>r.json({success:true,mode:"original-parody",scriptPrompt:q.body}));
app.post("/api/parody/generate",async(q,r)=>{try{r.json(await video(q.body.prompt||"Create an original parody animation",{
 ...q.body,parody:true}))}catch(e){r.status(500).json({success:false,error:e.message})}});
module.exports=app;
