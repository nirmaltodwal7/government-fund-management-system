import jwt from 'jsonwebtoken';
import Nominee from '../models/Nominee.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Verify nominee JWT token
export const verifyNomineeToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if the token is for a nominee
    if (decoded.userType !== 'nominee') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type. This endpoint is for nominees only.'
      });
    }

    // Verify nominee still exists and is active
    const nominee = await Nominee.findById(decoded.nomineeId);
    if (!nominee || !nominee.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Nominee not found or account deactivated.'
      });
    }

    req.nomineeId = decoded.nomineeId;
    req.nominee = nominee;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }

    console.error('Nominee token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during token verification.'
    });
  }
};

// Check if nominee is verified
export const requireVerifiedNominee = async (req, res, next) => {
  try {
    const nominee = await Nominee.findById(req.nomineeId);
    
    if (!nominee) {
      return res.status(404).json({
        success: false,
        message: 'Nominee not found'
      });
    }

    if (nominee.verificationStatus !== 'Verified') {
      return res.status(403).json({
        success: false,
        message: 'Nominee account is not verified. Please contact support for verification.'
      });
    }

    next();

  } catch (error) {
    console.error('Nominee verification check error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during verification check'
    });
  }
};

// Check if linked user is verified
export const requireLinkedUserVerified = async (req, res, next) => {
  try {
    const nominee = await Nominee.findById(req.nomineeId);
    
    if (!nominee) {
      return res.status(404).json({
        success: false,
        message: 'Nominee not found'
      });
    }

    if (!nominee.linkedUserVerified) {
      return res.status(403).json({
        success: false,
        message: 'Linked user verification is required. Please contact support.'
      });
    }

    next();

  } catch (error) {
    console.error('Linked user verification check error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during linked user verification check'
    });
  }
};
