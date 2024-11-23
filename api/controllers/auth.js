const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const salt = bcrypt.genSaltSync(10);
const secret = 'dja49832q17y5rqehneodhdjsaf0329u4';

const createUser = async (req, res) => {
  let {username, password} = req.body;

  username = username.trim().toLowerCase();

  try {
    const userDoc = await User.create({username, password: bcrypt.hashSync(password, salt)});
    res.json(userDoc);
  } catch(e) {
    res.status(400).json(e); 
  }
}

const authenticateUser = async (req, res) => {
  try {
    let {username, password} = req.body;
    username = username.trim().toLowerCase();
    const userDoc = await User.findOne({username});
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if(passOk) {
      // logged in
      jwt.sign({username, id:userDoc._id}, secret, {}, (err, token) => {
        if(err) throw err;
        res.cookie('token', token).json({
          id: userDoc._id,
          username
        });
      })
    } else {
      res.status(400).json('wrong credentials');
    }
  }catch(e) {
    res.status(400).json(e);
  }
};

const authenticateProfile = (req, res) => {
  const {token} = req.cookies;
  jwt.verify(token, secret, {}, (err, info) => {
    if(err) throw err;
    res.json(info);
  })
}

const logoutUser = (req, res) => {
  res.cookie('token', '').json('ok');
};

module.exports = {
  createUser,
  authenticateUser,
  authenticateProfile,
  logoutUser
}