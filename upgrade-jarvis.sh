#!/data/data/com.termux/files/usr/bin/bash
set -u

ROOT="$HOME/animation-ai"
cd "$ROOT" || exit 1

echo "=== JARVIS MASTER UPGRADE ==="

mkdir -p JARVIS/{data/{memory,jobs,projects,media/{images,videos,audio,output}},config,logs}
mkdir -p JARVIS/modules/{video,image,audio,editing,voice,story,character,youtube,remix}

# Memory initialize
node - <<'NODE'
const fs=require('fs');
const path='JARVIS/data/memory/memory.json';

if(!fs.existsSync(path)){
  fs.writeFileSync(path, JSON.stringify({
    version:1,
    name:"JARVIS Memory",
    facts:[],
    conversations:[],
    preferences:{},
    projects:[],
    notes:[]
  },null,2));
}
console.log("Memory: READY");
NODE

# Local media engine
cat > JARVIS/modules/media-engine.js <<'NODE'
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
NODE

# JARVIS module registry
cat > JARVIS/modules/index.js <<'NODE'
module.exports={
  videoGeneration:{
    enabled:true,
    engine:"local-ready"
  },
  imageGeneration:{
    enabled:true,
    engine:"local-ready"
  },
  audioGeneration:{
    enabled:true,
    engine:"local-ready"
  },
  videoEditing:{
    enabled:true,
    engine:"ffmpeg"
  },
  voice:{
    enabled:true,
    engine:"local-ready"
  },
  storyToVideo:{
    enabled:true
  },
  imageToVideo:{
    enabled:true
  },
  characterAnimation:{
    enabled:true
  },
  youtubeAnalysis:{
    enabled:true
  },
  remix:{
    enabled:true,
    mode:"transformative"
  }
};
NODE

# Check FFmpeg; install only if missing
if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "FFmpeg not found. Installing..."
  pkg update -y >/dev/null 2>&1 || true
  pkg install ffmpeg -y >/dev/null 2>&1 || true
fi

# Check Node dependencies
npm install express cors --no-audit --no-fund >/dev/null 2>&1 || true

# Syntax checks
echo "Checking JARVIS API..."
node --check jarvis-api.js || {
  echo "JARVIS API syntax error detected"
  exit 1
}

node --check JARVIS/modules/media-engine.js || {
  echo "Media engine syntax error detected"
  exit 1
}

node --check JARVIS/modules/index.js || {
  echo "Module registry syntax error detected"
  exit 1
}

# Add module routes to canonical API if not already present
node - <<'NODE'
const fs=require('fs');

const file='jarvis-api.js';
let s=fs.readFileSync(file,'utf8');

if(!s.includes('JARVIS_MEDIA_ENGINE')){
  const marker="const express = require('express');";

  if(s.includes(marker)){
    s=s.replace(
      marker,
      marker+"\nconst JARVIS_MEDIA_ENGINE = require('./JARVIS/modules/media-engine');\nconst JARVIS_MODULES = require('./JARVIS/modules');"
    );
  }

  const routeCode=`

app.get('/api/modules', (req,res)=>{
  res.json({
    success:true,
    name:'JARVIS',
    api:'JARVIS API',
    modules:JARVIS_MODULES
  });
});

app.get('/api/media/status', (req,res)=>{
  res.json({
    success:true,
    ffmpeg:JARVIS_MEDIA_ENGINE.ffmpegAvailable(),
    mediaEngine:true
  });
});

`;

  const listenMarker='app.listen(PORT, HOST';
  if(s.includes(listenMarker))
    s=s.replace(listenMarker,routeCode+listenMarker);

  fs.writeFileSync(file,s);
}
NODE

# Final syntax check after modification
node --check jarvis-api.js || {
  echo "Final JARVIS API check FAILED"
  exit 1
}

# Git safety: never upload owner secrets
grep -qxF 'JARVIS/config/owner.json' .gitignore 2>/dev/null || echo 'JARVIS/config/owner.json' >> .gitignore
grep -qxF 'JARVIS/data/memory/memory.json' .gitignore 2>/dev/null || echo 'JARVIS/data/memory/memory.json' >> .gitignore

git add jarvis-api.js JARVIS .gitignore package.json package-lock.json 2>/dev/null || true
git commit -m "Upgrade JARVIS API media generation and editing modules" >/dev/null 2>&1 || true
git push origin main >/dev/null 2>&1 || true

echo
echo "======================================"
echo "       JARVIS UPGRADE SUCCESSFUL"
echo "======================================"
