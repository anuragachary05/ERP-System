const express = require('express');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const Class = require('../models/Class');
const Notice = require('../models/Notice');
const { authenticate, authorize } = require('../middleware/auth');
const { validateBody } = require('../utils/validation');

const router = express.Router();
router.use(authenticate, authorize('admin'));

router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password -resetToken -resetExpires');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Unable to get users' });
  }
});

router.post('/users', async (req, res) => {
  try {
    const userSchema = {
      name: { required: true, type: 'string', minLength: 2 },
      email: { required: true, type: 'string', pattern: /^\S+@\S+\.\S+$/ },
      password: { required: true, type: 'string', minLength: 6 },
      role: { required: true, type: 'string', enum: ['admin', 'faculty', 'student'] },
    };

    const error = validateBody(req.body, userSchema);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const { name, email, password, role, facultyId, studentRoll, className, department, dob, mobile } = req.body;

    if (role === 'student' && !studentRoll) {
      return res.status(400).json({ message: 'Student roll number is required' });
    }
    if (role === 'faculty' && !facultyId) {
      return res.status(400).json({ message: 'Faculty ID is required' });
    }

    let cls = null;
    if (role === 'student' && className) {
      cls = await Class.findOne({
        $or: [
          { name: { $regex: new RegExp('^' + className.trim() + '$', 'i') } },
          { code: { $regex: new RegExp('^' + className.trim() + '$', 'i') } },
        ]
      });
      if (!cls) {
        return res.status(404).json({ message: `Class '${className}' not found. Please create the class first.` });
      }
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
      facultyId,
      studentRoll,
      className,
      department,
      dob,
      mobile,
    });

    if (cls) {
      cls.students.push({ student: user._id, rollNo: user.studentRoll });
      await cls.save();
    }

    const safeUser = await User.findById(user._id).select('-password -resetToken -resetExpires');
    res.status(201).json(safeUser);
  } catch (error) {
    res.status(500).json({ message: 'Unable to create user', error: error.message });
  }
});

router.put('/users/:id/restrict', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { restricted: true }, { new: true });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Unable to restrict user' });
  }
});

router.get('/classes', async (req, res) => {
  try {
    const classes = await Class.find().populate('faculty', 'name email facultyId');
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load classes' });
  }
});

router.post('/classes', async (req, res) => {
  try {
    const classSchema = {
      name: { required: true, type: 'string', minLength: 2 },
      code: { required: true, type: 'string', minLength: 2 },
    };

    const error = validateBody(req.body, classSchema);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const { name, code, faculty } = req.body;

    let facultyUser = null;
    if (faculty) {
      // Try by ObjectId first, then by facultyId or email
      if (mongoose.Types.ObjectId.isValid(faculty)) {
        facultyUser = await User.findById(faculty);
      }
      if (!facultyUser) {
        facultyUser = await User.findOne({ $or: [{ facultyId: faculty }, { email: (faculty || '').toLowerCase() }] });
      }
    }

    const classData = { name, code };
    if (facultyUser) classData.faculty = facultyUser._id;

    const newClass = await Class.create(classData);
    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: 'Unable to create class' });
  }
});

router.get('/notices', async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 }).populate('createdBy', 'name email');
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load notices' });
  }
});

router.post('/notices', async (req, res) => {
  try {
    const notice = await Notice.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json(notice);
  } catch (error) {
    res.status(500).json({ message: 'Unable to create notice' });
  }
});

// Add schedule item to a class with faculty conflict check
router.post('/classes/:id/schedule', async (req, res) => {
  try {
    const scheduleSchema = {
      day: { required: true, type: 'string' },
      startTime: { required: true, type: 'string', pattern: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      endTime: { required: true, type: 'string', pattern: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      subject: { required: true, type: 'string', minLength: 2 },
    };

    const error = validateBody(req.body, scheduleSchema);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const { id } = req.params;
    const { day, startTime, endTime, subject } = req.body;

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    if (!days.includes((day || '').toLowerCase())) {
      return res.status(400).json({ message: 'Invalid day of week' });
    }

    const cls = await Class.findById(id);
    if (!cls) return res.status(404).json({ message: 'Class not found' });

    if (!cls.faculty) {
      return res.status(400).json({ message: 'Assign a faculty to the class before scheduling' });
    }

    const facultyId = cls.faculty.toString();

    const toMinutes = (t) => {
      const [h, m] = (t || '').split(':').map((x) => parseInt(x, 10) || 0);
      return h * 60 + m;
    };

    const newStart = toMinutes(startTime);
    const newEnd = toMinutes(endTime);
    if (newEnd <= newStart) return res.status(400).json({ message: 'endTime must be after startTime' });

    // Check other classes for this faculty on the same day for overlap
    const otherClasses = await Class.find({ faculty: facultyId });
    for (const other of otherClasses) {
      // skip current class
      if (other._id.toString() === id) continue;
      (other.schedule || []).forEach((s) => {
        if (!s.day) return;
        if (s.day.toLowerCase() !== day.toLowerCase()) return;
        const sStart = toMinutes(s.startTime);
        const sEnd = toMinutes(s.endTime);
        const overlap = newStart < sEnd && sStart < newEnd;
        if (overlap) {
          throw new Error(`Faculty has another class (${other.name}) scheduled on ${day} ${s.startTime}-${s.endTime}`);
        }
      });
    }

    // Add to class schedule
    cls.schedule.push({ day, startTime, endTime, subject });
    await cls.save();
    res.status(201).json(cls);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Unable to add schedule item' });
  }
});

// Enroll a student in a class
router.post('/classes/:classId/enroll', async (req, res) => {
  try {
    const enrollSchema = {
      studentId: { required: true, type: 'string' },
    };

    const error = validateBody(req.body, enrollSchema);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const { classId } = req.params;
    const { studentId } = req.body;

    const cls = await Class.findById(classId);
    if (!cls) return res.status(404).json({ message: 'Class not found' });

    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    if (student.role !== 'student') {
      return res.status(400).json({ message: 'User is not a student' });
    }

    // Check if already enrolled (handle both old and new format)
    const isEnrolled = cls.students.some((s) => {
      const sId = s.student ? s.student.toString() : (s._id ? s._id.toString() : s.toString());
      return sId === studentId.toString();
    });

    if (isEnrolled) {
      return res.status(400).json({ message: 'Student already enrolled in this class' });
    }

    // Check for schedule conflicts with other enrolled classes
    const toMinutes = (t) => {
      const [h, m] = (t || '').split(':').map((x) => parseInt(x, 10) || 0);
      return h * 60 + m;
    };

    // Get all classes where student is enrolled
    const enrolledClasses = await Class.find({
      'students.student': studentId,
    });

    // Check for conflicts between new class schedule and enrolled classes
    for (const newScheduleItem of cls.schedule || []) {
      const newStart = toMinutes(newScheduleItem.startTime);
      const newEnd = toMinutes(newScheduleItem.endTime);

      for (const enrolledClass of enrolledClasses) {
        for (const existingSchedule of enrolledClass.schedule || []) {
          if (newScheduleItem.day.toLowerCase() === existingSchedule.day.toLowerCase()) {
            const existStart = toMinutes(existingSchedule.startTime);
            const existEnd = toMinutes(existingSchedule.endTime);
            const overlap = newStart < existEnd && existStart < newEnd;

            if (overlap) {
              return res.status(400).json({
                message: `Schedule conflict: Student is already enrolled in ${enrolledClass.name} on ${newScheduleItem.day} ${existingSchedule.startTime}-${existingSchedule.endTime}`,
              });
            }
          }
        }
      }
    }

    cls.students.push({ student: studentId, rollNo: student.studentRoll });
    await cls.save();

    res.json(cls);
  } catch (error) {
    res.status(500).json({ message: 'Unable to enroll student', error: error.message });
  }
});

module.exports = router;
