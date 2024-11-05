const express = require('express');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const salt = bcrypt.genSaltSync(10);
const secret = 'dja49832q17y5rqehneodhdjsaf0329u4';

app.use(cors({credentials: true, origin:'http://localhost:3000'}));
app.use(express.json());

mongoose.connect('mongodb+srv://siraj:123@mern-blog.5efkv.mongodb.net/?retryWrites=true&w=majority&appName=mern-blog')

app.post('/register', async (req, res) => {
  const {username, password} = req.body;
  try {
    const userDoc = await User.create({username, password: bcrypt.hashSync(password, salt)});
    res.json(userDoc);
  } catch(e) {
    res.status(400).json(e); 
  }
})

app.post('/login', async (req, res) => {
  try {
    const {username, password} = req.body;
    const userDoc = await User.findOne({username});
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if(passOk) {
      // logged in
      jwt.sign({username, id:userDoc._id}, secret, {}, (err, token) => {
        if(err) throw err;
        res.cookie('token', token).json('ok');
      })
    } else {
      res.status(400).json('wrong credentials');
    }


  }catch(e) {
    res.status(400).json(e);
  }
})

app.listen(4000);
