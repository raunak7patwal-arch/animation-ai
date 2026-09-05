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
      }else resolve({stdout,stderr});
    });
  });
}

function ensure(d){
  fs.mkdirSync(d,{recursive:true});
}

function getScenePose(sceneNumber=1,width=1280,height=720){
  return {
    x:Math.round(widtih*0.50),
    y:Math.round(height*0.58),
    scale:1,
    rotation:0,
    sceneNumber
  };
}

async function makeCharacter(
  sceneNumber,
  outputDir,
  width=1280,
  height=720
){
  ensure(outputDir);

  const out=
    path.join(
      outputDir,
      `character-${sceneNumber}.png`
    );

  const filters=[
    "drawbox=x=iw*0.43:y=ih*0.43:w=iw*0.14:h=ih*0.22:color=0x35d8ff:t=fill",

    "drawbox=x=iw*0.45:y=ih*0.34:w=iw*0.10:h=ih*0.11:color=0x16283c:t=fill",

    "drawbox=x=iw*0.465:y=ih*0.375:w=iw*0.018:h=ih*0.018:color=white:t=fill",

    "drawbox=x=iw*0.515:y=ih*0.375:w=iw*0.018:h=ih*0.018:color=white:t=fill",

    "drawbox=x=iw*0.47:y=ih*0.405:w=iw*0.06:h=ih*0.008:color=white:t=fill",

    "drawbox=x=iw*0.445:y=ih*0.65:w=iw*0.035:h=ih*0.20:color=0x1a9fca:t=fill",

    "drawbox=x=iw*0.52:y=ih*0.65:w=iw*0.035:h=ih*0.20:color=0x1a9fca:t=fill",

    "drawbox=x=iw*0.38:y=ih*0.48:w=iw*0.05:h=ih*0.12:color=0x247b9b:t=fill",

    "drawbox=x=iw*0.57:y=ih*0.48:w=iw*0.05:h=ih*0.12:color=0x247b9b:t=fill"
  ].join(",");

  await run(
    "ffmpeg",
    [
      "-y",
      "-f","lavfi",
      "-i",`color=c=black:s=${width}x${height}`,
      "-frames:v","1",
      "-vf",filters,
      out
    ]
  );

  if(
    !fs.existsSync(out) ||
    fs.statSync(out).size<1000
  ){
    throw new Error("CHARACTER GENERATION FAILED");
  }

  return out;
}

async function addCharacters(options={}){
  const scenes=
    Array.isArray(options.scenes)
      ? options.scenes
      : [];

  const dir=
    options.outputDir ||
    path.join(ROOT,"JARVIS/animation/characters");

  const files=[];

  for(let i=0;i<scenes.length;i++){
    files.push(
      await makeCharacter(
        scenes[i]?.number||i+1,
        dir,
        Number(options.width)||1280,
        Number(options.height)||720
      )
    );
  }

  return files;
}

async function generateCharacterVisuals(options={}){
  return addCharacters(options);
}

module.exports={
  addCharacters,
  generateCharacterVisuals,
  getScenePose
};
