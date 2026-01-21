const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./database'); // Imports the function from database.js

// Load env vars
dotenv.config();

// Initialize Database
connectDB();

const app = express();

// Middleware
app.use(express.json()); // Body parser for JSON data
app.use(cors()); // Enable Cross-Origin Resource Sharing

// Basic Route for Testing
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error Handling Middleware (Optional but recommended)
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});