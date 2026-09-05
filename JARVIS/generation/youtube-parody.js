
function extractYouTubeId(url){
  if(!url)return null;

  const patterns=[
    /[?&]v=([A-Za-z0-9_-]{6,})/,
    /youtu\.be\/([A-Za-z0-9_-]{6,})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/
  ];

  for(const p of patterns){
    const m=String(url).match(p);
    if(m)return m[1];
  }

  return null;
}

function createOriginalParodySpec(source={}){
  return {
    mode:"ORIGINAL_PARODY",
    sourceVideo:{
      id:source.videoId||null,
      title:source.title||"",
      description:source.description||"",
      channel:source.channelTitle||""
    },

    instructions:[
      "Understand the source video's main idea and comedic situation.",
      "Create a completely original parody story.",
      "Create new characters.",
      "Create new dialogue.",
      "Create new scenes.",
      "Create original music and sound effects.",
      "Do not reproduce the source footage.",
      "Do not reproduce dialogue word-for-word.",
      "Do not copy the original soundtrack.",
      "Use cinematic animated comedy and strong visual storytelling.",
      "Make the result feel like a polished original animated YouTube production."
    ]
  };
}

module.exports={
  extractYouTubeId,
  createOriginalParodySpec
};
