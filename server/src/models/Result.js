const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    examType: { type: String, required: true },
    score: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    remarks: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Result', resultSchema);
