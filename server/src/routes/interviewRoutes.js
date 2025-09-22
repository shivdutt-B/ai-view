const express = require('express');
const multer = require('multer');
const router = express.Router();
const interviewController = require('../controllers/interviewController');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
  }
});

// Submit complete interview with all Q&A and audio files
router.post('/submit', upload.any(), interviewController.submitCompleteInterview);

module.exports = router;
