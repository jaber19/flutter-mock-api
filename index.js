const express = require('express');
const multer = require('multer');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS so it can be called from anywhere
app.use(cors());

// Configure multer for memory storage (no files saved)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Image Mock API is running!' });
});

// Main endpoint - only responds with success if image is provided
app.post('/api/image', upload.single('image'), (req, res) => {
  // Check if file was uploaded
  if (!req.file) {
    return res.status(400).json({ 
      success: false, 
      error: 'No image file provided',
      message: 'Please upload an image file'
    });
  }
  
  // Check if it's actually an image by checking mimetype
  const validImageTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/svg+xml'
  ];
  
  if (!validImageTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid file type',
      message: `File type ${req.file.mimetype} is not supported. Please upload an image.`,
      receivedType: req.file.mimetype
    });
  }
  
  // Success response - only returned when valid image is uploaded
  res.json({
    success: true,
    message: 'Image received successfully!',
    data: {
      filename: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype,
      timestamp: new Date().toISOString()
    }
  });
});

// Handle non-multipart requests to the image endpoint
app.post('/api/image', (req, res) => {
  res.status(400).json({
    success: false,
    error: 'Invalid request format',
    message: 'Please send image as multipart/form-data with field name "image"'
  });
});

// Catch all other routes - handle 404s
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: 'Use POST /api/image to upload images'
  });
});

app.listen(port, () => {
  console.log(`Mock API server running on port ${port}`);
});