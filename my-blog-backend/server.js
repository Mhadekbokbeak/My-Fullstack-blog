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

// --- แก้ไข CORS Origin (เอา / ด้านหลังออก) ---
const allowedOrigins = [
  'https://my-fullstack-blog.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // อนุญาตหากไม่มี origin (เช่น Postman/Mobile apps) หรืออยู่ในรายการ allowedOrigins
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // หรือส่ง new Error('Not allowed by CORS') หากต้องการบล็อกจริงจัง
    }
  },
  credentials: true
}));

app.use(express.json());

// เชื่อมต่อ MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Atlas Connected 🚀'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// --- Middleware ตรวจสอบ Admin ---
const authAdmin = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: "Access Denied" });

    try {
        // รองรับทั้งแบบส่งมาเป็น "Bearer <token>" และส่งเฉพาะ token
        const actualToken = token.startsWith('Bearer ') ? token.slice(7) : token;
        const verified = jwt.verify(actualToken, JWT_SECRET);

        if (verified.role !== 'admin') return res.status(403).json({ message: "Admin Only" });
        req.user = verified;
        next();
    } catch (err) { 
        res.status(400).json({ message: "Invalid Token" }); 
    }
};

// --- API Auth ---

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. เช็คกับ Super Admin ใน .env
        if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign({ role: 'admin', username }, JWT_SECRET, { expiresIn: '1d' });
            return res.json({ token, role: 'admin', username });
        }

        // 2. เช็คกับ Database
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid password" });

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, role: user.role, username: user.username });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // เช็คก่อนว่ามี User นี้ในระบบแล้วหรือยัง
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: "Username already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword, role: 'user' });
        await newUser.save();
        res.status(201).json({ message: "Registered!" });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// --- API Blog CRUD ---

app.get('/api/posts', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/posts', authAdmin, async (req, res) => {
    try {
        const newPost = new Post(req.body);
        await newPost.save();
        res.status(201).json(newPost);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/posts/:id', authAdmin, async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));