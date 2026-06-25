const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const mongoose = require('mongoose');
const Class = require('./server/src/models/Class');

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/erp';
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');
    await Class.updateMany({}, { students: [] });
    console.log('Cleared all enrollments');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Connection error:', err);
    process.exit(1);
  });
