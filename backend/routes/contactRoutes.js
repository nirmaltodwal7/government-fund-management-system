import express from 'express';
import { sendContactEmail, testEmailConfig } from '../controllers/contactController.js';

const router = express.Router();

// Route to send contact form email
router.post('/send', sendContactEmail);

// Route to test email configuration (for debugging)
router.get('/test-email', testEmailConfig);

export default router;


