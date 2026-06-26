const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const facultyRoutes = require('./routes/faculty');
const studentRoutes = require('./routes/student');

// Load .env from repository root if present (server runs with different cwd in some setups)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const fs = require('fs');
connectDB();
const app = express();

app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/student', studentRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Educational ERP API is running' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
