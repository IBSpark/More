const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const serverless = require('serverless-http'); // NEW
require('dotenv').config();

const indexRouter = require('./api/index');
const usersRouter = require('./api/users');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/', indexRouter);
app.use('/',)
app.use('/users', usersRouter);

// MongoDB connection with simple caching
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI).then((mongoose) => {
      console.log('MongoDB Connected');
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Connect to MongoDB immediately
connectDB().catch(err => console.error('MongoDB connection error:', err));

// EXPORT serverless handler for Vercel
module.exports.handler = serverless(app);
