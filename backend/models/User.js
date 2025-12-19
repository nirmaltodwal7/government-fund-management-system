import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
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
  ppoNumber: { 
    type: String, 
    required: false, 
    unique: true,
    sparse: true, // This allows multiple documents with null/undefined values
    validate: {
      validator: function(v) {
        // Only validate if the value exists
        return !v || /^\d{12}$/.test(v);
      },
      message: 'P.P.O number must be exactly 12 digits'
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
  faceEnrolled: {
    type: Boolean,
    default: false
  },
  faceEnrollmentDate: {
    type: Date,
    default: null
  },
  enrolledSchemes: [{
    schemeName: { type: String, required: true },
    schemeId: { type: String, required: true },
    userUniqueSchemeNumber: { type: String, required: true },
    enrollmentDate: { type: Date, default: Date.now },
    status: { type: String, default: 'Active', enum: ['Active', 'Inactive', 'Pending'] }
  }]
}, {
  timestamps: true
});

export default mongoose.model('User', userSchema);