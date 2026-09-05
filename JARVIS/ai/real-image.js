const {spawn}=require("child_process"),fs=require("fs"),path=require("path");
function generateImage(prompt,opt={}){
 const out=path.resolve(opt.output||`JARVIS/output/image-${Date.now()}.png`);
 fs.mkdirSync(path.dirname(out),{recursive:true});
 const a=["generate",String(prompt),"-o",out,"--device","cpu","--vae-tiling"];
 if(opt.width)a.push("--width",String(opt.width));
 if(opt.height)a.push("--height",String(opt.height));
 return new Promise((resolve,reject)=>{
  const p=spawn("termux-diffusion",a);
  let e="";p.stderr.on("data",x=>e+=x);
  p.on("close",c=>c===0&&fs.existsSync(out)
   ?resolve({success:true,realAI:true,file:out})
   :reject(Error(e||"REAL_IMAGE_FAILED")));
 });
}
module.exports={generateImage};
