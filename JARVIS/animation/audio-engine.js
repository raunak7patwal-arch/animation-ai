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
