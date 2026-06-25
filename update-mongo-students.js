const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const mongodb = require('mongodb');

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/erp';
const client = new mongodb.MongoClient(uri);

async function main() {
  try {
    await client.connect();
    const db = client.db('erp_db');
    const classesCollection = db.collection('classes');
    
    // Update all documents to fix the students field
    const result = await classesCollection.updateMany(
      {},
      [
        {
          $set: {
            students: {
              $map: {
                input: '$students',
                as: 'student',
                in: {
                  $cond: {
                    if: { $eq: [{ $type: '$$student' }, 'objectId'] },
                    then: { student: '$$student', rollNo: null },
                    if: { $eq: [{ $type: '$$student' }, 'object'] },
                    then: '$$student',
                    else: { student: '$$student', rollNo: null }
                  }
                }
              }
            }
          }
        }
      ]
    );
    
    console.log('Updated documents:', result.modifiedCount);
    
    // Now fetch and display the updated students array
    const classes = await classesCollection.find({}).toArray();
    classes.forEach(c => {
      console.log(`Class ${c.name}: ${JSON.stringify(c.students)}`);
    });
    
  } finally {
    await client.close();
  }
}

main().catch(console.error);
