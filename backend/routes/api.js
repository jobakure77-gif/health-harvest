// API Router for modularity and reusability
// Adhere to modularity and reusability

const express = require('express');
const router = express.Router();

// Example modular route
router.get('/status', (req, res) => {
    res.json({ success: true, message: 'API is running' });
});

// Health check endpoint for deployment validation (e.g. Railway)
router.get('/health', (req, res) => {
    res.json({ status: 'UP', timestamp: new Date().toISOString() });
});


// Plant detection route
router.use('/plant', require('./plant'));

module.exports = router;
