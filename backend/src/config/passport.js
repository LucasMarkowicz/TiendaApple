const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require("../daos/models/user.Models")

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: 'http://localhost:8080/auth/github/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.username;
        const user = await User.findOne({ email });
        if (user) {
          return done(null, user);
        } else {
          const newUser = await User.create({ email, role: 'user' });
          return done(null, newUser);
        }
      } catch (err) {
        return done(err);
      }
    }
  )
);


module.exports = passport;
