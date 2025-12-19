import express from 'express';
import {
  handleIncomingCall,
  processRecording,
  serveAudio,
  makeOutboundCall,
  getCallStatus,
  generateCallToUser,
  testTwilioCredentials
} from '../controllers/twilioController.js';

const router = express.Router();

// Webhook endpoints for Twilio
router.post('/webhook/incoming', handleIncomingCall);
router.post('/process-recording', processRecording);
router.get('/audio/:filename', serveAudio);

// API endpoints for making calls and checking status
router.post('/call', makeOutboundCall);
router.get('/call/:callSid', getCallStatus);
router.post('/generate-call', generateCallToUser);

// Test endpoint for Twilio credentials
router.get('/test-credentials', testTwilioCredentials);

export default router;
