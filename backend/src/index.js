require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const authRoutes = require('./routes/auth.route');

const app = express();

// cors
app.use(cors());
// middleware
app.use(express.json());

// routes
app.use('/api/auth', authRoutes);

// connect database
connectDB(process.env.MONGO_URI);

// test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
