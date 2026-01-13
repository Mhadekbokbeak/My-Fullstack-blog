const mongoose = require('mongoose');

// สร้าง Schema (โครงสร้างข้อมูล)
const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, default: 'Admin' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);