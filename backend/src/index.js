require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const candidatesRouter = require('./routes/candidates');
const contactRouter = require('./routes/contact');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded resumes statically
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Routes
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/candidates', candidatesRouter);
app.use('/api/contact', contactRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
