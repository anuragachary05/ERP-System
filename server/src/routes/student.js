const express = require('express');
const Attendance = require('../models/Attendance');
const Result = require('../models/Result');
const Assignment = require('../models/Assignment');
const Notice = require('../models/Notice');
const Class = require('../models/Class');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate, authorize('student'));

router.get('/profile', async (req, res) => {
  res.json(req.user);
});

router.get('/attendance', async (req, res) => {
  try {
    const records = await Attendance.find({ student: req.user.id });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load attendance' });
  }
});

router.get('/results', async (req, res) => {
  try {
    const results = await Result.find({ student: req.user.id })
      .populate('class', 'name code')
      .populate('faculty', 'name');
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load results' });
  }
});

router.get('/schedule', async (req, res) => {
  try {
    const classes = await Class.find({ 'students.student': req.user.id }).populate('faculty', 'name facultyId email');

    // Flatten schedule entries and compute next occurrence date for each schedule item
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

        // compute next date for targetDow (including today if same day and time in future)
        const [sh, sm] = (s.startTime || '00:00').split(':').map((x) => parseInt(x, 10) || 0);
        const instances = (() => {
          const d = new Date(today);
          const delta = (targetDow - d.getDay() + 7) % 7;
          d.setDate(d.getDate() + delta);
          d.setHours(sh, sm, 0, 0);
          // if computed time already passed today, schedule next week
          if (d < today) d.setDate(d.getDate() + 7);
          return d;
        })();

        entries.push({
          classId: c._id,
          className: c.name,
          code: c.code,
          faculty: c.faculty,
          day: s.day,
          startTime: s.startTime,
          endTime: s.endTime,
          subject: s.subject,
          nextOccurrence: instances,
        });
      });
    });

    // sort by nextOccurrence
    entries.sort((a, b) => new Date(a.nextOccurrence) - new Date(b.nextOccurrence));

    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load schedule' });
  }
});

router.get('/assignments', async (req, res) => {
  try {
    // For now return assignments for all classes; can be filtered per student later
    const assignments = await Assignment.find().sort({ createdAt: -1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load assignments' });
  }
});

router.get('/notices', async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load notices' });
  }
});

module.exports = router;
