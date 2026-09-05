const express = require("express");
const path = require("path");

const app = require("./JARVIS/api/server");

const PORT =
  Number(process.env.JARVIS_PORT || 3000);

app.use(
  "/jarvis-animation",
  express.static(
    path.join(
      process.cwd(),
      "JARVIS/animation/output"
    )
  )
);

app.get("/",(req,res)=>{
  res.json({
    success:true,
    service:"JARVIS",
    api:"online"
  });
});

app.listen(PORT,"0.0.0.0",()=>{
  console.log("");
  console.log("==============================================");
  console.log("          JARVIS UNIFIED API ONLINE");
  console.log("==============================================");
  console.log("PORT:",PORT);
  console.log("LOCAL:",true);
  console.log("FREE:",true);
  console.log("==============================================");
});
