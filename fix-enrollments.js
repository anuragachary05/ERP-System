const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const mongoose = require('mongoose');
const Class = require('./server/src/models/Class');
const User = require('./server/src/models/User');

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/erp';
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // For each class, convert the students array to the correct format
    const classes = await Class.find();
    
    for (const cls of classes) {
      if (cls.students && cls.students.length > 0) {
        const newStudents = [];
        
        for (const s of cls.students) {
          // If s has _id (old format) or if s is just an ObjectId
          const studentId = s._id || s;
          const student = await User.findById(studentId);
          
          if (student) {
            newStudents.push({
              student: student._id,
              rollNo: student.studentRoll
            });
          }
        }
        
        cls.students = newStudents;
        await cls.save();
        console.log(`Updated class ${cls.name} with ${newStudents.length} students`);
      }
    }
    
    console.log('Done fixing student enrollments');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
