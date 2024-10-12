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
        // Check if GitHub profile contains an email, otherwise provide a fallback
        const email = profile.emails && profile.emails.length > 0
          ? profile.emails[0].value
          : `user-${profile.id}@noemail.com`;  // Fallback email

        // Check if the user already exists in the database
        const existingUser = await User.findOne({ githubId: profile.id });
        if (existingUser) {
          return done(null, existingUser);
        }

        // If the user does not exist, create a new user
        const newUser = await User.create({
          githubId: profile.id,
          name: profile.displayName,
          email: email,  // Use real email or fallback
          isVerified: true,  // Automatically mark GitHub users as verified
        });

        return done(null, newUser);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize the user to the session
passport.serializeUser((user, done) => done(null, user.id));

// Deserialize the user by looking them up from the session
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});
