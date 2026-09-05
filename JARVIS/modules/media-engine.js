const fs=require('fs');
const path=require('path');
const {spawn}=require('child_process');

const ROOT=path.resolve(__dirname,'..');
const MEDIA=path.join(ROOT,'data','media');

function ensure(){
  for(const x of ['images','videos','audio','output'])
    fs.mkdirSync(path.join(MEDIA,x),{recursive:true});
}

function ffmpegAvailable(){
  try{
    const r=require('child_process').spawnSync('ffmpeg',['-version'],{stdio:'ignore'});
    return r.status===0;
  }catch(e){return false}
}

function ffmpeg(args){
  return new Promise((resolve,reject)=>{
    const p=spawn('ffmpeg',args,{stdio:['ignore','pipe','pipe']});
    let err='';
    p.stderr.on('data',d=>err+=d.toString());
    p.on('error',reject);
    p.on('close',code=>{
      if(code===0) resolve({success:true});
      else reject(new Error(err.slice(-4000)||`ffmpeg exited ${code}`));
    });
  });
}

async function editVideo(input,output,options={}){
  ensure();
  if(!ffmpegAvailable()) throw new Error('FFmpeg is not installed');
  const args=['-y','-i',input];

  if(options.scale) args.push('-vf',`scale=${options.scale}`);
  if(options.fps) args.push('-r',String(options.fps));
  if(options.start) args.push('-ss',String(options.start));
  if(options.duration) args.push('-t',String(options.duration));

  args.push('-c:v','libx264','-c:a','aac',output);
  await ffmpeg(args);
  return output;
}

async function extractAudio(input,output){
  if(!ffmpegAvailable()) throw new Error('FFmpeg is not installed');
  await ffmpeg(['-y','-i',input,'-vn','-c:a','aac',output]);
  return output;
}

async function convertMedia(input,output){
  if(!ffmpegAvailable()) throw new Error('FFmpeg is not installed');
  await ffmpeg(['-y','-i',input,output]);
  return output;
}

module.exports={
  ensure,
  ffmpegAvailable,
  editVideo,
  extractAudio,
  convertMedia
};
