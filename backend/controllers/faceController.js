import FaceRecord from '../models/FaceRecord.js';
import User from '../models/User.js';
import crypto from 'crypto';
import mongoose from 'mongoose';

// Simple encryption/decryption for biometric data
const algorithm = 'aes-256-cbc';
const secretKey = crypto.scryptSync(process.env.BIOMETRIC_ENCRYPTION_KEY || 'your-secret-key-32-chars-long!', 'salt', 32);

const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  
  let encrypted = cipher.update(JSON.stringify(text), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    encrypted,
    iv: iv.toString('hex')
  };
};

const decrypt = (encryptedData) => {
  const iv = Buffer.from(encryptedData.iv, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
  
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return JSON.parse(decrypted);
};

// Helper function to validate and convert userId
const validateUserId = (userId) => {
  // Check if it's a valid ObjectId
  if (mongoose.Types.ObjectId.isValid(userId)) {
    return userId;
  }
  
  // If it's not a valid ObjectId, try to find user by email or other field
  // For now, we'll return null and let the calling function handle it
  return null;
};

// Enroll user's face
export const enrollFace = async (req, res) => {
  try {
    const { userId, descriptor, timestamp } = req.body;

    if (!userId || !descriptor || !Array.isArray(descriptor)) {
      return res.status(400).json({ 
        error: 'Invalid data provided. userId and descriptor array are required.' 
      });
    }

    if (descriptor.length !== 128) {
      return res.status(400).json({ 
        error: 'Face descriptor must contain exactly 128 numbers.' 
      });
    }

    // Encrypt the face descriptor
    const encryptedDescriptor = encrypt(descriptor);

    // Check if user already has an active face record
    const existingRecord = await FaceRecord.findOne({ 
      userId, 
      isActive: true 
    });

    if (existingRecord) {
      // Update existing record
      existingRecord.descriptor = encryptedDescriptor;
      existingRecord.timestamp = new Date(timestamp);
      await existingRecord.save();
    } else {
      // Create new record
      const faceRecord = new FaceRecord({
        userId,
        descriptor: encryptedDescriptor,
        timestamp: new Date(timestamp)
      });
      await faceRecord.save();
    }

    // Update user's face enrollment status
    let userToUpdate;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      userToUpdate = await User.findByIdAndUpdate(userId, {
        faceEnrolled: true,
        faceEnrollmentDate: new Date(timestamp)
      });
    } else {
      // If not a valid ObjectId, try to find by email
      userToUpdate = await User.findOneAndUpdate({ email: userId }, {
        faceEnrolled: true,
        faceEnrollmentDate: new Date(timestamp)
      });
    }
    
    if (!userToUpdate) {
      return res.status(404).json({ 
        error: 'User not found for enrollment' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Face enrolled successfully' 
    });
  } catch (error) {
    console.error('Error enrolling face:', error);
    res.status(500).json({ 
      error: 'Failed to enroll face' 
    });
  }
};

// Get user's face descriptors for verification
export const getUserFaces = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ 
        error: 'User ID is required' 
      });
    }

    const faceRecords = await FaceRecord.find({ 
      userId, 
      isActive: true 
    });

    // Decrypt face descriptors
    const decryptedFaces = faceRecords.map(record => ({
      id: record._id,
      descriptor: decrypt(record.descriptor),
      timestamp: record.timestamp
    }));

    res.json(decryptedFaces);
  } catch (error) {
    console.error('Error fetching user faces:', error);
    res.status(500).json({ 
      error: 'Failed to fetch face data' 
    });
  }
};

// Check enrollment status
export const checkEnrollmentStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('🔍 Checking enrollment status for:', userId);

    if (!userId) {
      console.log('❌ No userId provided');
      return res.status(400).json({ 
        error: 'User ID is required' 
      });
    }

    let user;
    
    // Check if userId is a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId);
    } else {
      // If not a valid ObjectId, try to find by email
      user = await User.findOne({ email: userId });
    }
    
    if (!user) {
      console.log('❌ User not found for ID:', userId);
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    console.log('📊 User face enrolled:', user.faceEnrolled);
    res.json({ 
      isEnrolled: user.faceEnrolled,
      enrollmentDate: user.faceEnrollmentDate || null
    });
  } catch (error) {
    console.error('❌ Error checking enrollment status:', error);
    res.status(500).json({ 
      error: 'Failed to check enrollment status' 
    });
  }
};

// Delete user's face data
export const deleteFaceData = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ 
        error: 'User ID is required' 
      });
    }

    // Soft delete - mark as inactive
    await FaceRecord.updateMany(
      { userId, isActive: true },
      { isActive: false }
    );

    res.json({ 
      success: true, 
      message: 'Face data deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting face data:', error);
    res.status(500).json({ 
      error: 'Failed to delete face data' 
    });
  }
};

// Verify face (compare descriptors)
export const verifyFace = async (req, res) => {
  try {
    const { userId, descriptor } = req.body;

    if (!userId || !descriptor || !Array.isArray(descriptor)) {
      return res.status(400).json({ 
        error: 'Invalid data provided. userId and descriptor array are required.' 
      });
    }

    if (descriptor.length !== 128) {
      return res.status(400).json({ 
        error: 'Face descriptor must contain exactly 128 numbers.' 
      });
    }

    // Get stored face descriptors
    const faceRecords = await FaceRecord.find({ 
      userId, 
      isActive: true 
    });

    if (faceRecords.length === 0) {
      return res.status(404).json({ 
        error: 'No enrolled face found for this user' 
      });
    }

    // Decrypt and compare descriptors
    let bestMatch = null;
    let minDistance = Infinity;

    for (const record of faceRecords) {
      const storedDescriptor = decrypt(record.descriptor);
      
      // Calculate Euclidean distance
      let distance = 0;
      for (let i = 0; i < 128; i++) {
        const diff = descriptor[i] - storedDescriptor[i];
        distance += diff * diff;
      }
      distance = Math.sqrt(distance);

      if (distance < minDistance) {
        minDistance = distance;
        bestMatch = record;
      }
    }

    // Threshold for face matching (lower = more strict)
    const threshold = 0.6;
    const isMatch = minDistance < threshold;

    res.json({
      success: true,
      isMatch,
      distance: minDistance,
      threshold,
      confidence: Math.max(0, (threshold - minDistance) / threshold * 100)
    });
  } catch (error) {
    console.error('Error verifying face:', error);
    res.status(500).json({ 
      error: 'Failed to verify face' 
    });
  }
};

// Face-based login verification
export const faceLogin = async (req, res) => {
  try {
    const { userId, descriptor } = req.body;

    if (!userId || !descriptor || !Array.isArray(descriptor)) {
      return res.status(400).json({ 
        error: 'Invalid data provided. userId and descriptor array are required.' 
      });
    }

    if (descriptor.length !== 128) {
      return res.status(400).json({ 
        error: 'Face descriptor must contain exactly 128 numbers.' 
      });
    }

    // Check if user exists and has face enrolled
    let user;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId);
    } else {
      // If not a valid ObjectId, try to find by email
      user = await User.findOne({ email: userId });
    }
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    if (!user.faceEnrolled) {
      return res.status(400).json({ 
        error: 'User has not enrolled face data yet' 
      });
    }

    // Get stored face descriptors
    const faceRecords = await FaceRecord.find({ 
      userId, 
      isActive: true 
    });

    if (faceRecords.length === 0) {
      return res.status(404).json({ 
        error: 'No enrolled face found for this user' 
      });
    }

    // Decrypt and compare descriptors
    let bestMatch = null;
    let minDistance = Infinity;

    for (const record of faceRecords) {
      const storedDescriptor = decrypt(record.descriptor);
      
      // Calculate Euclidean distance
      let distance = 0;
      for (let i = 0; i < 128; i++) {
        const diff = descriptor[i] - storedDescriptor[i];
        distance += diff * diff;
      }
      distance = Math.sqrt(distance);

      if (distance < minDistance) {
        minDistance = distance;
        bestMatch = record;
      }
    }

    // Threshold for face matching (lower = more strict)
    const threshold = 0.6;
    const isMatch = minDistance < threshold;

    if (isMatch) {
      // Generate JWT token for successful face verification
      const jwt = await import('jsonwebtoken');
      const payload = {
        user: {
          id: user._id,
        },
      };
      
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      res.json({
        success: true,
        isMatch: true,
        distance: minDistance,
        threshold,
        confidence: Math.max(0, (threshold - minDistance) / threshold * 100),
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      });
    } else {
      res.json({
        success: true,
        isMatch: false,
        distance: minDistance,
        threshold,
        confidence: Math.max(0, (threshold - minDistance) / threshold * 100),
        message: 'Face verification failed'
      });
    }
  } catch (error) {
    console.error('Error in face login:', error);
    res.status(500).json({ 
      error: 'Failed to verify face for login' 
    });
  }
};
