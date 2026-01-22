require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');
const profileRoutes = require('./routes/profile.route');
const adminRoutes = require('./routes/admin.route');


const app = express();

// CORS (dev) - giới hạn origin khi deploy
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || '*' // thay '*' bằng 'http://localhost:5173' khi deploy
}));

// Body parser
app.use(express.json());

// Serve uploads tĩnh (frontend có thể truy cập /uploads/...)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', require('./routes/auth.route'));
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/jobs', require('./routes/job.route'));

// Health
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

// Error handler (cuối cùng)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

// Start server AFTER DB connected
const PORT = process.env.PORT || 4000;
(async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();
