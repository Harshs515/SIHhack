const express = require('express');
const cors = require('cors');
require('dotenv').config();

const complaintRoutes = require('./routes/complaintRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const PORT = process.env.PORT || 5000;



app.use(cors());
app.use(express.json());

// API Routes

app.use('/api/complaints', complaintRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/chat', chatRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'HEALTHY', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Node.js Supabase API Backend running on port ${PORT}`);
});
