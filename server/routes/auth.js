import express from 'express';
import { 
  register, 
  login, 
  getCurrentUser, 
  changePassword,
  requestPasswordReset,
  resetPassword
} from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';
import passport from "passport";
const router = express.Router();

// Register a new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Get current user (requires authentication)
router.get('/me', auth, getCurrentUser);

// Change password (requires authentication)
router.post('/change-password', auth, changePassword);

// Request password reset
router.post('/request-reset', requestPasswordReset);

// Reset password with token
router.post('/reset-password', resetPassword);
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/auth-failed' }),
  (req, res) => {
    // Here you can generate a JWT and send it to the frontend
    // For demo: redirect with JWT as query param
    const token = req.user.token;
    res.redirect(`${process.env.CLIENT_URL}/auth/social-callback?token=${token}`);
  }
);

// Facebook OAuth
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/facebook/callback',
  passport.authenticate('facebook', { session: false, failureRedirect: '/auth-failed' }),
  (req, res) => {
    const token = req.user.token;
    res.redirect(`${process.env.CLIENT_URL}/auth/social-callback?token=${token}`);
  }
);

// LinkedIn OAuth
router.get('/linkedin', passport.authenticate('linkedin', { scope: ['r_emailaddress', 'r_liteprofile'] }));
router.get('/linkedin/callback',
  passport.authenticate('linkedin', { session: false, failureRedirect: '/auth-failed' }),
  (req, res) => {
    const token = req.user.token;
    res.redirect(`${process.env.CLIENT_URL}/auth/social-callback?token=${token}`);
  }
);
export default router;