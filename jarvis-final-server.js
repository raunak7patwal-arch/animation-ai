const express=require("express");
const app=express();
const api=require("./JARVIS/api/server");
app.use(api);
app.use("/jarvis-output",express.static("JARVIS/output"));
app.get("/",(q,r)=>r.json({name:"JARVIS",status:"online"}));
const port=process.env.JARVIS_PORT||3000;
app.listen(port,"0.0.0.0",()=>console.log(`JARVIS ONLINE : ${port}`));
