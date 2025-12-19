import dotenv from 'dotenv';
// Load environment variables FIRST before any other imports
dotenv.config();

import express from 'express';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import nomineeRoutes from './routes/nomineeRoutes.js';
import faceRoutes from './routes/faceRoutes.js';
import twilioRoutes from './routes/twilioRoutes.js';
import cors from 'cors';

const app = express();

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'];
const twilioEnvVars = ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER'];
const googleEnvVars = ['GOOGLE_CLOUD_PROJECT_ID', 'GEMINI_API_KEY'];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
const missingTwilioVars = twilioEnvVars.filter(envVar => !process.env[envVar]);
const missingGoogleVars = googleEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please check your .env file and ensure all required variables are set.');
  process.exit(1);
}

if (missingTwilioVars.length > 0) {
  console.warn('⚠️ Missing Twilio environment variables:', missingTwilioVars.join(', '));
  console.warn('Twilio call bot features will not work without these variables.');
}

if (missingGoogleVars.length > 0) {
  console.warn('⚠️ Missing Google Cloud environment variables:', missingGoogleVars.join(', '));
  console.warn('Speech-to-text and AI features will not work without these variables.');
}

console.log('✅ Core environment variables are present');

// Connect to database
connectDB();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from public directory
app.use(express.static('public'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/nominees', nomineeRoutes);
app.use('/api/faces', faceRoutes);
app.use('/api/twilio', twilioRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Test SMTP endpoint
app.get('/api/test-smtp', async (req, res) => {
  try {
    const nodemailer = await import('nodemailer');
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Test connection
    await transporter.verify();
    
    res.json({
      success: true,
      message: 'SMTP connection successful',
      smtpConfig: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER
      }
    });
  } catch (error) {
    console.error('SMTP test error:', error);
    res.status(500).json({
      success: false,
      message: 'SMTP connection failed',
      error: error.message
    });
  }
});

// Test upload endpoint (without authentication for testing)
app.post('/api/test-upload', (req, res) => {
  console.log('🧪 Test upload endpoint called');
  res.json({
    success: true,
    message: 'Test upload endpoint working',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler - catch all routes that don't match above
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

export default app;