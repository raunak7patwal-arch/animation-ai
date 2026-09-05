const fs=require("fs"),path=require("path"),{spawn}=require("child_process");
const root=process.cwd();

function run(cmd,args=[]){
 return new Promise((res,rej)=>{
  const p=spawn(cmd,args,{stdio:["ignore","pipe","pipe"]});
  let out="",err="";
  p.stdout.on("data",x=>out+=x);p.stderr.on("data",x=>err+=x);
  p.on("close",c=>c?rej(Error(err||out||cmd+" failed")):res(out));
 });
}
function duration(v){
 if(typeof v==="number")return Math.max(60,Math.min(1200,v));
 let p=String(v||60).split(":");
 return Math.max(60,Math.min(1200,p.length>1?+p[0]*60+ +p[1]:+v||60));
}
async function image(prompt,opt={}){
 const out=path.join(root,"JARVIS/output","image-"+Date.now()+".png");
 fs.mkdirSync(path.dirname(out),{recursive:true});
 if(!require("child_process").execSync("command -v termux-diffusion || true").toString().trim())
   throw Error("REAL_IMAGE_ENGINE_NOT_INSTALLED");
 await run("termux-diffusion",["generate",String(prompt),"-o",out,"--device","cpu","--vae-tiling"]);
 return {success:true,realAI:true,file:out};
}
async function voice(text){
 const out=path.join(root,"JARVIS/output","voice-"+Date.now()+".wav");
 await run("espeak-ng",["-w",out,String(text)]);
 return {success:true,file:out,neural:false};
}
async function video(prompt,opt={}){
 const orchestrator=require("../animation/orchestrator");
 return await orchestrator.generate(String(prompt),{
  duration:duration(opt.duration),
  resolution:opt.resolution||"1920x1080",
  quality:opt.quality||"1080p",
  character:opt.character||null,
  image:opt.image||null,
  parody:!!opt.parody
 });
}
module.exports={image,voice,video,duration};
