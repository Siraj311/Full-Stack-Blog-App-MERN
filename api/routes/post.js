const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path')
const uploadMiddleware = multer({dest: 'uploads/'});

const {
  createPost,
  getPost,
  getOnePost,
  updatePost,
  deletePost
} = require('../controllers/post');

router.get('/', getPost);
router.post('/', uploadMiddleware.single('file'), createPost);
router.get('/:id', getOnePost);
router.put('/', uploadMiddleware.single('file'), updatePost);
router.delete("/:id", deletePost);

module.exports = router