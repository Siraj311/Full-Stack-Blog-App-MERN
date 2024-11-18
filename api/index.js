const express = require('express');
const bcrypt = require('bcryptjs');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({dest: 'uploads/'});
const fs = require('fs');

const salt = bcrypt.genSaltSync(10);
const secret = 'dja49832q17y5rqehneodhdjsaf0329u4';

app.use(cors({credentials: true, origin:'http://localhost:3000'}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));

mongoose.connect('mongodb+srv://siraj:123@mern-blog.5efkv.mongodb.net/?retryWrites=true&w=majority&appName=mern-blog')

app.post('/register', async (req, res) => {
  let {username, password} = req.body;

  username = username.trim().toLowerCase();

  try {
    const userDoc = await User.create({username, password: bcrypt.hashSync(password, salt)});
    res.json(userDoc);
  } catch(e) {
    res.status(400).json(e); 
  }
})

app.post('/login', async (req, res) => {
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
})

app.get('/profile', (req, res) => {
  const {token} = req.cookies;
  jwt.verify(token, secret, {}, (err, info) => {
    if(err) throw err;
    res.json(info);
  })
})

app.post('/logout', (req, res) => {
  res.cookie('token', '').json('ok');
})

app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
  const {originalname, path} = req.file;
  const parts = originalname.split('.');
  const ext = parts[parts.length -1];
  const newPath = path+'.'+ext;
  fs.renameSync(path, newPath);

  const {token} = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
    if(err) throw err;

    const {title, summary, content} = req.body;

    const postDoc = await Post.create({
      title, 
      summary, 
      content, 
      cover: newPath,
      author: info.id
    })

    res.json(postDoc);
  })

})

app.get('/post', async (req, res) => {
  res.json(
    await Post.find()
      .populate('author', ['username'])
      .sort({createdAt: -1})
      .limit(20)
  );
})

app.get('/post/:id', async (req, res) => {
  const {id} = req.params;
  const postDoc = await Post.findById(id).populate('author', ['username']);
  res.json(postDoc);
})

// app.put('/post', uploadMiddleware.single('file'), async (req, res) => {
//   let newPath = null;
//   if(req.file) {
//     const {originalname, path} = req.file;
//     const parts = originalname.split('.');
//     const ext = parts[parts.length -1];
//     newPath = path+'.'+ext;
//     fs.renameSync(path, newPath);
//   }

//   const {token} = req.cookies;
//   jwt.verify(token, secret, {}, async (err, info) => {
//     if(err) throw err;
//     const {id, title, summary, content} = req.body;
//     const postDoc = await Post.findById(id);
//     const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
//     if(!isAuthor) {
//       return res.status(400).json('you are not the author');
//     }

//     await postDoc.update({
//       title,
//       summary, 
//       content,
//       cover: newPath ? newPath : postDoc.cover
//     })

//     res.json(postDoc);
//   })
// })

app.put('/post', uploadMiddleware.single('file'), async (req, res) => {
  let newPath = null;
  if (req.file) {
    const { originalname, path } = req.file;
    const ext = originalname.split('.').pop();
    newPath = `${path}.${ext}`;
    try {
      fs.renameSync(path, newPath);
    } catch (err) {
      console.error('File rename failed:', err);
      return res.status(500).json({ error: 'File upload failed' });
    }
  }

  const { token } = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) {
      console.error('JWT verification failed:', err);
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id, title, summary, content } = req.body;
    try {
      const postDoc = await Post.findById(id);
      if (!postDoc.author.equals(info.id)) {
        return res.status(403).json({ error: 'You are not the author' });
      }

      postDoc.title = title;
      postDoc.summary = summary;
      postDoc.content = content;
      postDoc.cover = newPath || postDoc.cover;
      await postDoc.save();

      res.json(postDoc);
    } catch (error) {
      console.error('Error updating post:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

app.delete("/post/:id", async (req, res) => {
  const {id} = req.params;
  const {token} = req.cookies;   
  
  jwt.verify(token, secret, {}, async (err, info) => {
    if(err) {
      return res.status(401).json({ error: "Invalid token" });
    }
    const postDoc = await Post.findById(id);
    if (!postDoc) {
      return res.status(404).json({ error: "Post not found" });
    }
    const isAuthor = postDoc.author.toString() === info.id;
    if(!isAuthor) {
      return res.status(400).json('you are not the author');
    }

    try {
      const deletedPost = await Post.findByIdAndDelete(id);
      if (deletedPost) {
        res.json({ message: "Post deleted successfully", deletedPost });
      } else {
        res.status(404).json({ error: "Post not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  })

});

app.listen(4000);
