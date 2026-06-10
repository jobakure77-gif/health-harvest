// Modular server entry point for backend best practices
// Adhere to modularity and reusability
require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');

const apiRouter = require('./routes/api');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());


// Serve static frontend (HTML/CSS/JS) from repo root so pages can call same-origin `/api/*`
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api', apiRouter);

// Error handling middleware
app.use(errorHandler);

module.exports = app;
