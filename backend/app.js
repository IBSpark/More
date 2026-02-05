  const express = require('express');
  const mongoose = require('mongoose');
  const cors = require('cors');
  require('dotenv').config();

  const indexRouter = require('./api/index');
  const usersRouter = require('./api/users');

  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/', indexRouter);
  app.use('/users', usersRouter); //

  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`)});
  module.exports = app;
