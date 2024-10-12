const express = require('express');
const passport = require('passport');
const { register, login, verifyEmail, googleCallback, githubCallback } = require('../controllers/authController');

const router = express.Router();

// Email registration and verification
router.post('/register', register);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', login);

// Google OAuth
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), googleCallback);

// GitHub OAuth
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/' }), githubCallback);

module.exports = router;
