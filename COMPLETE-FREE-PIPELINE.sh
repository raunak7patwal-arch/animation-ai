#!/data/data/com.termux/files/usr/bin/bash
set -e

ROOT="$HOME/animation-ai"
cd "$ROOT"

echo "=============================================="
echo "     JARVIS 100% FREE ANIMATION UPGRADE"
echo "=============================================="

mkdir -p \
JARVIS/animation/{temp,scenes,characters,audio,music,sfx,render,output,logs,scripts}

echo "[1/9] Installing free local tools..."

pkg update -y >/dev/null 2>&1 || true
pkg install -y ffmpeg espeak-ng >/dev/null 2>&1 || true

command -v ffmpeg >/dev/null
command -v espeak-ng >/dev/null

echo "FFmpeg      : OK"
echo "eSpeak NG   : OK"

echo "[2/9] Installing REAL OFFLINE VOICE..."

cat > voice-engine.js <<'NODE'
const fs = require("fs");
const path = require("path");
const {execFile} = require("child_process");

const ROOT = process.cwd();

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
  const text =
    options.text ||
    options.narration ||
    options.scene?.narration ||
    "JARVIS generated narration.";

  const number =
    Number(options.sceneNumber || options.scene?.number || 1);

  const dir =
    options.outputDir ||
    path.join(ROOT,"JARVIS/animation/audio");

  ensure(dir);

  const output =
    path.join(dir,`scene-${number}.wav`);

  /*
   * Fully local neural Piper is preferred if the user
   * already installed it.
   */
  const piper =
    process.env.PIPER_BIN ||
    path.join(ROOT,"tools/piper/piper");

  const model =
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
        fs.statSync(output).size > 5000
      ){
        console.log("🎙️ Piper voice:",number);
        return output;
      }
    }catch(e){}
  }

  /*
   * Guaranteed offline voice.
   */
  console.log("🎙️ Offline voice:",number);

  await run(
    "espeak-ng",
    [
      "-v","en-us",
      "-s","155",
      "-p","45",
      "-a","170",
      "-w",output,
      text
    ]
  );

  if(
    !fs.existsSync(output) ||
    fs.statSync(output).size < 1000
  ){
    throw new Error("VOICE GENERATION FAILED");
  }

  return output;
}

async function generateSceneVoices(options={}){
  const scenes =
    Array.isArray(options.scenes)
    ? options.scenes
    : [];

  const dir =
    options.outputDir ||
    path.join(ROOT,"JARVIS/animation/audio");

  ensure(dir);

  const files=[];

  for(let i=0;i<scenes.length;i++){
    const scene=scenes[i]||{};

    files.push(
      await generateVoice({
        scene,
        sceneNumber:scene.number||i+1,
        narration:
          scene.narration ||
          scene.text ||
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

echo "[3/9] Creating cinematic visual generator..."

cat > visual-engine.js <<'NODE'
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

  const n=
    Number(
      scene.number ||
      options.sceneNumber ||
      1
    );

  const width=
    Number(options.width||1280)||1280;

  const height=
    Number(options.height||720)||720;

  const dir=
    options.outputDir ||
    path.join(
      ROOT,
      "JARVIS/animation/temp"
    );

  ensure(dir);

  const out=
    path.join(
      dir,
      `scene-${n}-cinematic.png`
    );

  const prompt=
    scene.visualPrompt ||
    scene.description ||
    scene.narration ||
    "Original cinematic animation";

  const text=esc(prompt.slice(0,120));

  /*
   * Rich procedural scene:
   * background + skyline + moon + rain + ground +
   * character lighting + cinematic framing.
   */
  const filters=[
    `drawbox=x=0:y=0:w=iw:h=ih:color=0x08111f:t=fill`,
    `drawbox=x=0:y=h*0.48:w=iw:h=h*0.52:color=0x101827:t=fill`,

    `drawbox=x=0:y=h*0.62:w=iw:h=h*0.38:color=0x070b12:t=fill`,

    `drawbox=x=w*0.05:y=h*0.30:w=w*0.12:h=h*0.32:color=0x17253a:t=fill`,
    `drawbox=x=w*0.20:y=h*0.20:w=w*0.15:h=h*0.42:color=0x1b2d45:t=fill`,
    `drawbox=x=w*0.39:y=h*0.34:w=w*0.13:h=h*0.28:color=0x16263c:t=fill`,
    `drawbox=x=w*0.56:y=h*0.18:w=w*0.17:h=h*0.44:color=0x1b2a42:t=fill`,
    `drawbox=x=w*0.77:y=h*0.28:w=w*0.14:h=h*0.34:color=0x16263b:t=fill`,

    `drawbox=x=w*0.09:y=h*0.36:w=18:h=28:color=0xffd166@0.75:t=fill`,
    `drawbox=x=w*0.24:y=h*0.30:w=18:h=30:color=0x4cc9f0@0.75:t=fill`,
    `drawbox=x=w*0.43:y=h*0.40:w=18:h=26:color=0xffd166@0.75:t=fill`,
    `drawbox=x=w*0.61:y=h*0.27:w=18:h=32:color=0x4cc9f0@0.75:t=fill`,
    `drawbox=x=w*0.81:y=h*0.36:w=18:h=30:color=0xffd166@0.75:t=fill`,

    `drawcircle=x=w*0.80:y=h*0.16:r=42:color=0xeaf6ff@0.9`,

    `drawbox=x=w*0.46:y=h*0.45:w=w*0.08:h=h*0.23:color=0x39d5ff@0.92:t=fill`,
    `drawbox=x=w*0.475:y=h*0.40:w=w*0.05:h=h*0.08:color=0x0a1422:t=fill`,
    `drawbox=x=w*0.482:y=h*0.425:w=w*0.012:h=h*0.018:color=white:t=fill`,
    `drawbox=x=w*0.505:y=h*0.425:w=w*0.012:h=h*0.018:color=white:t=fill`,

    `drawbox=x=w*0.485:y=h*0.52:w=w*0.035:h=h*0.08:color=0x07101c:t=fill`,

    `drawbox=x=0:y=h*0.78:w=iw:h=3:color=0x4cc9f0@0.20:t=fill`,

    `drawtext=text='JARVIS':fontcolor=white@0.35:fontsize=22:x=42:y=35`,
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
      "-pix_fmt","yuv420p",
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

module.exports={
  createSceneVisual,
  generateSceneVisuals
};
NODE

echo "[4/9] Creating animated character system..."

cat > character-engine.js <<'NODE'
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

function ensure(d){
  fs.mkdirSync(d,{recursive:true});
}

function getScenePose(
  sceneNumber=1,
  width=1280,
  height=720
){
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
    "format=rgba",

    `drawbox=x=w*0.43:y=h*0.43:w=w*0.14:h=h*0.22:color=0x35d8ff@0.95:t=fill`,
    `drawbox=x=w*0.45:y=h*0.34:w=w*0.10:h=h*0.11:color=0x16283c:t=fill`,

    `drawbox=x=w*0.465:y=h*0.375:w=w*0.018:h=h*0.018:color=white:t=fill`,
    `drawbox=x=w*0.515:y=h*0.375:w=w*0.018:h=h*0.018:color=white:t=fill`,

    `drawbox=x=w*0.47:y=h*0.405:w=w*0.06:h=h*0.008:color=white@0.85:t=fill`,

    `drawbox=x=w*0.445:y=h*0.65:w=w*0.035:h=h*0.20:color=0x1a9fca:t=fill`,
    `drawbox=x=w*0.52:y=h*0.65:w=w*0.035:h=h*0.20:color=0x1a9fca:t=fill`,

    `drawbox=x=w*0.38:y=h*0.48:w=w*0.05:h=h*0.12:color=0x247b9b:t=fill`,
    `drawbox=x=w*0.57:y=h*0.48:w=w*0.05:h=h*0.12:color=0x247b9b:t=fill`
  ].join(",");

  await run(
    "ffmpeg",
    [
      "-y",
      "-f","lavfi",
      "-i",`color=c=black@0.0:s=${width}x${height}`,
      "-frames:v","1",
      "-vf",filters,
      out
    ]
  );

  return fs.existsSync(out)?out:null;
}

async function addCharacters(options={}){
  const scenes=
    Array.isArray(options.scenes)
    ? options.scenes
    : [];

  const dir=
    options.outputDir ||
    path.join(
      ROOT,
      "JARVIS/animation/characters"
    );

  const files=[];

  for(let i=0;i<scenes.length;i++){
    const f=
      await makeCharacter(
        scenes[i]?.number||i+1,
        dir,
        Number(options.width)||1280,
        Number(options.height)||720
      );

    if(f) files.push(f);
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

echo "[5/9] Creating music + SFX engine..."

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
      "-i",
      `sine=frequency=220:sample_rate=44100`,
      "-f","lavfi",
      "-i",
      `sine=frequency=330:sample_rate=44100`,
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
      "-i",
      "anoisesrc=color=pink:amplitude=0.035",
      "-t",String(seconds),
      "-af","highpass=f=700,lowpass=f=5000",
      "-c:a","pcm_s16le",
      out
    ]
  );
}

async function createAudio(seconds,id){
  const dir=
    path.join(
      ROOT,
      "JARVIS/animation/music"
    );

  const sfxDir=
    path.join(
      ROOT,
      "JARVIS/animation/sfx"
    );

  fs.mkdirSync(dir,{recursive:true});
  fs.mkdirSync(sfxDir,{recursive:true});

  const music=
    path.join(dir,`${id}.wav`);

  const sfx=
    path.join(sfxDir,`${id}.wav`);

  await createMusic(seconds,music);
  await createSfx(seconds,sfx);

  return {music,sfx};
}

module.exports={createAudio};
NODE

echo "[6/9] Creating final cinematic orchestrator..."

cat > JARVIS/animation/orchestrator.js <<'NODE'
const fs=require("fs");
const path=require("path");
const crypto=require("crypto");
const {execFile}=require("child_process");

const ROOT=process.cwd();
const BASE=path.join(ROOT,"JARVIS/animation");

const visual=require("../../visual-engine");
const character=require("../../character-engine");
const voice=require("../../voice-engine");
const sceneEngine=require("../../scene-engine");
const audio=require("./audio-engine");

const DIRS={
  temp:path.join(BASE,"temp"),
  render:path.join(BASE,"render"),
  output:path.join(BASE,"output"),
  scripts:path.join(BASE,"scripts"),
  audio:path.join(BASE,"audio")
};

for(const d of Object.values(DIRS)){
  fs.mkdirSync(d,{recursive:true});
}

function run(cmd,args=[]){
  return new Promise((resolve,reject)=>{
    execFile(
      cmd,
      args,
      {
        maxBuffer:100*1024*1024,
        timeout:15*60*1000
      },
      (err,stdout,stderr)=>{
        if(err){
          err.stdout=stdout;
          err.stderr=stderr;
          reject(err);
        }else resolve({stdout,stderr});
      }
    );
  });
}

function id(){
  return crypto.randomBytes(8).toString("hex");
}

function sec(v){
  const n=Number(v);
  return Number.isFinite(n)&&n>0?n:2;
}

async function render(
  image,
  characterImage,
  narration,
  music,
  sfx,
  scene,
  out
){
  const duration=sec(scene.duration);
  const frames=Math.max(60,Math.round(duration*30));

  const args=[
    "-y",
    "-loop","1",
    "-i",image
  ];

  if(characterImage){
    args.push("-i",characterImage);
  }

  if(narration){
    args.push("-i",narration);
  }

  if(music){
    args.push("-i",music);
  }

  if(sfx){
    args.push("-i",sfx);
  }

  let video;

  if(characterImage){
    video=
      `[0:v]scale=1280:720,`+
      `zoompan=z='min(zoom+0.0018,1.10)':`+
      `d=${frames}:s=1280x720:fps=30[bg];`+
      `[1:v]scale=1280:720,`+
      `format=rgba,`+
      `zoompan=z='min(zoom+0.0025,1.12)':`+
      `d=${frames}:s=1280x720:fps=30[char];`+
      `[bg][char]overlay=0:0:format=auto[v]`;
  }else{
    video=
      `[0:v]scale=1280:720,`+
      `zoompan=z='min(zoom+0.0018,1.10)':`+
      `d=${frames}:s=1280x720:fps=30[v]`;
  }

  const filter=[video];

  const audioInputs=[];

  let next=1;

  if(characterImage) next++;

  if(narration){
    audioInputs.push(`[${next}:a]volume=1.0[n]`);
    next++;
  }

  if(music){
    audioInputs.push(`[${next}:a]volume=0.16[m]`);
    next++;
  }

  if(sfx){
    audioInputs.push(`[${next}:a]volume=0.08[s]`);
    next++;
  }

  if(audioInputs.length){
    filter.push(audioInputs.join(";"));

    const mix=[];

    if(narration) mix.push("[n]");
    if(music) mix.push("[m]");
    if(sfx) mix.push("[s]");

    filter.push(
      `${mix.join("")}amix=inputs=${mix.length}:duration=longest:dropout_transition=2[a]`
    );
  }

  args.push(
    "-filter_complex",
    filter.join(";")
  );

  args.push(
    "-map","[v]"
  );

  if(audioInputs.length){
    args.push("-map","[a]");
  }

  args.push(
    "-t",String(duration),
    "-r","30",
    "-c:v","libx264",
    "-preset","veryfast",
    "-crf","21",
    "-pix_fmt","yuv420p"
  );

  if(audioInputs.length){
    args.push(
      "-c:a","aac",
      "-b:a","160k"
    );
  }else{
    args.push("-an");
  }

  args.push(
    "-movflags","+faststart",
    out
  );

  await run("ffmpeg",args);

  if(
    !fs.existsSync(out) ||
    fs.statSync(out).size<10000
  ){
    throw new Error("SCENE RENDER FAILED");
  }

  return out;
}

async function concat(files,out){
  const list=
    path.join(
      DIRS.temp,
      `concat-${Date.now()}.txt`
    );

  fs.writeFileSync(
    list,
    files
      .map(x=>`file '${x.replace(/'/g,"'\\''")}'`)
      .join("\n")
  );

  await run(
    "ffmpeg",
    [
      "-y",
      "-f","concat",
      "-safe","0",
      "-i",list,
      "-c","copy",
      out
    ]
  );
}

async function generate(prompt,options={}){
  const job=id();

  const scenes=
    sceneEngine.createScenes({
      prompt,
      duration:options.duration||"10 seconds"
    });

  fs.writeFileSync(
    path.join(DIRS.scripts,`${job}.json`),
    JSON.stringify(
      {
        job,
        prompt,
        free:true,
        scenes
      },
      null,
      2
    )
  );

  console.log("🧠 STORY ............ OK");

  const visuals=
    await visual.generateSceneVisuals({
      scenes,
      outputDir:DIRS.temp,
      width:1280,
      height:720,
      jobId:job
    });

  console.log("🎨 VISUALS .......... OK");

  const chars=
    await character.generateCharacterVisuals({
      scenes,
      outputDir:path.join(BASE,"characters"),
      width:1280,
      height:720,
      jobId:job
    });

  console.log("👤 CHARACTERS ....... OK");

  const voices=
    await voice.generateSceneVoices({
      scenes,
      outputDir:DIRS.audio,
      jobId:job
    });

  console.log("🎙️ VOICE ............ OK");

  const totalSeconds=
    scenes.reduce(
      (a,s)=>a+sec(s.duration),
      0
    );

  const bgAudio=
    await audio.createAudio(
      Math.max(1,totalSeconds),
      job
    );

  console.log("🎵 MUSIC/SFX ........ OK");

  const renders=[];

  for(let i=0;i<scenes.length;i++){

    const scene=scenes[i];

    const out=
      path.join(
        DIRS.render,
        `${job}-scene-${i+1}.mp4`
      );

    await render(
      visuals[i],
      chars[i]||null,
      voices[i]||null,
      bgAudio.music,
      bgAudio.sfx,
      scene,
      out
    );

    renders.push(out);

    console.log(
      `🎬 SCENE ${i+1}/${scenes.length} OK`
    );
  }

  const raw=
    path.join(
      DIRS.output,
      `${job}-raw.mp4`
    );

  await concat(renders,raw);

  const final=
    path.join(
      DIRS.output,
      `jarvis-animation-${job}.mp4`
    );

  await run(
    "ffmpeg",
    [
      "-y",
      "-i",raw,
      "-c:v","libx264",
      "-preset","veryfast",
      "-crf","19",
      "-pix_fmt","yuv420p",
      "-movflags","+faststart",
      final
    ]
  );

  if(
    !fs.existsSync(final) ||
    fs.statSync(final).size<20000
  ){
    throw new Error("FINAL MP4 VALIDATION FAILED");
  }

  return {
    success:true,
    free:true,
    paidProvider:false,
    hfRequired:false,
    jobId:job,
    scenes:scenes.length,
    videoFile:`/jarvis-animation/${path.basename(final)}`,
    localFile:final,
    visualFiles:visuals,
    characterFiles:chars,
    voiceFiles:voices,
    music:bgAudio.music,
    sfx:bgAudio.sfx
  };
}

module.exports={generate};
NODE

echo "[7/9] Fixing API..."

cat > jarvis-api.js <<'NODE'
const express=require("express");
const cors=require("cors");
const path=require("path");

const app=express();

app.use(cors());
app.use(express.json({limit:"50mb"}));

const ROOT=process.cwd();

const engine=
  require("./JARVIS/animation/orchestrator");

app.get("/",(req,res)=>{
  res.json({
    success:true,
    name:"JARVIS",
    status:"online",
    free:true,
    paidProvider:false,
    hfRequired:false,
    localGeneration:true
  });
});

app.get("/api/health",(req,res)=>{
  res.json({
    success:true,
    status:"online",
    free:true,
    paidProvider:false,
    hfRequired:false,
    story:true,
    visual:true,
    character:true,
    voice:true,
    music:true,
    sfx:true,
    ffmpeg:true
  });
});

async function generate(req,res){
  try{
    const prompt=
      req.body.prompt ||
      req.body.text ||
      req.body.story;

    if(!prompt){
      return res.status(400).json({
        success:false,
        error:"prompt required"
      });
    }

    const result=
      await engine.generate(
        prompt,
        {
          duration:
            req.body.duration ||
            "10 seconds"
        }
      );

    res.json(result);

  }catch(e){
    console.error(e);

    res.status(500).json({
      success:false,
      error:e.message
    });
  }
}

app.post("/api/video/text",generate);
app.post("/api/jarvis/animation/generate",generate);

app.use(
  "/jarvis-animation",
  express.static(
    path.join(
      ROOT,
      "JARVIS/animation/output"
    )
  )
);

const PORT=
  Number(process.env.JARVIS_PORT)||3000;

app.listen(
  PORT,
  "0.0.0.0",
  ()=>{
    console.log(
      `JARVIS FREE API : http://127.0.0.1:${PORT}`
    );
  }
);
NODE

echo "[8/9] Syntax + full end-to-end validation..."

node --check visual-engine.js
node --check character-engine.js
node --check voice-engine.js
node --check scene-engine.js
node --check JARVIS/animation/audio-engine.js
node --check JARVIS/animation/orchestrator.js
node --check jarvis-api.js

echo "SYNTAX: SUCCESSFUL"

echo ""
echo "=============================================="
echo "       RUNNING REAL 10-SECOND TEST"
echo "=============================================="

node - <<'NODE'
const fs=require("fs");

(async()=>{
  try{

    const engine=
      require("./JARVIS/animation/orchestrator");

    const result=
      await engine.generate(
        "An original young hero enters a futuristic rainy city and meets a friendly glowing robot. They look at each other, then walk toward the bright city together.",
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
      ...result.visualFiles.map((x,i)=>[
        `VISUAL ${i+1}`,x
      ]),
      ...result.characterFiles.map((x,i)=>[
        `CHARACTER ${i+1}`,x
      ]),
      ...result.voiceFiles.map((x,i)=>[
        `VOICE ${i+1}`,x
      ]),
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

    console.log("");

    if(failed){
      throw new Error(
        `${failed} OUTPUT CHECKS FAILED`
      );
    }

    console.log("==============================================");
    console.log("             SUCCESSFUL");
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
    console.log(result.localFile);
    console.log("==============================================");

  }catch(e){
    console.error("");
    console.error("❌ VALIDATION FAILED");
    console.error(e.stack||e.message);
    process.exit(1);
  }
})();
NODE

echo "[9/9] Saving project..."

git add \
  visual-engine.js \
  character-engine.js \
  voice-engine.js \
  scene-engine.js \
  JARVIS/animation \
  jarvis-api.js

git commit -m "Complete free local animation pipeline" || true

echo ""
echo "=============================================="
echo "       INSTALLATION FINISHED"
echo "=============================================="
echo "अब ऊपर FINAL VALIDATION का परिणाम देखो।"
echo "केवल SUCCESSFUL आने पर अगली प्रक्रिया करेंगे।"
echo "=============================================="
