const fs=require("fs");
const path=require("path");
const {execFile}=require("child_process");

const ROOT=process.cwd();

function run(cmd,args=[]){
  return new Promise((resolve,reject)=>{
    execFile(cmd,args,{maxBuffer:100*1024*1024},(err,stdout,stderr)=>{
      if(err){
        err.stdout=stdout;
        err.stderr=stderr;
        reject(err);
      }else{
        resolve({stdout,stderr});
      }
    });
  });
}

function ensure(d){
  fs.mkdirSync(d,{recursive:true});
}

function esc(v){
  return String(v||"")
    .replace(/\\/g,"\\\\")
    .replace(/'/g,"\\'")
    .replace(/:/g,"\\:")
    .replace(/\[/g,"\\[")
    .replace(/\]/g,"\\]");
}

async function createSceneVisual(options={}){
  const scene=options.scene||{};
  const n=Number(scene.number||options.sceneNumber||1);

  const width=1280;
  const height=720;

  const dir=
    options.outputDir ||
    path.join(ROOT,"JARVIS/animation/temp");

  ensure(dir);

  const out=
    path.join(
      dir,
      `scene-${n}-cinematic.png`
    );

  const prompt=String(
    scene.visualPrompt ||
    scene.description ||
    scene.narration ||
    "Original cinematic animation"
  ).slice(0,90);

  const text=esc(prompt);

  /*
   * IMPORTANT:
   * All geometry uses explicit 1280x720 coordinates.
   * No iw/ih/h expressions are used for positioning.
   * This avoids FFmpeg expression compatibility problems.
   */

  const filters=[
    "drawbox=x=0:y=0:w=1280:h=720:color=0x08111f:t=fill",

    "drawbox=x=0:y=346:w=1280:h=374:color=0x101827:t=fill",

    "drawbox=x=0:y=446:w=1280:h=274:color=0x070b12:t=fill",

    "drawbox=x=64:y=216:w=154:h=230:color=0x17253a:t=fill",

    "drawbox=x=256:y=144:w=192:h=302:color=0x1b2d45:t=fill",

    "drawbox=x=499:y=245:w=166:h=202:color=0x16263c:t=fill",

    "drawbox=x=717:y=130:w=218:h=317:color=0x1b2a42:t=fill",

    "drawbox=x=986:y=202:w=179:h=245:color=0x16263b:t=fill",

    "drawbox=x=115:y=259:w=18:h=28:color=0xffd166@0.75:t=fill",

    "drawbox=x=307:y=216:w=18:h=30:color=0x4cc9f0@0.75:t=fill",

    "drawbox=x=550:y=288:w=18:h=26:color=0xffd166@0.75:t=fill",

    "drawbox=x=781:y=194:w=18:h=32:color=0x4cc9f0@0.75:t=fill",

    "drawbox=x=1037:y=259:w=18:h=30:color=0xffd166@0.75:t=fill",

    "drawbox=x=995:y=72:w=90:h=90:color=0xeaf6ff@0.90:t=fill",

    "drawbox=x=589:y=324:w=102:h=166:color=0x39d5ff@0.92:t=fill",

    "drawbox=x=608:y=288:w=64:h=58:color=0x0a1422:t=fill",

    "drawbox=x=617:y=306:w=15:h=13:color=white:t=fill",

    "drawbox=x=646:y=306:w=15:h=13:color=white:t=fill",

    "drawbox=x=621:y=340:w=38:h=6:color=white@0.85:t=fill",

    "drawbox=x=621:y=374:w=45:h=58:color=0x07101c:t=fill",

    "drawbox=x=0:y=562:w=1280:h=3:color=0x4cc9f0@0.20:t=fill",

    "drawtext=text='JARVIS':fontcolor=white@0.35:fontsize=22:x=42:y=35",

    `drawtext=text='${text}':fontcolor=white@0.65:fontsize=24:x=45:y=650`
  ].join(",");

  await run(
    "ffmpeg",
    [
      "-y",
      "-f","lavfi",
      "-i","color=c=black:s=1280x720:r=25",
      "-frames:v","1",
      "-vf",filters,
      "-frames:v","1",
      "-update","1",
      out
    ]
  );

  if(
    !fs.existsSync(out) ||
    fs.statSync(out).size<2000
  ){
    throw new Error("VISUAL GENERATION FAILED");
  }

  return out;
}

async function generateSceneVisuals(options={}){
  const scenes=
    Array.isArray(options.scenes)
      ? options.scenes
      : [];

  const files=[];

  for(let i=0;i<scenes.length;i++){
    files.push(
      await createSceneVisual({
        ...options,
        scene:scenes[i],
        sceneNumber:scenes[i]?.number||i+1
      })
    );
  }

  return files;
}

async function createFallbackVisual(options={}){
  return createSceneVisual(options);
}

module.exports={
  createSceneVisual,
  generateSceneVisuals,
  createFallbackVisual
};
