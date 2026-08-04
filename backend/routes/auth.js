const router  = require('express').Router();
const jwt     = require('jsonwebtoken');
const crypto  = require('crypto');
const rateLimit = require('express-rate-limit');

const User     = require('../models/User');
const { protect } = require('../middleware/auth');
const {
  signupRules, loginRules,
  forgotPasswordRules, resetPasswordRules,
  updateProfileRules, changePasswordRules
} = require('../middleware/validate');
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail
} = require('../config/email');

/* ─── Helpers ───────────────────────────────────── */
function signAccessToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

function signRefreshToken() {
  return crypto.randomBytes(40).toString('hex');
}

function setRefreshCookie(res, token) {
  res.cookie('refreshToken', token, {
    httpOnly: true,           // JS cannot read this cookie
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   30 * 24 * 60 * 60 * 1000  // 30 days
  });
}

/* ─── Rate limiters ─────────────────────────────── */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                    // max 10 attempts per window
  message: { success: false, message: 'Too many attempts. Please wait 15 minutes.' }
});

const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 3,
  message: { success: false, message: 'Too many email requests. Please wait 1 hour.' }
});

/* ════════════════════════════════════════════════
   POST /api/auth/signup
   Body: { name, email, password, phone? }
════════════════════════════════════════════════ */
router.post('/signup', authLimiter, signupRules, async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // 1. Check duplicate email
    const existing = User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with that email already exists.' });
    }

    // 2. Create user
    const user = await User.create({ name, email, password, phone });

    // 3. Send verification email
    const verifyToken = User.createEmailToken(user.id, 'verify');
    try {
      await sendVerificationEmail(user, verifyToken);
    } catch (emailErr) {
      console.error('Verification email failed:', emailErr.message);
      // Don't block signup if email fails
    }

    // 4. Generate tokens
    const accessToken  = signAccessToken(user.id);
    const refreshToken = signRefreshToken();
    User.saveRefreshToken(user.id, refreshToken);
    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      success: true,
      message: 'Account created! Please check your email to verify your account.',
      user: {
        id:          user.id,
        name:        user.name,
        email:       user.email,
        phone:       user.phone,
        role:        user.role,
        is_verified: user.is_verified,
      },
      accessToken
    });

  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ success: false, message: 'Signup failed. Please try again.' });
  }
});

/* ════════════════════════════════════════════════
   POST /api/auth/login
   Body: { email, password }
════════════════════════════════════════════════ */
router.post('/login', authLimiter, loginRules, async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user
    const user = User.findByEmail(email);
    if (!user) {
      // Generic message — don't reveal if email exists
      return res.status(401).json({ success: false, message: 'Incorrect email or password.' });
    }

    // 2. Check password
    const match = await User.checkPassword(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Incorrect email or password.' });
    }

    // 3. Generate tokens
    const accessToken  = signAccessToken(user.id);
    const refreshToken = signRefreshToken();
    User.saveRefreshToken(user.id, refreshToken);
    setRefreshCookie(res, refreshToken);

    res.json({
      success: true,
      message: 'Logged in successfully.',
      user: {
        id:          user.id,
        name:        user.name,
        email:       user.email,
        phone:       user.phone,
        role:        user.role,
        is_verified: user.is_verified,
      },
      accessToken
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
});

/* ════════════════════════════════════════════════
   GET /api/auth/me
   Header: Authorization: Bearer <accessToken>
   Returns current user data
════════════════════════════════════════════════ */
router.get('/me', protect, (req, res) => {
  res.json({ success: true, user: req.user });
});

/* ════════════════════════════════════════════════
   POST /api/auth/refresh
   Cookie: refreshToken
   Returns new accessToken
════════════════════════════════════════════════ */
router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: 'No refresh token.' });
    }

    const stored = User.findRefreshToken(token);
    if (!stored) {
      return res.status(401).json({ success: false, message: 'Invalid or expired session. Please log in again.' });
    }

    // Rotate: revoke old, issue new
    User.revokeRefreshToken(token);
    const newRefresh = signRefreshToken();
    User.saveRefreshToken(stored.user_id, newRefresh);
    setRefreshCookie(res, newRefresh);

    const accessToken = signAccessToken(stored.user_id);
    res.json({ success: true, accessToken });

  } catch (err) {
    console.error('Refresh error:', err);
    res.status(500).json({ success: false, message: 'Could not refresh session.' });
  }
});

/* ════════════════════════════════════════════════
   POST /api/auth/logout
   Revokes refresh token + clears cookie
════════════════════════════════════════════════ */
router.post('/logout', (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) User.revokeRefreshToken(token);
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out.' });
});

/* ════════════════════════════════════════════════
   GET /api/auth/verify-email?token=xxx
   Verifies the user's email address
════════════════════════════════════════════════ */
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Verification token is required.' });
    }

    const record = User.findEmailToken(token, 'verify');
    if (!record) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification link.' });
    }

    User.markVerified(record.user_id);
    User.consumeEmailToken(token);

    // Send welcome email
    const user = User.findById(record.user_id);
    try { await sendWelcomeEmail(user); } catch {}

    res.json({ success: true, message: 'Email verified! Your account is now active.' });

  } catch (err) {
    console.error('Verify email error:', err);
    res.status(500).json({ success: false, message: 'Verification failed.' });
  }
});

/* ════════════════════════════════════════════════
   POST /api/auth/resend-verification
   Header: Authorization: Bearer <accessToken>
════════════════════════════════════════════════ */
router.post('/resend-verification', emailLimiter, protect, async (req, res) => {
  try {
    if (req.user.is_verified) {
      return res.status(400).json({ success: false, message: 'Email is already verified.' });
    }

    const token = User.createEmailToken(req.user.id, 'verify');
    await sendVerificationEmail(req.user, token);

    res.json({ success: true, message: 'Verification email sent.' });

  } catch (err) {
    console.error('Resend verification error:', err);
    res.status(500).json({ success: false, message: 'Could not send email.' });
  }
});

/* ════════════════════════════════════════════════
   POST /api/auth/forgot-password
   Body: { email }
════════════════════════════════════════════════ */
router.post('/forgot-password', emailLimiter, forgotPasswordRules, async (req, res) => {
  try {
    const user = User.findByEmail(req.body.email);

    // Always respond the same — don't reveal if email exists
    if (user) {
      const token = User.createEmailToken(user.id, 'reset');
      try { await sendPasswordResetEmail(user, token); } catch {}
    }

    res.json({
      success: true,
      message: 'If that email is registered, a password reset link has been sent.'
    });

  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, message: 'Request failed.' });
  }
});

/* ════════════════════════════════════════════════
   POST /api/auth/reset-password
   Body: { token, password }
════════════════════════════════════════════════ */
router.post('/reset-password', resetPasswordRules, async (req, res) => {
  try {
    const { token, password } = req.body;

    const record = User.findEmailToken(token, 'reset');
    if (!record) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset link.' });
    }

    await User.updatePassword(record.user_id, password);
    User.consumeEmailToken(token);
    User.revokeAllRefreshTokens(record.user_id); // force re-login everywhere

    res.json({ success: true, message: 'Password reset successfully. Please log in.' });

  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, message: 'Reset failed.' });
  }
});

/* ════════════════════════════════════════════════
   PATCH /api/auth/profile
   Header: Authorization: Bearer <accessToken>
   Body: { name?, phone? }
════════════════════════════════════════════════ */
router.patch('/profile', protect, updateProfileRules, (req, res) => {
  try {
    const { name, phone } = req.body;
    const updated = User.updateProfile(req.user.id, {
      name:  name  || req.user.name,
      phone: phone !== undefined ? phone : req.user.phone
    });
    res.json({ success: true, message: 'Profile updated.', user: updated });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ success: false, message: 'Update failed.' });
  }
});

/* ════════════════════════════════════════════════
   POST /api/auth/change-password
   Header: Authorization: Bearer <accessToken>
   Body: { currentPassword, newPassword }
════════════════════════════════════════════════ */
router.post('/change-password', protect, changePasswordRules, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Must re-fetch to get password_hash
    const userWithHash = User.findByEmail(req.user.email);
    const match = await User.checkPassword(currentPassword, userWithHash.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    await User.updatePassword(req.user.id, newPassword);
    User.revokeAllRefreshTokens(req.user.id);
    res.clearCookie('refreshToken');

    res.json({ success: true, message: 'Password changed. Please log in again.' });

  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ success: false, message: 'Could not change password.' });
  }
});

module.exports = router;
