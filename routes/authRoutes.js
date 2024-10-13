const express = require('express');
const passport = require('passport');
const { register, login, verifyEmail, getProfile, updateProfile, deleteUser, googleCallback, githubCallback } = require('../controllers/authController');
const auth = require('../middlewares/auth');
// const router = express.Router();


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

// Email registration and verification
// router.post('/register', register);
// Routes
router.post('/register', upload.single('profilePicture'), register);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', login);

// Protected routes
router.get('/profile', auth, getProfile);
router.put('/profile', auth, upload.single('profilePicture'), updateProfile);
router.delete('/profile', auth, deleteUser);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), googleCallback);

// GitHub OAuth
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/' }), githubCallback);

module.exports = router;