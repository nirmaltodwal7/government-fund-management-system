import mongoose from 'mongoose';

const faceRecordSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  descriptor: {
    encrypted: {
      type: String,
      required: true
    },
    iv: {
      type: String,
      required: true
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
faceRecordSchema.index({ userId: 1, isActive: 1 });

export default mongoose.model('FaceRecord', faceRecordSchema);
