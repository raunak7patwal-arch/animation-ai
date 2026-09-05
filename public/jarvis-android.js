window.JARVIS = {

  async health(){
    const r =
      await fetch("/api/jarvis/health");

    return r.json();
  },

  async generateVideo(prompt,options={}){
    const r =
      await fetch("/api/jarvis/video",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          prompt,
          options
        })
      });

    return r.json();
  },

  async generateImage(prompt,options={}){
    const r =
      await fetch("/api/jarvis/image",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          prompt,
          options
        })
      });

    return r.json();
  },

  async generateVoice(text,options={}){
    const r =
      await fetch("/api/jarvis/voice",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          text,
          options
        })
      });

    return r.json();
  }
};
