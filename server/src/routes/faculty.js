const express = require('express');
const Attendance = require('../models/Attendance');
const Result = require('../models/Result');
const Assignment = require('../models/Assignment');
const Class = require('../models/Class');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate, authorize('faculty'));

router.get('/profile', async (req, res) => {
  res.json(req.user);
});

router.get('/classes', async (req, res) => {
  try {
    const classes = await Class.find({ faculty: req.user.id }).populate('students.student', 'name email studentRoll');
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load classes', error: error.message });
  }
});

router.post('/attendance', async (req, res) => {
  try {
    const attendance = await Attendance.create({ ...req.body, markedBy: req.user.id });
    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Unable to mark attendance' });
  }
});

router.post('/assignments', async (req, res) => {
  try {
    const assignment = await Assignment.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Unable to create assignment' });
  }
});

router.get('/assignments', async (req, res) => {
  try {
    const assignments = await Assignment.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load assignments' });
  }
});

router.post('/results', async (req, res) => {
  try {
    const result = await Result.create({ ...req.body, faculty: req.user.id });
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Unable to post result' });
  }
});

router.get('/schedule', async (req, res) => {
  try {
    const classes = await Class.find({ faculty: req.user.id });

    // compute next occurrence for each schedule item
    const today = new Date();
    const dayMap = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };

    const entries = [];
    classes.forEach((c) => {
      (c.schedule || []).forEach((s) => {
        const dow = String(s.day || '').toLowerCase();
        if (!(dow in dayMap)) return;
        const targetDow = dayMap[dow];
        const [sh, sm] = (s.startTime || '00:00').split(':').map((x) => parseInt(x, 10) || 0);
        const next = (() => {
          const d = new Date(today);
          const delta = (targetDow - d.getDay() + 7) % 7;
          d.setDate(d.getDate() + delta);
          d.setHours(sh, sm, 0, 0);
          if (d < today) d.setDate(d.getDate() + 7);
          return d;
        })();
        entries.push({ classId: c._id, className: c.name, code: c.code, day: s.day, startTime: s.startTime, endTime: s.endTime, subject: s.subject, nextOccurrence: next });
      });
    });

    entries.sort((a, b) => new Date(a.nextOccurrence) - new Date(b.nextOccurrence));
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load schedule' });
  }
});

module.exports = router;
