import mongoose from 'mongoose';

const nomineeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' }
  },
  aadharNumber: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v) {
        return /^\d{12}$/.test(v);
      },
      message: 'Aadhar number must be exactly 12 digits'
    }
  },
  phoneNumber: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        return /^[6-9]\d{9}$/.test(v);
      },
      message: 'Phone number must be a valid 10-digit Indian mobile number'
    }
  },
  dateOfBirth: { 
    type: Date, 
    required: true,
    validate: {
      validator: function(v) {
        return v < new Date();
      },
      message: 'Date of birth must be in the past'
    }
  },
  gender: { 
    type: String, 
    required: true,
    enum: ['Male', 'Female', 'Other']
  },
  // Nominee-specific fields
  relationWithUser: {
    type: String,
    required: true,
    enum: ['Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister', 'Other']
  },
  userAadharNumber: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\d{12}$/.test(v);
      },
      message: 'User Aadhar number must be exactly 12 digits'
    }
  },
  // Status fields
  isActive: {
    type: Boolean,
    default: true
  },
  verificationStatus: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected'],
    default: 'Pending'
  },
  // Email verification fields
  emailVerificationSent: {
    type: Boolean,
    default: false
  },
  emailVerificationSentAt: {
    type: Date,
    default: null
  },
  userConfirmed: {
    type: Boolean,
    default: false
  },
  userConfirmedAt: {
    type: Date,
    default: null
  },
  verificationToken: {
    type: String,
    default: null
  },
  // Document uploads
  documents: [{
    type: {
      type: String,
      enum: ['Death Certificate', 'Medical Document', 'Identity Proof', 'Address Proof']
    },
    fileName: String,
    filePath: String,
    uploadDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    }
  }],
  // Linked user verification
  linkedUserVerified: {
    type: Boolean,
    default: false
  },
  linkedUserDetails: {
    name: String,
    aadharNumber: String,
    phoneNumber: String,
    email: String,
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: String
    },
    dateOfBirth: Date,
    gender: String,
    pensionStatus: {
      type: String,
      enum: ['Active', 'Inactive', 'Suspended'],
      default: 'Active'
    },
    lastLogin: Date,
    medicalStatus: {
      type: String,
      enum: ['Unknown', 'Healthy', 'Ill', 'Critical'],
      default: 'Unknown'
    },
    deathStatus: {
      type: String,
      enum: ['Alive', 'Deceased'],
      default: 'Alive'
    }
  }
}, {
  timestamps: true
});

// Index for faster queries (aadharNumber and email already have unique indexes)
nomineeSchema.index({ userAadharNumber: 1 });

export default mongoose.model('Nominee', nomineeSchema);
