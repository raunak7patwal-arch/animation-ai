(function(){

  const input=document.getElementById("prompt");
  const button=document.getElementById("generateBtn");
  const video=document.getElementById("videoPlayer");

  if(!input || !button) return;

  async function generate(){

    const prompt=input.value.trim();

    if(!prompt){
      alert("पहले कहानी या वीडियो का prompt लिखो");
      return;
    }

    button.disabled=true;
    button.textContent="⏳ JARVIS Creating Animation...";

    try{

      const r=await fetch("/api/jarvis/animation/generate",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({prompt})
      });

      const data=await r.json();

      if(!data.success)
        throw new Error(data.error || "Generation failed");

      let done=false;

      while(!done){

        await new Promise(x=>setTimeout(x,1500));

        const q=await fetch(
          "/api/jarvis/animation/job/"+data.jobId
        );

        const job=(await q.json()).job;

        if(job.status==="failed")
          throw new Error(job.error || "Animation failed");

        if(job.status==="completed"){

          done=true;

          if(video){
            video.src=job.videoFile;
            video.controls=true;
            video.load();
          }

          button.textContent="✅ Animation Ready";
        }
      }

    }catch(e){

      console.error(e);
      alert("JARVIS Error: "+e.message);
      button.textContent="❌ Try Again";

    }finally{

      button.disabled=false;

    }
  }

  button.addEventListener("click",generate);

})();
