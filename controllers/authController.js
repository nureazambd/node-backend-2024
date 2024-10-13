const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email, address, password } = req.body;

     // Handle the profile picture upload
     const profilePicture = req.file ? req.file.filename : null;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ 
      name,
      email,
      address,
      profilePicture, // Store profile picture path or filename
      password,
     });

    // Generate verification token
    const verificationToken = generateToken(user._id);

    // Create verification URL
    const verificationUrl = `http://localhost:5000/api/auth/verify-email/${verificationToken}`;

    const message = `
      <h1>Email Verification</h1>
      <p>Click the link below to verify your email:</p>
      <a href="${verificationUrl}">Verify Email</a>
    `;

    // Send email
    await sendEmail({ email: user.email, subject: 'Email Verification', message });

    res.status(201).json({ message: 'User registered. Verification email sent.' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// Verify email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return res.status(400).json({ message: 'User not found' });

    user.isVerified = true;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !await user.matchPassword(password)) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: 'Please verify your email to log in' });
    }

    const token = generateToken(user._id);
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// Get profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ name: user.name, email: user.email, address: user.address, profilePicture: user.profilePicture });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    user.address = req.body.address || user.address;
    if (req.file) user.profilePicture = `/uploads/${req.file.filename}`;

    await user.save();
    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Google OAuth callback
exports.googleCallback = (req, res) => {
  res.redirect('/profile'); // Redirect after successful Google login
};

// GitHub OAuth callback
exports.githubCallback = (req, res) => {
  res.redirect('/'); // Redirect after successful GitHub login
};
