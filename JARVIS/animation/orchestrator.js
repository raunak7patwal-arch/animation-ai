const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { spawn } = require("child_process");

const ROOT = path.resolve(__dirname, "../..");
const BASE = path.join(ROOT, "JARVIS", "animation");
const OUTPUT = path.join(BASE, "output");

for (const d of ["scripts","scenes","characters","audio","render","output","temp"])
  fs.mkdirSync(path.join(BASE,d), {recursive:true});

function id() {
  return crypto.randomBytes(8).toString("hex");
}

function run(cmd,args,options={}) {
  return new Promise((resolve,reject)=>{
    const p = spawn(cmd,args,{stdio:["ignore","pipe","pipe"],...options});
    let out="",err="";
    p.stdout.on("data",x=>out+=x);
    p.stderr.on("data",x=>err+=x);
    p.on("error",reject);
    p.on("close",code=>{
      if(code===0) resolve({out,err});
      else reject(new Error(`${cmd} failed (${code})\n${err.slice(-3000)}`));
    });
  });
}

function safeText(x) {
  return String(x || "").replace(/[<>]/g,"").trim();
}

function makePlan(prompt) {
  prompt = safeText(prompt);

  const sentences = prompt
    .split(/[.!?।]+/)
    .map(x=>x.trim())
    .filter(Boolean);

  const chunks = sentences.length
    ? sentences
    : [prompt || "An original animated story begins."];

  const scenes = chunks.slice(0,20).map((text,i)=>({
    number:i+1,
    duration:Math.max(4,Math.min(12,4+Math.ceil(text.length/70))),
    narration:text,
    visualPrompt:
      `Original cinematic animated scene. ${text}. `+
      `Consistent original characters, expressive acting, clean composition, `+
      `cinematic lighting, controlled camera movement, polished animation, `+
      `no logos, no copyrighted characters, no imitation of another creator.`
  }));

  return {
    id:id(),
    title:"JARVIS Animated Story",
    prompt,
    style:"original cinematic animation",
    scenes
  };
}

async function createClip(scene,imageFile,audioFile,outFile) {
  const duration = String(scene.duration);

  const args = [
    "-y",
    "-loop","1",
    "-i",imageFile
  ];

  if(audioFile && fs.existsSync(audioFile))
    args.push("-i",audioFile);

  args.push(
    "-t",duration,
    "-vf",
    "scale=1280:720:force_original_aspect_ratio=decrease,"+
    "pad=1280:720:(ow-iw)/2:(oh-ih)/2,"+
    "zoompan=z='min(zoom+0.0008,1.10)':d=300:s=1280x720:fps=30,"+
    "format=yuv420p",
    "-r","30",
    "-c:v","libx264",
    "-preset","veryfast",
    "-crf","20"
  );

  if(audioFile && fs.existsSync(audioFile))
    args.push("-c:a","aac","-b:a","192k","-shortest");
  else
    args.push("-an");

  args.push(outFile);

  await run("ffmpeg",args);
}

async function concat(files,out) {
  const list = path.join(BASE,"temp",`${id()}.txt`);
  fs.writeFileSync(
    list,
    files.map(f=>`file '${f.replace(/'/g,"'\\''")}'`).join("\n")
  );

  await run("ffmpeg",[
    "-y","-f","concat","-safe","0",
    "-i",list,
    "-c","copy",
    out
  ]);

  fs.unlinkSync(list);
}

async function generate(prompt, options={}) {
  const plan = makePlan(prompt);

  const planFile = path.join(BASE,"scripts",`${plan.id}.json`);
  fs.writeFileSync(planFile,JSON.stringify(plan,null,2));

  const clips=[];

  for(const scene of plan.scenes) {
    const sceneDir = path.join(BASE,"scenes",String(scene.number));
    fs.mkdirSync(sceneDir,{recursive:true});

    /*
      The existing project's visual/character/voice engines
      can supply real assets here.
      If an engine returns an asset, use it.
      Otherwise create a deterministic animated placeholder
      so the render pipeline never hangs.
    */

    const image = path.join(sceneDir,"scene.png");

    if(!fs.existsSync(image)) {
      await run("ffmpeg",[
        "-y",
        "-f","lavfi",
        "-i",`color=c=0x202020:s=1280x720:d=1`,
        "-frames:v","1",
        image
      ]);
    }

    const clip = path.join(BASE,"render",`scene-${scene.number}.mp4`);

    const audio = options.audioFiles?.[scene.number-1];

    await createClip(scene,image,audio,clip);
    clips.push(clip);
  }

  const final = path.join(
    OUTPUT,
    `jarvis-animation-${plan.id}.mp4`
  );

  await concat(clips,final);

  return {
    success:true,
    jobId:plan.id,
    videoFile:`/jarvis-animation/${path.basename(final)}`,
    localFile:final,
    scenes:plan.scenes.length,
    planFile
  };
}

module.exports = {generate};
