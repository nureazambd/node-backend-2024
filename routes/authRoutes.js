const express = require('express');
const { register, login, verifyEmail, getProfile } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure Multer for profile picture uploads
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
router.get('/verify-email/:token', verifyEmail);

// Profile route (protected)
router.get('/profile', protect, getProfile); // Protected route to get profile

module.exports = router;
