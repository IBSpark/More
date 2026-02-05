const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");
require("dotenv").config();

const usersHandler = require("./users").default;

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ message: "API running on Vercel" });
});

// Users API
app.all("/users/*", (req, res) => usersHandler(req, res));

module.exports.handler = serverless(app);
