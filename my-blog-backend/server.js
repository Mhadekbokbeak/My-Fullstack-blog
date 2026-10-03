require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// CORS Config
const allowedOrigins = [
  'https://my-fullstack-blog.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));

app.use(express.json());

// Routes Setup
app.use('/api', authRoutes);
app.use('/api/posts', postRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;