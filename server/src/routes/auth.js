const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/email');

const router = express.Router();

const createToken = (user) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: JWT_SECRET is not defined in production environment!');
    }
    console.warn('Warning: JWT_SECRET not set — using insecure default secret. Set JWT_SECRET in .env for production.');
  }
  return jwt.sign({ id: user._id, role: user.role, email: user.email }, secret || 'devsecret', { expiresIn: '5h' });
};

router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;

  try {
    if (!identifier || !password) {
      return res.status(400).json({ message: 'Identifier and password are required' });
    }

    const normalized = identifier.trim().toLowerCase();
    const user = await User.findOne({
      $or: [
        { email: normalized },
        { facultyId: identifier.trim() },
        { studentRoll: identifier.trim() },
      ],
    });

    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (user.restricted) return res.status(403).json({ message: 'Account is restricted' });

    const matched = await bcrypt.compare(password, user.password);
    if (!matched) return res.status(401).json({ message: 'Invalid credentials' });

    const token = createToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
        facultyId: user.facultyId,
        studentRoll: user.studentRoll,
        className: user.className,
        department: user.department,
        dob: user.dob,
        mobile: user.mobile,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Email not found' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetExpires = Date.now() + 1000 * 60 * 60;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
    await sendEmail({
      to: user.email,
      subject: 'ERP Password Reset',
      text: `Reset your password using this link: ${resetUrl}`,
    });

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to send reset email', error: error.message });
  }
});

router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  try {
    const user = await User.findOne({ resetToken: token, resetExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Token is invalid or expired' });

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Password reset failed', error: error.message });
  }
});

module.exports = router;
