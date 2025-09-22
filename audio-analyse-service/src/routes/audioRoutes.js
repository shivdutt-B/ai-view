const express = require('express');
const AudioController = require('../controller/audioController');

const router = express.Router();
const audioController = new AudioController();

// Audio analysis from URL (for S3 integration)
router.post('/analyze-url', (req, res) => audioController.analyzeAudioFromUrl(req, res));

module.exports = router;
