const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'faculty', 'student'], default: 'student' },
    facultyId: { type: String },
    studentRoll: { type: String },
    className: { type: String },
    department: { type: String },
    dob: { type: Date },
    mobile: { type: String },
    restricted: { type: Boolean, default: false },
    resetToken: { type: String },
    resetExpires: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
