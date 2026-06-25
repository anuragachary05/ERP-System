const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const mongoose = require('mongoose');
const Class = require('./server/src/models/Class');

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/erp';
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Directly clear all students arrays
    await Class.updateMany({}, { $set: { students: [] } });
    console.log('Cleared all students arrays');
    
    // Verify
    const classes = await Class.find({});
    classes.forEach(c => {
      console.log(`Class ${c.name}: ${c.students.length} students`);
    });
    
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
