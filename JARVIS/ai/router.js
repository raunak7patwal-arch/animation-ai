const fs=require("fs");
const path=require("path");
const cfg=require("./config");
const orchestrator=require("../animation/orchestrator");

function seconds(v){
  if(typeof v==="number") return Math.max(60,Math.min(1200,v));
  const p=String(v||"60").split(":");
  if(p.length===2)return Math.max(60,Math.min(1200,+p[0]*60 + +p[1]));
  return Math.max(60,Math.min(1200,+v||60));
}

async function generateVideo(prompt,opt={}){
  const duration=seconds(opt.duration||60);
  return orchestrator.generate(String(prompt),{
    duration,
    resolution:opt.resolution||"1280x720",
    quality:opt.quality||"hd",
    imageToVideo:!!opt.image,
    character:opt.character||null,
    parody:!!opt.parody
  });
}

async function generateImage(prompt,opt={}){
  const dir=path.join(process.cwd(),"JARVIS","output");
  fs.mkdirSync(dir,{recursive:true});
  const out=path.join(dir,`jarvis-image-${Date.now()}.png`);

  const w=opt.width||1280,h=opt.height||720;
  const text=String(prompt).replace(/'/g,"");

  await new Promise((resolve,reject)=>{
    const {spawn}=require("child_process");
    const p=spawn("ffmpeg",[
      "-y","-f","lavfi","-i",
      `color=c=black:s=${w}x${h}:d=1`,
      "-vf",`drawtext=text='${text}':fontcolor=white:fontsize=42:x=(w-text_w)/2:y=(h-text_h)/2`,
      "-frames:v","1",out
    ]);
    p.on("close",c=>c===0?resolve():reject(new Error("image renderer failed")));
  });

  return {success:true,file:out,warning:"REAL AI image backend must be installed separately; this is only a safe renderer fallback."};
}

async function generateVoice(text,out){
  const {spawn}=require("child_process");
  out=out||path.join(process.cwd(),"JARVIS","output",`voice-${Date.now()}.wav`);
  await new Promise((resolve,reject)=>{
    const p=spawn("espeak-ng",["-w",out,String(text)]);
    p.on("close",c=>c===0?resolve():reject(new Error("voice failed")));
  });
  return {success:true,file:out};
}

module.exports={generateVideo,generateImage,generateVoice,cfg};
