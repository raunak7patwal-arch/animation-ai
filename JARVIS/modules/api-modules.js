const fs=require("fs");
const path=require("path");

const ROOT=path.resolve(__dirname,"..");
const JOBS=path.join(ROOT,"data","jobs");

function job(type,payload={}){
  const id=`job_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
  const data={
    id,
    type,
    status:"queued",
    createdAt:new Date().toISOString(),
    payload
  };
  fs.mkdirSync(JOBS,{recursive:true});
  fs.writeFileSync(path.join(JOBS,id+".json"),JSON.stringify(data,null,2));
  return data;
}

module.exports={
  textToVideo:p=>job("text_to_video",p),
  imageToVideo:p=>job("image_to_video",p),
  storyToVideo:p=>job("story_to_video",p),
  character:p=>job("character_animation",p),
  image:p=>job("image_generation",p),
  audio:p=>job("audio_generation",p),
  voice:p=>job("voice_generation",p),
  edit:p=>job("video_editing",p),
  youtube:p=>job("youtube_analysis",p),
  remix:p=>job("transformative_remix",p)
};
