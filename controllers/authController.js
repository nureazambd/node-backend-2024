const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

// Helper function to generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// @desc    Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email, address, password } = req.body;
    
    // Handle the profile picture upload
    const profilePicture = req.file ? req.file.filename : null;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a new user with profilePicture
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

    // Send verification email
    await sendEmail({ email: user.email, subject: 'Email Verification', message });

    res.status(201).json({
      message: 'User registered. A verification email has been sent to your email address.',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};


// Verify user email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    user.isVerified = true;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// Login a user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: 'Please verify your email to log in' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private (requires authentication)
exports.getProfile = async (req, res) => {
  try {
    const user = req.user;

    // Return the user's profile information
    res.status(200).json({
      name: user.name,
      email: user.email,
      address: user.address,
      profilePicture: user.profilePicture ? `http://localhost:5000/uploads/${user.profilePicture}` : null,
      isVerified: user.isVerified,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};
