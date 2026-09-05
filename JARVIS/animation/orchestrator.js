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
