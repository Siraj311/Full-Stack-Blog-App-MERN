const express = require('express');
const router = express.Router();

const {
  createUser,
  authenticateUser,
  authenticateProfile,
  logoutUser
} = require('../controllers/auth');

router.post('/register', createUser)
router.post('/login', authenticateUser)
router.get('/profile', authenticateProfile)
router.post('/logout', logoutUser)

module.exports = router