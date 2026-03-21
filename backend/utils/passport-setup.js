const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback",
    proxy: true
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (user) {
        return done(null, user);
      }
      user = await User.findOne({ email: profile.emails[0].value });
      if (user) {
        user.googleId = profile.id;
        await user.save();
        return done(null, user);
      }
      const newUser = new User({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
      });
      await newUser.save();
      return done(null, newUser);
    } catch (error) {
      return done(error, null);
    }
  }
));
