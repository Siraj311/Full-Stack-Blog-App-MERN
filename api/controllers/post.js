const jwt = require('jsonwebtoken');
const Post = require('../models/Post');
const fs = require('fs');

const secret = 'dja49832q17y5rqehneodhdjsaf0329u4';

const createPost = async (req, res) => {
  const {originalname, path} = req.file;
  const parts = originalname.split('.');
  const ext = parts[parts.length -1];
  const newPath = path+'.'+ext;
  console.log(newPath);
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

}

const getPost = async (req, res) => {
  res.json(
    await Post.find()
      .populate('author', ['username'])
      .sort({createdAt: -1})
      .limit(20)
  );
};

const getOnePost = async (req, res) => {
  const {id} = req.params;
  const postDoc = await Post.findById(id).populate('author', ['username']);
  res.json(postDoc);
};

const updatePost = async (req, res) => {
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
};

const deletePost = async (req, res) => {
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
};

module.exports = {
  createPost,
  getPost,
  getOnePost,
  updatePost,
  deletePost
}