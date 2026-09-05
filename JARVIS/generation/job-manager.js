
const jobs = global.__ANIMATION_AI_JOBS || new Map();
global.__ANIMATION_AI_JOBS = jobs;

function createJob(type, input={}){
  const id="job_"+Date.now()+"_"+Math.random().toString(36).slice(2,8);

  const job={
    id,
    type,
    status:"queued",
    progress:0,
    stage:"Queued",
    message:"Waiting to start...",
    input,
    result:null,
    error:null,
    startedAt:null,
    updatedAt:Date.now(),
    completedAt:null
  };

  jobs.set(id,job);
  return job;
}

function updateJob(id, progress, stage, message){
  const j=jobs.get(id);
  if(!j)return null;

  j.progress=Math.max(0,Math.min(100,Number(progress)||0));
  j.stage=stage||j.stage;
  j.message=message||j.message;
  j.status=j.progress>=100 ? "completed" : "processing";
  j.updatedAt=Date.now();

  if(j.progress>=100){
    j.progress=100;
    j.stage="Completed";
    j.message="Your project is ready.";
    j.completedAt=Date.now();
  }

  return j;
}

function startJob(id){
  const j=jobs.get(id);
  if(!j)return null;

  j.status="processing";
  j.startedAt=Date.now();
  j.updatedAt=Date.now();
  return j;
}

function failJob(id,error){
  const j=jobs.get(id);
  if(!j)return null;

  j.status="failed";
  j.error=String(error||"Generation failed");
  j.message=j.error;
  j.updatedAt=Date.now();
  return j;
}

function getJob(id){
  return jobs.get(id)||null;
}

module.exports={
  jobs,
  createJob,
  updateJob,
  startJob,
  failJob,
  getJob
};
