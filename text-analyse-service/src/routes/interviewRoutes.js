const express = require('express');
const router = express.Router();
const analysisController = require('../controller/analysisController');

// Health check route
router.get('/health', analysisController.healthCheck);

// Main analysis route
router.post('/interview', analysisController.analyzeInterview);

module.exports = router;
