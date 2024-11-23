const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const path = require('path');

app.use(cors({credentials: true, origin:'http://localhost:3000'}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));

mongoose.connect('mongodb+srv://siraj:123@mern-blog.5efkv.mongodb.net/?retryWrites=true&w=majority&appName=mern-blog')

const postRouter = require('./routes/post')
const authRouter = require('./routes/auth')

app.use('/api/post', postRouter);
app.use('/api/auth', authRouter);

app.listen(4000, () => {
  console.log('Server is running on port 4000');
});