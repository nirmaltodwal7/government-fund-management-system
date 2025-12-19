import express from 'express';
import {
  enrollFace,
  getUserFaces,
  checkEnrollmentStatus,
  deleteFaceData,
  verifyFace,
  faceLogin
} from '../controllers/faceController.js';

const router = express.Router();

// Face enrollment endpoint
router.post('/enroll', enrollFace);

// Get user's face descriptors
router.get('/:userId', getUserFaces);

// Check enrollment status
router.get('/enrollment-status/:userId', checkEnrollmentStatus);

// Delete face data
router.delete('/:userId', deleteFaceData);

// Verify face
router.post('/verify', verifyFace);

// Face-based login
router.post('/login', faceLogin);

export default router;
