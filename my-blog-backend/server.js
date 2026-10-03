require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Post = require('./models/Post');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors({
  origin: ['https://my-fullstack-blog.vercel.app/', 'http://localhost:5173'],
  credentials: true
}))
app.use(express.json());

// เชื่อมต่อ MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Atlas Connected 🚀'))
    .catch(err => console.error(err));

// --- Middleware ตรวจสอบ Admin ---
const authAdmin = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: "Access Denied" });
    try {
        const verified = jwt.verify(token, JWT_SECRET);
        if (verified.role !== 'admin') return res.status(403).json({ message: "Admin Only" });
        req.user = verified;
        next();
    } catch (err) { res.status(400).json({ message: "Invalid Token" }); }
};

// --- API Auth (Login จาก .env + Database) ---

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. เช็คกับค่าใน .env ก่อน (Super Admin)
        if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign({ role: 'admin', username }, JWT_SECRET, { expiresIn: '1d' });
            return res.json({ token, role: 'admin', username });
        }

        // 2. ถ้าไม่ตรง ให้เช็คใน Database (User ทั่วไป)
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid password" });

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, role: user.role, username: user.username });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword, role: 'user' });
        await newUser.save();
        res.status(201).json({ message: "Registered!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- API Blog CRUD ---

app.get('/api/posts', async (req, res) => {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
});

app.post('/api/posts', authAdmin, async (req, res) => {
    const newPost = new Post(req.body);
    await newPost.save();
    res.status(201).json(newPost);
});

app.delete('/api/posts/:id', authAdmin, async (req, res) => {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
});

app.listen(PORT, () => console.log(`Server on ${PORT}`));