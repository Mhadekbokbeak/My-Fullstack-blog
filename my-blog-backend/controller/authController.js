const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

// ข้อความเดียวกันทั้ง "ไม่มี user" และ "รหัสผิด" เพื่อไม่ให้เดาได้ว่าอีเมลไหนมีบัญชี
const INVALID_CREDENTIALS = "Invalid email or password";

const normalizeEmail = (email) => (typeof email === 'string' ? email.trim().toLowerCase() : '');

exports.login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    if (!email || typeof password !== 'string' || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // 1. Super Admin ใน .env
    if (process.env.ADMIN_EMAIL && email === normalizeEmail(process.env.ADMIN_EMAIL) && password === process.env.ADMIN_PASSWORD) {
      const username = process.env.ADMIN_USERNAME || 'admin';
      const token = jwt.sign({ role: 'admin', username }, process.env.JWT_SECRET, { expiresIn: '1d' });
      return res.json({ token, role: 'admin', username });
    }

    // 2. User ใน Database
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: INVALID_CREDENTIALS });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: INVALID_CREDENTIALS });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, role: user.role, username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.register = async (req, res) => {
  try {
    const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    if (!username || !email || typeof password !== 'string' || !password) {
      return res.status(400).json({ message: "Username, email and password are required" });
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      const field = existingUser.email === email ? 'Email' : 'Username';
      return res.status(400).json({ message: `${field} already exists` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword, role: 'user' });
    await newUser.save();

    res.status(201).json({ message: "Registered!" });
  } catch (err) {
    // กันกรณีสมัครพร้อมกันสองคำขอ แล้วผ่าน findOne ทั้งคู่ — unique index จะจับได้ตรงนี้
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email or username already exists" });
    }
    res.status(500).json({ error: err.message });
  }
};
