const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    students: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rollNo: String,
      },
    ],
    schedule: [
      {
        day: String,
        startTime: String,
        endTime: String,
        subject: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Class', classSchema);
