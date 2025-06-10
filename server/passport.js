import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as LinkedInStrategy } from "passport-linkedin-oauth2";
import User from "./models/User.js";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();
function generateToken(user) {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = await User.findOne({ email: profile.emails[0].value });
      if (user) {
        user.googleId = profile.id;
        user.provider = "google";
        user.verified = true;
        await user.save();
      } else {
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          username: profile.emails[0].value.split("@")[0],
          googleId: profile.id,
          provider: "google",
          profileImage: profile.photos?.[0]?.value,
          verified: true
        });
      }
    }
    const token = generateToken(user);
    user.token = token;
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

passport.use(new FacebookStrategy({
  clientID: process.env.FB_CLIENT_ID,
  clientSecret: process.env.FB_CLIENT_SECRET,
  callbackURL: "/api/auth/facebook/callback",
  profileFields: ["id", "displayName", "photos", "email"]
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ facebookId: profile.id });
    if (!user) {
      user = await User.findOne({ email: profile.emails[0].value });
      if (user) {
        user.facebookId = profile.id;
        user.provider = "facebook";
        user.verified = true;
        await user.save();
      } else {
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          username: profile.emails[0].value.split("@")[0],
          facebookId: profile.id,
          provider: "facebook",
          profileImage: profile.photos?.[0]?.value,
          verified: true
        });
      }
    }
    const token = generateToken(user);
    user.token = token;
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

passport.use(new LinkedInStrategy({
  clientID: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  callbackURL: "/api/auth/linkedin/callback",
  scope: ["r_emailaddress", "r_liteprofile"]
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ linkedinId: profile.id });
    if (!user) {
      user = await User.findOne({ email: profile.emails[0].value });
      if (user) {
        user.linkedinId = profile.id;
        user.provider = "linkedin";
        user.verified = true;
        await user.save();
      } else {
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          username: profile.emails[0].value.split("@")[0],
          linkedinId: profile.id,
          provider: "linkedin",
          profileImage: profile.photos?.[0]?.value,
          verified: true
        });
      }
    }
    const token = generateToken(user);
    user.token = token;
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

export default passport;