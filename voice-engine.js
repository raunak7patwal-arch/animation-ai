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
