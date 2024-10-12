const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;
const User = require('../models/User');

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: '/api/auth/github/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if GitHub profile contains emails, and handle missing emails
        const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : `user-${profile.id}@noemail.com`; // Fallback to default email if none provided
        // const name = profile.displayName ? profile.displayName : '';
        console.log("github user info:", profile)
        // Check if the user already exists in the database
        const existingUser = await User.findOne({ githubId: profile.id });
        if (existingUser) {
          return done(null, existingUser);
        }

        // If the user does not exist, create a new user
        const newUser = await User.create({
          githubId: profile.id,
          name: profile.username,
          email: email,  // Use the email from GitHub or fallback email
          isVerified: true,  // Automatically verify GitHub users
        });

        return done(null, newUser);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize user into the session
passport.serializeUser((user, done) => done(null, user.id));

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
