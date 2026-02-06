import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { useActionState } from "react";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Local routing for Vercel‑style API
app.use("/api/signup", (req, res) =>
  import("./api/signup.js").then((mod) => mod.default(req, res))
);
app.use("/api/login", (req, res) =>
  import("./api/login.js").then((mod) => mod.default(req, res))
);
app.use("/api/update", (req, res) =>
  import("./api/update.js").then((mod) => mod.default(req, res))
);
// app.get('/',(req,res)=>{
//     res.send({
//         useActionState:true, error:false,
        
//     })
// })

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Local server running at http://localhost:${PORT}`);
});
