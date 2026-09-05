const fs=require("fs");
const path=require("path");
const {spawnSync,spawn}=require("child_process");

const ROOT=path.resolve(__dirname,"..");
const MEDIA=path.join(ROOT,"data","media");

function init(){
  for(const d of ["images","videos","audio","output"])
    fs.mkdirSync(path.join(MEDIA,d),{recursive:true});
}

function hasFFmpeg(){
  return spawnSync("ffmpeg",["-version"],{stdio:"ignore"}).status===0;
}

function run(args){
  return new Promise((resolve,reject)=>{
    const p=spawn("ffmpeg",["-y",...args]);
    let error="";
    p.stderr.on("data",x=>error+=x);
    p.on("error",reject);
    p.on("close",code=>{
      code===0?resolve(true):reject(new Error(error.slice(-3000)));
    });
  });
}

async function edit(input,output,opts={}){
  init();
  const a=["-i",input];

  if(opts.start!=null)a.push("-ss",String(opts.start));
  if(opts.duration!=null)a.push("-t",String(opts.duration));
  if(opts.scale)a.push("-vf",`scale=${opts.scale}`);
  if(opts.fps)a.push("-r",String(opts.fps));

  a.push("-c:v","libx264","-c:a","aac",output);
  await run(a);
  return output;
}

async function extractAudio(input,output){
  await run(["-i",input,"-vn","-c:a","aac",output]);
  return output;
}

async function convert(input,output){
  await run(["-i",input,output]);
  return output;
}

module.exports={init,hasFFmpeg,edit,extractAudio,convert};
