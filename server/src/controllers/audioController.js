const AWS = require('aws-sdk');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: process.env.S3_REGION
});

const BUCKET_NAME = process.env.S3_BUCKET;

// Upload audio file to S3
const uploadAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }
    
    const { interviewId, questionId } = req.body;
    
    if (!interviewId || !questionId) {
      return res.status(400).json({ error: 'Interview ID and Question ID are required' });
    }
    
    console.log('Interview ID:', interviewId);
    console.log('Question ID:', questionId);
    console.log('File details:');
    console.log('  Field name:', req.file.fieldname);
    console.log('  Original name:', req.file.originalname);
    console.log('  Size:', (req.file.size / 1024).toFixed(2) + ' KB');
    console.log('  MIME type:', req.file.mimetype);
    
    // Construct S3 key
    const fileName = `${questionId}.wav`;
    const key = `interviews/${interviewId}/${fileName}`;
    
    console.log('S3 Upload details:');
    console.log('  Bucket:', BUCKET_NAME);
    console.log('  Key:', key);
    
    // Upload to S3
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype || 'audio/wav',
      ContentLength: req.file.size,
    };
    
    console.log('Uploading to S3...');
    const uploadResult = await s3.upload(uploadParams).promise();
    
    console.log('S3 Upload successful:');
    console.log('  Location:', uploadResult.Location);
    console.log('  ETag:', uploadResult.ETag);
    
    const response = {
      success: true,
      url: uploadResult.Location,
      key: uploadResult.Key,
      bucket: uploadResult.Bucket,
      questionId: parseInt(questionId),
      fileName,
      size: req.file.size,
      message: 'Audio file uploaded successfully'
    };
    
    console.log('=== UPLOAD COMPLETE ===');
    console.log('Response:', response);
    
    res.json(response);
  } catch (error) {
    console.error('\n=== AUDIO UPLOAD FAILED ===');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to upload audio file',
      message: error.message 
    });
  }
};

module.exports = {
  uploadAudio,
};
