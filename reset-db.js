const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/erp';
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const db = mongoose.connection.db;
    const result = await db.collection('classes').deleteMany({});
    console.log(`Deleted ${result.deletedCount} classes`);
    
    // Verify
    const count = await db.collection('classes').countDocuments();
    console.log(`Remaining classes: ${count}`);
    
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
