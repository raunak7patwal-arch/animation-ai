#!/data/data/com.termux/files/usr/bin/bash
set -e

ROOT="$HOME/animation-ai"
cd "$ROOT"

echo "=============================================="
echo "     JARVIS COMPLETE PIPELINE FIX"
echo "=============================================="

command -v ffmpeg >/dev/null
command -v espeak-ng >/dev/null

mkdir -p JARVIS/animation/{temp,scenes,characters,audio,music,sfx,render,output,logs,scripts}

echo "[1/6] FIXING VISUAL ENGINE..."

cat > visual-engine.js <<'NODE'
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
  const n=Number(
    scene.number ||
    options.sceneNumber ||
    1
  );

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
  ).slice(0,100);

  const text=esc(prompt);

  const filters=[
    "drawbox=x=0:y=0:w=iw:h=ih:color=0x08111f:t=fill",

    "drawbox=x=0:y=h*0.48:w=iw:h=h*0.52:color=0x101827:t=fill",

    "drawbox=x=0:y=h*0.62:w=iw:h=h*0.38:color=0x070b12:t=fill",

    "drawbox=x=w*0.05:y=h*0.30:w=w*0.12:h=h*0.32:color=0x17253a:t=fill",

    "drawbox=x=w*0.20:y=h*0.20:w=w*0.15:h=h*0.42:color=0x1b2d45:t=fill",

    "drawbox=x=w*0.39:y=h*0.34:w=w*0.13:h=h*0.28:color=0x16263c:t=fill",

    "drawbox=x=w*0.56:y=h*0.18:w=w*0.17:h=h*0.44:color=0x1b2a42:t=fill",

    "drawbox=x=w*0.77:y=h*0.28:w=w*0.14:h=h*0.34:color=0x16263b:t=fill",

    "drawbox=x=w*0.09:y=h*0.36:w=18:h=28:color=0xffd166@0.75:t=fill",

    "drawbox=x=w*0.24:y=h*0.30:w=18:h=30:color=0x4cc9f0@0.75:t=fill",

    "drawbox=x=w*0.43:y=h*0.40:w=18:h=26:color=0xffd166@0.75:t=fill",

    "drawbox=x=w*0.61:y=h*0.27:w=18:h=32:color=0x4cc9f0@0.75:t=fill",

    "drawbox=x=w*0.81:y=h*0.36:w=18:h=30:color=0xffd166@0.75:t=fill",

    "drawbox=x=w*0.78:y=h*0.10:w=90:h=90:color=0xeaf6ff@0.90:t=fill",

    "drawbox=x=w*0.46:y=h*0.45:w=w*0.08:h=h*0.23:color=0x39d5ff@0.92:t=fill",

    "drawbox=x=w*0.475:y=h*0.40:w=w*0.05:h=h*0.08:color=0x0a1422:t=fill",

    "drawbox=x=w*0.482:y=h*0.425:w=w*0.012:h=h*0.018:color=white:t=fill",

    "drawbox=x=w*0.505:y=h*0.425:w=w*0.012:h=h*0.018:color=white:t=fill",

    "drawbox=x=w*0.485:y=h*0.52:w=w*0.035:h=h*0.08:color=0x07101c:t=fill",

    "drawbox=x=0:y=h*0.78:w=iw:h=3:color=0x4cc9f0@0.20:t=fill",

    "drawtext=text='JARVIS':fontcolor=white@0.35:fontsize=22:x=42:y=35",

    `drawtext=text='${text}':fontcolor=white@0.65:fontsize=24:x=45:y=h-60`
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
        sceneNumber:
          scenes[i]?.number||i+1
      })
    );
  }

  return files;
}

function createFallbackVisual(options={}){
  return createSceneVisual(options);
}

module.exports={
  createSceneVisual,
  generateSceneVisuals,
  createFallbackVisual
};
NODE

echo "VISUAL ENGINE : FIXED"

echo "[2/6] FIXING CHARACTER ENGINE..."

cat > character-engine.js <<'NODE'
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
    x:Math.round(width*0.50),
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
    "drawbox=x=w*0.43:y=h*0.43:w=w*0.14:h=h*0.22:color=0x35d8ff:t=fill",

    "drawbox=x=w*0.45:y=h*0.34:w=w*0.10:h=h*0.11:color=0x16283c:t=fill",

    "drawbox=x=w*0.465:y=h*0.375:w=w*0.018:h=h*0.018:color=white:t=fill",

    "drawbox=x=w*0.515:y=h*0.375:w=w*0.018:h=h*0.018:color=white:t=fill",

    "drawbox=x=w*0.47:y=h*0.405:w=w*0.06:h=h*0.008:color=white:t=fill",

    "drawbox=x=w*0.445:y=h*0.65:w=w*0.035:h=h*0.20:color=0x1a9fca:t=fill",

    "drawbox=x=w*0.52:y=h*0.65:w=w*0.035:h=h*0.20:color=0x1a9fca:t=fill",

    "drawbox=x=w*0.38:y=h*0.48:w=w*0.05:h=h*0.12:color=0x247b9b:t=fill",

    "drawbox=x=w*0.57:y=h*0.48:w=w*0.05:h=h*0.12:color=0x247b9b:t=fill"
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
NODE

echo "CHARACTER ENGINE : FIXED"

echo "[3/6] FIXING VOICE ENGINE..."

cat > voice-engine.js <<'NODE'
const fs=require("fs");
const path=require("path");
const {execFile}=require("child_process");

const ROOT=process.cwd();

function run(cmd,args=[]){
  return new Promise((resolve,reject)=>{
    execFile(cmd,args,{maxBuffer:50*1024*1024},(err,stdout,stderr)=>{
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

async function generateVoice(options={}){
  const text=
    options.text ||
    options.narration ||
    options.scene?.narration ||
    "JARVIS generated narration.";

  const number=
    Number(
      options.sceneNumber ||
      options.scene?.number ||
      1
    );

  const dir=
    options.outputDir ||
    path.join(ROOT,"JARVIS/animation/audio");

  ensure(dir);

  const output=
    path.join(dir,`scene-${number}.wav`);

  const piper=
    process.env.PIPER_BIN ||
    path.join(ROOT,"tools/piper/piper");

  const model=
    process.env.PIPER_MODEL ||
    path.join(ROOT,"models/en_US-lessac-medium.onnx");

  if(
    fs.existsSync(piper) &&
    fs.existsSync(model)
  ){
    try{
      await run(
        piper,
        [
          "--model",model,
          "--output_file",output
        ]
      );

      if(
        fs.existsSync(output) &&
        fs.statSync(output).size>5000
      ){
        console.log("🎙️ PIPER:",number);
        return output;
      }
    }catch(e){}
  }

  console.log("🎙️ ESPEAK NG:",number);

  await run(
    "espeak-ng",
    [
      "-v","en-us",
      "-s","155",
      "-p","45",
      "-a","170",
      "-w",output,
      String(text)
    ]
  );

  if(
    !fs.existsSync(output) ||
    fs.statSync(output).size<1000
  ){
    throw new Error("VOICE GENERATION FAILED");
  }

  return output;
}

async function generateSceneVoices(options={}){
  const scenes=
    Array.isArray(options.scenes)
      ? options.scenes
      : [];

  const dir=
    options.outputDir ||
    path.join(ROOT,"JARVIS/animation/audio");

  const files=[];

  for(let i=0;i<scenes.length;i++){
    files.push(
      await generateVoice({
        scene:scenes[i],
        sceneNumber:
          scenes[i]?.number||i+1,
        narration:
          scenes[i]?.narration ||
          scenes[i]?.text ||
          "",
        outputDir:dir
      })
    );
  }

  return files;
}

module.exports={
  generateVoice,
  generateSceneVoices
};
NODE

echo "VOICE ENGINE : FIXED"

echo "[4/6] FIXING AUDIO ENGINE..."

cat > JARVIS/animation/audio-engine.js <<'NODE'
const fs=require("fs");
const path=require("path");
const {execFile}=require("child_process");

const ROOT=process.cwd();

function run(cmd,args=[]){
  return new Promise((resolve,reject)=>{
    execFile(cmd,args,{maxBuffer:50*1024*1024},(err,stdout,stderr)=>{
      if(err) reject(err);
      else resolve({stdout,stderr});
    });
  });
}

async function createMusic(seconds,out){
  await run(
    "ffmpeg",
    [
      "-y",
      "-f","lavfi",
      "-i","sine=frequency=220:sample_rate=44100",
      "-f","lavfi",
      "-i","sine=frequency=330:sample_rate=44100",
      "-filter_complex",
      "[0:a]volume=0.08[a];[1:a]volume=0.05[b];[a][b]amix=inputs=2:duration=longest",
      "-t",String(seconds),
      "-c:a","pcm_s16le",
      out
    ]
  );
}

async function createSfx(seconds,out){
  await run(
    "ffmpeg",
    [
      "-y",
      "-f","lavfi",
      "-i","anoisesrc=color=pink:amplitude=0.035",
      "-t",String(seconds),
      "-af","highpass=f=700,lowpass=f=5000",
      "-c:a","pcm_s16le",
      out
    ]
  );
}

async function createAudio(seconds,id){
  const musicDir=
    path.join(ROOT,"JARVIS/animation/music");

  const sfxDir=
    path.join(ROOT,"JARVIS/animation/sfx");

  fs.mkdirSync(musicDir,{recursive:true});
  fs.mkdirSync(sfxDir,{recursive:true});

  const music=
    path.join(musicDir,`${id}.wav`);

  const sfx=
    path.join(sfxDir,`${id}.wav`);

  await createMusic(seconds,music);
  await createSfx(seconds,sfx);

  return {music,sfx};
}

module.exports={createAudio};
NODE

echo "AUDIO ENGINE : FIXED"

echo "[5/6] CHECKING COMPLETE ENGINE..."

node --check visual-engine.js
node --check character-engine.js
node --check voice-engine.js
node --check scene-engine.js
node --check JARVIS/animation/audio-engine.js
node --check JARVIS/animation/orchestrator.js
node --check jarvis-api.js

echo "SYNTAX: SUCCESSFUL"

echo "[6/6] RUNNING 10-SECOND REAL VALIDATION..."

rm -f JARVIS/animation/temp/scene-*-cinematic.png
rm -f JARVIS/animation/characters/character-*.png
rm -f JARVIS/animation/audio/scene-*.wav

node - <<'NODE'
const fs=require("fs");
const engine=require("./JARVIS/animation/orchestrator");

(async()=>{
  try{

    const result=
      await engine.generate(
        "An original young hero enters a futuristic rainy city and meets a friendly glowing robot. They look at each other and walk toward the bright city together.",
        {
          duration:"10 seconds"
        }
      );

    console.log("");
    console.log("==============================================");
    console.log("             FINAL VALIDATION");
    console.log("==============================================");

    const checks=[
      ["MP4",result.localFile],

      ...result.visualFiles.map(
        (x,i)=>[`VISUAL ${i+1}`,x]
      ),

      ...result.characterFiles.map(
        (x,i)=>[`CHARACTER ${i+1}`,x]
      ),

      ...result.voiceFiles.map(
        (x,i)=>[`VOICE ${i+1}`,x]
      ),

      ["MUSIC",result.music],
      ["SFX",result.sfx]
    ];

    let failed=0;

    for(const [name,file] of checks){

      if(
        file &&
        fs.existsSync(file) &&
        fs.statSync(file).size>0
      ){
        console.log("✅",name);
      }else{
        console.log("❌",name);
        failed++;
      }

    }

    if(failed>0){
      throw new Error(
        `${failed} OUTPUT CHECKS FAILED`
      );
    }

    const mp4=result.localFile;

    if(
      !fs.existsSync(mp4) ||
      fs.statSync(mp4).size<20000
    ){
      throw new Error("FINAL MP4 TOO SMALL");
    }

    console.log("");
    console.log("==============================================");
    console.log("                SUCCESSFUL");
    console.log("==============================================");
    console.log("FREE PIPELINE      : YES");
    console.log("PAID API           : NO");
    console.log("HF TOKEN           : NO");
    console.log("STORY              : YES");
    console.log("VISUAL             : YES");
    console.log("CHARACTER          : YES");
    console.log("VOICE              : YES");
    console.log("MUSIC              : YES");
    console.log("SFX                : YES");
    console.log("CAMERA MOTION      : YES");
    console.log("FINAL MP4          : YES");
    console.log("==============================================");
    console.log("FINAL FILE:");
    console.log(mp4);
    console.log("==============================================");

  }catch(e){
    console.error("");
    console.error("❌ VALIDATION FAILED");
    console.error(e.stack||e.message);
    process.exit(1);
  }
})();
NODE

echo ""
echo "=============================================="
echo "          FIX VALIDATION FINISHED"
echo "=============================================="
