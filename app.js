const db = require('./db/connection');
const cookieParser = require('cookie-parser');
const express = require('express');
const cors = require('cors');
const camelToSnakeMiddleware = require('./middleware/camelToSnakeMiddleware');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const eventRoutes = require('./routes/eventRoutes');
const donationRoutes = require('./routes/donationRoutes');

const app = express();

app.use(cookieParser());
app.use(cors({
  // origin: 'https://bakery-crew-fe.vercel.app',   // for production
  origin: 'http://localhost:5173',   // for local development
  credentials: true
}));
app.use(express.json());
app.use(camelToSnakeMiddleware);
app.use('/api', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api', messageRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/donations', donationRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to the Bakery Crew backend! 🧁');
});
app.get('/api', (req, res) => {
  res.send('BakeryHub API is running!');
});

app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  res.status(500).json({ msg: 'Something went wrong' });
});


module.exports = app;
