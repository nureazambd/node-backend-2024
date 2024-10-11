const express = require('express');
const { register, login, logout } = require('../controllers/authController');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Routes
router.post('/register', upload.single('profilePicture'), register);
router.post('/login', login);
router.get('/logout', logout);

module.exports = router;
