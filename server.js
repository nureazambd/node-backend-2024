const express = require('express');
const dotenv = require('dotenv');
const passport = require('passport');
const session = require('express-session');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

// Ensure passport-github strategy is loaded
require('./config/passportGitHub');
require('./config/passportGoogle');

connectDB();

const app = express();
app.use(express.json());

app.use(
  session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
