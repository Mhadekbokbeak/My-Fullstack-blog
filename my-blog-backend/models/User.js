const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true, // กัน "A@x.com" กับ "a@x.com" กลายเป็นคนละบัญชี
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format']
    },
    password: { type: String, required: true },
    role: { type: String, default: 'user' } // แยกสิทธิ์: 'admin' หรือ 'user'
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
