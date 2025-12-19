import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import Nominee from '../models/Nominee.js';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Initialize Twilio client
let twilioClient = null;
const getTwilioClient = () => {
  if (!twilioClient) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
};

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER, // your email
      pass: process.env.SMTP_PASS, // your email password or app password
    },
  });
};

// Send nominee verification email to user
const sendNomineeVerificationEmail = async (nominee, linkedUser, verificationToken) => {
  try {
    const transporter = createTransporter();
    
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const confirmUrl = `${baseUrl}/verify-nominee?token=${verificationToken}&action=confirm`;
    const rejectUrl = `${baseUrl}/verify-nominee?token=${verificationToken}&action=reject`;
    
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: linkedUser.email,
      subject: `Nominee Registration Request - ${nominee.name} wants to be your nominee`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Nominee Verification Request</h1>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-top: 0;">Dear ${linkedUser.name},</h2>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              We have received a request for nominee registration from <strong>${nominee.name}</strong> 
              who wants to be registered as your nominee for pension benefits.
            </p>
            
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1976d2; margin-top: 0;">Nominee Details:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; background: #f1f1f1; font-weight: bold; width: 30%;">Name:</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${nominee.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; background: #f1f1f1; font-weight: bold;">Email:</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${nominee.email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; background: #f1f1f1; font-weight: bold;">Phone:</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${nominee.phoneNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; background: #f1f1f1; font-weight: bold;">Relation:</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${nominee.relationWithUser}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; background: #f1f1f1; font-weight: bold;">Aadhar Number:</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${nominee.aadharNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; background: #f1f1f1; font-weight: bold;">Address:</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${nominee.address.street}, ${nominee.address.city}, ${nominee.address.state} - ${nominee.address.pincode}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
              <h4 style="color: #856404; margin-top: 0;">⚠️ Action Required</h4>
              <p style="color: #856404; margin: 10px 0;">
                Please review the nominee details above and confirm or reject this registration request. 
                If you confirm, ${nominee.name} will be able to access your pension benefits in case of your demise.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmUrl}" style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 0 10px; display: inline-block; font-weight: bold;">
                ✅ Confirm Nominee
              </a>
              <a href="${rejectUrl}" style="background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 0 10px; display: inline-block; font-weight: bold;">
                ❌ Reject Nominee
              </a>
            </div>
            
            <div style="background: #d1ecf1; padding: 15px; border-radius: 5px; border-left: 4px solid #17a2b8; margin: 20px 0;">
              <h4 style="color: #0c5460; margin-top: 0;">Important Information</h4>
              <ul style="color: #0c5460; margin: 10px 0;">
                <li>This verification request is valid for 7 days from now</li>
                <li>If you don't recognize this person, please reject the request immediately</li>
                <li>You can contact our support team if you have any concerns</li>
                <li>This is an automated email - please do not reply to this email</li>
              </ul>
            </div>
            
            <div style="background: #f8d7da; padding: 15px; border-radius: 5px; border-left: 4px solid #dc3545; margin: 20px 0;">
              <h4 style="color: #721c24; margin-top: 0;">Security Notice</h4>
              <p style="color: #721c24; margin: 10px 0;">
                If you did not expect this nominee registration request, please contact our support team immediately 
                and consider changing your account password for security purposes.
              </p>
            </div>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0;">Government Benefits Platform - Nominee Verification</p>
            <p style="margin: 5px 0 0 0; font-size: 12px;">Time: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`✅ Nominee verification email sent successfully to ${linkedUser.email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending nominee verification email:', error.message);
    return false;
  }
};

// Generate bot call for nominee verification
const generateNomineeVerificationCall = async (nominee, linkedUser) => {
  try {
    // Check if Twilio phone number is configured
    if (!process.env.TWILIO_PHONE_NUMBER) {
      console.error('TWILIO_PHONE_NUMBER environment variable is not set');
      return false;
    }

    // Validate phone number format (add country code if missing)
    let formattedPhoneNumber = linkedUser.phoneNumber;
    if (!formattedPhoneNumber.startsWith('+')) {
      // Assume Indian number if no country code
      formattedPhoneNumber = `+91${formattedPhoneNumber}`;
    }
    
    // Create a personalized message for nominee verification
    const personalizedMessage = `Hello ${linkedUser.name}! This is an automated call from the Government Benefits Platform. 
    We have received a nominee registration request from ${nominee.name} who wants to be registered as your nominee for pension benefits. 
    Please check your email for verification details and take appropriate action. 
    If you have any questions, please contact our support team. Thank you for using our services.`;
    
    // Create TwiML for the call
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say({
      voice: 'alice',
      language: 'en-US'
    }, personalizedMessage);
    
    // Add a pause and then say goodbye
    twiml.pause({ length: 2 });
    twiml.say({
      voice: 'alice',
      language: 'en-US'
    }, 'This is an automated call. Please do not reply. Goodbye!');
    
    console.log(`📞 Attempting to call ${formattedPhoneNumber} for nominee verification from ${process.env.TWILIO_PHONE_NUMBER}`);
    
    // Make the call
    try {
      const call = await getTwilioClient().calls.create({
        twiml: twiml.toString(),
        to: formattedPhoneNumber,
        from: process.env.TWILIO_PHONE_NUMBER
      });
    
      console.log(`📞 Generated nominee verification call to user ${formattedPhoneNumber} (${linkedUser.name}) - Call SID: ${call.sid}`);
      return { success: true, callSid: call.sid };
    } catch (callError) {
      console.error('Error creating Twilio call for nominee verification:', callError);
      console.error('Call error details:', {
        message: callError.message,
        code: callError.code,
        status: callError.status,
        moreInfo: callError.moreInfo
      });
      
      // Handle specific Twilio errors
      if (callError.code === 21219) {
        console.error('Phone number is not verified. Please verify the number in your Twilio account or upgrade to a paid account.');
      } else if (callError.code === 21211) {
        console.error('Invalid phone number format.');
      } else if (callError.code === 21214) {
        console.error('Phone number is not a valid mobile number.');
      }
      
      return { success: false, error: callError.message };
    }
  } catch (error) {
    console.error('Error generating nominee verification call:', error);
    return { success: false, error: error.message };
  }
};

// Send document upload notification email to user
const sendDocumentUploadNotificationToUser = async (nominee, document, linkedUser) => {
  try {
    const transporter = createTransporter();
    
    const isMedicalDoc = document.type === 'Medical Document';
    const isDeathCert = document.type === 'Death Certificate';
    
    // Determine email styling and urgency based on document type
    let gradientColor, alertTitle, urgencyLevel, actionText;
    
    if (isDeathCert) {
      gradientColor = 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)';
      alertTitle = 'Death Certificate Upload Alert';
      urgencyLevel = 'CRITICAL';
      actionText = 'This is a critical notification. A death certificate has been uploaded for your account.';
    } else if (isMedicalDoc) {
      gradientColor = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)';
      alertTitle = 'Medical Document Upload Alert';
      urgencyLevel = 'HIGH';
      actionText = 'A medical document has been uploaded for your account by your nominee.';
    } else {
      gradientColor = 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
      alertTitle = 'Document Upload Notification';
      urgencyLevel = 'MEDIUM';
      actionText = 'A document has been uploaded for your account by your nominee.';
    }
    
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: linkedUser.email,
      subject: `${document.type} Uploaded by Your Nominee - ${nominee.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${gradientColor}; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">${alertTitle}</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 14px;">Priority: ${urgencyLevel}</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-top: 0;">Dear ${linkedUser.name},</h2>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              ${actionText} Please review the details below and take appropriate action if necessary.
            </p>
            
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1976d2; margin-top: 0;">Document Upload Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd; background: #f1f1f1; font-weight: bold; width: 30%;">Your Nominee:</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${nominee.name}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd; background: #f1f1f1; font-weight: bold;">Nominee Email:</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${nominee.email}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd; background: #f1f1f1; font-weight: bold;">Nominee Phone:</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${nominee.phoneNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd; background: #f1f1f1; font-weight: bold;">Relation:</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${nominee.relationWithUser}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd; background: #f1f1f1; font-weight: bold;">Document Type:</td>
                  <td style="padding: 10px; border: 1px solid #ddd; color: ${isDeathCert ? '#dc2626' : isMedicalDoc ? '#e74c3c' : '#3b82f6'}; font-weight: bold;">${document.type}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd; background: #f1f1f1; font-weight: bold;">File Name:</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${document.fileName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd; background: #f1f1f1; font-weight: bold;">Upload Date:</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${new Date(document.uploadDate).toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd; background: #f1f1f1; font-weight: bold;">Status:</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${document.status}</td>
                </tr>
              </table>
            </div>
            
            ${isDeathCert ? `
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626; margin: 20px 0;">
              <h4 style="color: #dc2626; margin-top: 0;">⚠️ CRITICAL: Death Certificate Upload</h4>
              <p style="color: #dc2626; margin: 10px 0; font-weight: bold;">
                A death certificate has been uploaded for your account. This indicates that your nominee believes you may be deceased.
              </p>
              <ul style="color: #dc2626; margin: 10px 0;">
                <li>If this is incorrect, please contact our support team immediately</li>
                <li>If this is accurate, your pension benefits will be transferred to your nominee</li>
                <li>This action may affect your account status and benefits</li>
              </ul>
            </div>
            ` : ''}
            
            ${isMedicalDoc ? `
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
              <h4 style="color: #856404; margin-top: 0;">⚠️ Medical Document Upload</h4>
              <p style="color: #856404; margin: 10px 0;">
                A medical document has been uploaded for your account. This may indicate a change in your medical condition or eligibility for benefits.
              </p>
              <ul style="color: #856404; margin: 10px 0;">
                <li>Review the document details above</li>
                <li>Contact your nominee if you need clarification</li>
                <li>Contact our support team if you have concerns</li>
              </ul>
            </div>
            ` : ''}
            
            <div style="background: #d1ecf1; padding: 20px; border-radius: 8px; border-left: 4px solid #17a2b8; margin: 20px 0;">
              <h4 style="color: #0c5460; margin-top: 0;">What This Means</h4>
              <ul style="color: #0c5460; margin: 10px 0;">
                <li>Your nominee has uploaded a document related to your account</li>
                <li>This document will be reviewed by our team</li>
                <li>You may be contacted if additional information is required</li>
                <li>Your account status may be updated based on the document</li>
              </ul>
            </div>
            
            <div style="background: #f8d7da; padding: 20px; border-radius: 8px; border-left: 4px solid #dc3545; margin: 20px 0;">
              <h4 style="color: #721c24; margin-top: 0;">Important Security Notice</h4>
              <p style="color: #721c24; margin: 10px 0;">
                If you did not authorize this document upload or if you have concerns about this notification, 
                please contact our support team immediately. Your account security is our priority.
              </p>
              <p style="color: #721c24; margin: 10px 0;">
                <strong>Support Contact:</strong> Please reach out to our support team through the official channels.
              </p>
            </div>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0;">
              <h4 style="color: #155724; margin-top: 0;">Next Steps</h4>
              <ol style="color: #155724; margin: 10px 0;">
                <li>Review the document information above</li>
                <li>Verify that your nominee ${nominee.name} is authorized to upload documents for you</li>
                <li>Contact your nominee if you need clarification about the document</li>
                <li>Reach out to our support team if you have any concerns or questions</li>
              </ol>
            </div>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0;">Government Benefits Platform - Document Upload Notification</p>
            <p style="margin: 5px 0 0 0; font-size: 12px;">Time: ${new Date().toLocaleString()}</p>
            <p style="margin: 5px 0 0 0; font-size: 12px;">This is an automated notification. Please do not reply to this email.</p>
          </div>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`✅ Document upload notification email sent successfully to ${linkedUser.email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending document upload notification email to user:', error.message);
    return false;
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/nominees';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow only specific file types
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, JPG, and PNG files are allowed!'));
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// Register a new nominee
export const registerNominee = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      address,
      aadharNumber,
      phoneNumber,
      dateOfBirth,
      gender,
      relationWithUser,
      userAadharNumber
    } = req.body;

    // Check if nominee already exists
    const existingNominee = await Nominee.findOne({
      $or: [
        { email },
        { aadharNumber }
      ]
    });

    if (existingNominee) {
      return res.status(400).json({
        success: false,
        message: 'Nominee with this email or Aadhar number already exists'
      });
    }

    // Verify that the user exists (the person they're nominating for)
    const linkedUser = await User.findOne({ aadharNumber: userAadharNumber });
    if (!linkedUser) {
      return res.status(400).json({
        success: false,
        message: 'No user found with the provided Aadhar number. Please verify the Aadhar number.'
      });
    }

    // Check if this user already has a nominee
    const existingNomineeForUser = await Nominee.findOne({ userAadharNumber });
    if (existingNomineeForUser) {
      return res.status(400).json({
        success: false,
        message: 'This user already has a nominee registered'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate verification token
    const verificationToken = jwt.sign(
      { 
        nomineeId: Date.now().toString(), // Temporary ID before save
        userAadharNumber,
        action: 'nominee_verification'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Create nominee
    const nominee = new Nominee({
      name,
      email,
      password: hashedPassword,
      address,
      aadharNumber,
      phoneNumber,
      dateOfBirth,
      gender,
      relationWithUser,
      userAadharNumber,
      verificationToken,
      emailVerificationSent: false,
      emailVerificationSentAt: null,
      userConfirmed: false,
      userConfirmedAt: null,
      linkedUserDetails: {
        name: linkedUser.name,
        aadharNumber: linkedUser.aadharNumber,
        phoneNumber: linkedUser.phoneNumber,
        email: linkedUser.email,
        address: linkedUser.address,
        dateOfBirth: linkedUser.dateOfBirth,
        gender: linkedUser.gender,
        pensionStatus: 'Active',
        lastLogin: linkedUser.updatedAt,
        medicalStatus: 'Unknown',
        deathStatus: 'Alive'
      }
    });

    await nominee.save();

    // Update verification token with actual nominee ID
    const updatedVerificationToken = jwt.sign(
      { 
        nomineeId: nominee._id,
        userAadharNumber,
        action: 'nominee_verification'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    nominee.verificationToken = updatedVerificationToken;
    await nominee.save();

    // Send verification email to the linked user
    console.log('📧 Sending nominee verification email...');
    const emailSent = await sendNomineeVerificationEmail(nominee, linkedUser, updatedVerificationToken);
    let callResult = null;
    
    if (emailSent) {
      nominee.emailVerificationSent = true;
      nominee.emailVerificationSentAt = new Date();
      await nominee.save();
      console.log('✅ Nominee verification email sent and status updated');
      
      // Generate bot call for nominee verification
      console.log('📞 Generating bot call for nominee verification...');
      callResult = await generateNomineeVerificationCall(nominee, linkedUser);
      
      if (callResult.success) {
        console.log(`✅ Nominee verification call generated successfully - Call SID: ${callResult.callSid}`);
      } else {
        console.log(`❌ Failed to generate nominee verification call: ${callResult.error}`);
      }
    } else {
      console.log('❌ Failed to send nominee verification email');
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        nomineeId: nominee._id, 
        email: nominee.email,
        userType: 'nominee'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Determine the response message based on email and call status
    let responseMessage = 'Nominee registered successfully.';
    let callGenerated = false;
    
    if (emailSent) {
      responseMessage += ' A verification email has been sent to the user for confirmation.';
      // Check if call was also generated (we already called it above)
      if (callResult && callResult.success) {
        responseMessage += ' An automated call has also been made to inform the user about the nominee registration.';
        callGenerated = true;
      }
    } else {
      responseMessage += ' However, there was an issue sending the verification email.';
    }

    res.status(201).json({
      success: true,
      message: responseMessage,
      token,
      userType: 'nominee',
      verificationEmailSent: emailSent,
      nominee: {
        id: nominee._id,
        name: nominee.name,
        email: nominee.email,
        relationWithUser: nominee.relationWithUser,
        userAadharNumber: nominee.userAadharNumber,
        verificationStatus: 'Pending'
      }
    });

  } catch (error) {
    console.error('Nominee registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during nominee registration'
    });
  }
};

// Login nominee
export const loginNominee = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find nominee by email
    const nominee = await Nominee.findOne({ email });
    if (!nominee) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if nominee is active
    if (!nominee.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your nominee account has been deactivated. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, nominee.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        nomineeId: nominee._id, 
        email: nominee.email,
        userType: 'nominee'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Nominee login successful',
      token,
      userType: 'nominee',
      nominee: {
        id: nominee._id,
        name: nominee.name,
        email: nominee.email,
        relationWithUser: nominee.relationWithUser,
        userAadharNumber: nominee.userAadharNumber
      }
    });

  } catch (error) {
    console.error('Nominee login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during nominee login'
    });
  }
};

// Get nominee profile
export const getNomineeProfile = async (req, res) => {
  try {
    const nominee = await Nominee.findById(req.nomineeId).select('-password');
    if (!nominee) {
      return res.status(404).json({
        success: false,
        message: 'Nominee not found'
      });
    }

    res.json({
      success: true,
      nominee
    });

  } catch (error) {
    console.error('Get nominee profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching nominee profile'
    });
  }
};

// Update nominee profile
export const updateNomineeProfile = async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password; // Don't allow password updates through this route
    delete updates.userAadharNumber; // Don't allow changing linked user
    delete updates.aadharNumber; // Don't allow changing Aadhar

    const nominee = await Nominee.findByIdAndUpdate(
      req.nomineeId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!nominee) {
      return res.status(404).json({
        success: false,
        message: 'Nominee not found'
      });
    }

    res.json({
      success: true,
      message: 'Nominee profile updated successfully',
      nominee
    });

  } catch (error) {
    console.error('Update nominee profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating nominee profile'
    });
  }
};

// Upload document
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { type } = req.body;
    const file = req.file;

    // Validate document type
    if (!type || !['Death Certificate', 'Medical Document'].includes(type)) {
      // Delete the uploaded file if validation fails
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid document type. Must be either "Death Certificate" or "Medical Document"'
      });
    }

    const nominee = await Nominee.findById(req.nomineeId);
    if (!nominee) {
      // Delete the uploaded file if nominee not found
      fs.unlinkSync(file.path);
      return res.status(404).json({
        success: false,
        message: 'Nominee not found'
      });
    }

    // Add document to nominee's documents array
    const document = {
      type,
      fileName: file.originalname,
      filePath: file.path,
      uploadDate: new Date(),
      status: 'Pending'
    };

    nominee.documents.push(document);
    await nominee.save();

    // Send email notification for both medical documents and death certificates
    if (type === 'Medical Document' || type === 'Death Certificate') {
      console.log(`📧 Attempting to send email for ${type} upload`);
      try {
        const transporter = createTransporter();
        console.log('📧 Email transporter created successfully');
        
        // Determine email styling based on document type
        const isMedicalDoc = type === 'Medical Document';
        const gradientColor = isMedicalDoc ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)' : 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)';
        const alertTitle = isMedicalDoc ? 'Medical Document Upload Alert' : 'Death Certificate Upload Alert';
        const urgencyText = isMedicalDoc ? 'Medical Document' : 'Death Certificate';
        
        const mailOptions = {
          from: process.env.SMTP_USER,
          to: 'setunidhi0@gmail.com', // Target email address
          subject: `${type} Uploaded - ${nominee.linkedUserDetails.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: ${gradientColor}; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">${alertTitle}</h1>
              </div>
              
              <div style="padding: 30px; background: #f8f9fa;">
                <h2 style="color: #333; margin-top: 0;">Document Upload Details</h2>
                
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                  <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; background: #f1f1f1; font-weight: bold; width: 30%;">Nominee Name:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${nominee.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; background: #f1f1f1; font-weight: bold;">Nominee Email:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${nominee.email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; background: #f1f1f1; font-weight: bold;">Linked User:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${nominee.linkedUserDetails.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; background: #f1f1f1; font-weight: bold;">User Aadhar:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${nominee.linkedUserDetails.aadharNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; background: #f1f1f1; font-weight: bold;">Document Type:</td>
                    <td style="padding: 10px; border: 1px solid #ddd; color: #e74c3c; font-weight: bold;">${type}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; background: #f1f1f1; font-weight: bold;">File Name:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${file.originalname}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; background: #f1f1f1; font-weight: bold;">File Size:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${(file.size / 1024 / 1024).toFixed(2)} MB</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; background: #f1f1f1; font-weight: bold;">Upload Date:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${new Date().toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; background: #f1f1f1; font-weight: bold;">Relation:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${nominee.relationWithUser}</td>
                  </tr>
                </table>
                
                <div style="background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0;">
                  <h4 style="color: #856404; margin-top: 0;">⚠️ Action Required</h4>
                  <p style="color: #856404; margin: 10px 0;">
                    A ${type.toLowerCase()} has been uploaded for <strong>${nominee.linkedUserDetails.name}</strong> by their nominee <strong>${nominee.name}</strong>. 
                    ${isMedicalDoc ? 
                      'Please review the document and take appropriate action regarding the user\'s medical status and benefits eligibility.' :
                      'Please review the death certificate and process the transfer of pension benefits to the nominee as per government regulations.'
                    }
                  </p>
                </div>
                
                <div style="background: #d1ecf1; padding: 15px; border-radius: 5px; border-left: 4px solid #17a2b8; margin: 20px 0;">
                  <h4 style="color: #0c5460; margin-top: 0;">Next Steps</h4>
                  <ul style="color: #0c5460; margin: 10px 0;">
                    ${isMedicalDoc ? 
                      `<li>Review the uploaded medical document</li>
                       <li>Verify the authenticity of the document</li>
                       <li>Update the user's medical status in the system</li>
                       <li>Contact the nominee if additional information is required</li>
                       <li>Process any necessary benefit adjustments</li>` :
                      `<li>Review the uploaded death certificate</li>
                       <li>Verify the authenticity and validity of the certificate</li>
                       <li>Update the user's status to deceased in the system</li>
                       <li>Transfer pension benefits to the nominee</li>
                       <li>Contact the nominee for any additional documentation</li>
                       <li>Process the benefit transfer as per government guidelines</li>`
                    }
                  </ul>
                </div>
                
                <div style="background: #f8d7da; padding: 15px; border-radius: 5px; border-left: 4px solid #dc3545; margin: 20px 0;">
                  <h4 style="color: #721c24; margin-top: 0;">Important Note</h4>
                  <p style="color: #721c24; margin: 10px 0;">
                    This is an automated notification. Please ensure timely review and processing of this ${type.toLowerCase()} upload to maintain service quality and user satisfaction.
                    ${isMedicalDoc ? '' : ' Death certificate uploads require immediate attention and processing.'}
                  </p>
                </div>
              </div>
              
              <div style="background: #333; color: white; padding: 20px; text-align: center;">
                <p style="margin: 0;">Government Benefits Platform - ${type} Alert</p>
                <p style="margin: 5px 0 0 0; font-size: 12px;">Time: ${new Date().toLocaleString()}</p>
              </div>
            </div>
          `,
          attachments: [
            {
              filename: file.originalname,
              path: file.path,
              contentType: file.mimetype
            }
          ]
        };

        console.log('📧 Sending email with options:', {
          from: mailOptions.from,
          to: mailOptions.to,
          subject: mailOptions.subject
        });
        
        await transporter.sendMail(mailOptions);
        console.log(`✅ ${type} email sent successfully to setunidhi0@gmail.com`);
      } catch (emailError) {
        console.error(`❌ Error sending ${type.toLowerCase()} email:`, emailError.message);
        console.error('Email error details:', {
          code: emailError.code,
          command: emailError.command,
          response: emailError.response
        });
        // Don't fail the upload if email fails
      }
    }

    // Send notification email to the linked user
    console.log('📧 Sending document upload notification to linked user...');
    try {
      const userNotificationSent = await sendDocumentUploadNotificationToUser(
        nominee, 
        document, 
        nominee.linkedUserDetails
      );
      
      if (userNotificationSent) {
        console.log(`✅ Document upload notification sent successfully to ${nominee.linkedUserDetails.email}`);
      } else {
        console.log(`❌ Failed to send document upload notification to ${nominee.linkedUserDetails.email}`);
      }
    } catch (userEmailError) {
      console.error('❌ Error sending document upload notification to user:', userEmailError.message);
      // Don't fail the upload if user notification email fails
    }

    res.json({
      success: true,
      message: 'Document uploaded successfully. Notification emails have been sent to both the administration and the linked user.',
      document: document,
      notificationsSent: {
        admin: true,
        user: true
      }
    });

  } catch (error) {
    console.error('Upload document error:', error);
    
    // Delete the uploaded file if there was an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error while uploading document'
    });
  }
};

// Get nominee documents
export const getNomineeDocuments = async (req, res) => {
  try {
    const nominee = await Nominee.findById(req.nomineeId).select('documents');
    if (!nominee) {
      return res.status(404).json({
        success: false,
        message: 'Nominee not found'
      });
    }

    res.json({
      success: true,
      documents: nominee.documents
    });

  } catch (error) {
    console.error('Get nominee documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching documents'
    });
  }
};

// Delete document
export const deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    // Validate documentId
    if (!documentId) {
      return res.status(400).json({
        success: false,
        message: 'Document ID is required'
      });
    }

    console.log('Deleting document:', { documentId, nomineeId: req.nomineeId });

    const nominee = await Nominee.findById(req.nomineeId);
    if (!nominee) {
      return res.status(404).json({
        success: false,
        message: 'Nominee not found'
      });
    }

    // Find the document to delete
    const documentIndex = nominee.documents.findIndex(doc => doc._id.toString() === documentId);
    if (documentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const document = nominee.documents[documentIndex];
    console.log('Found document to delete:', { 
      fileName: document.fileName, 
      type: document.type, 
      filePath: document.filePath 
    });
    
    // Delete the file from filesystem
    if (document.filePath && fs.existsSync(document.filePath)) {
      try {
        fs.unlinkSync(document.filePath);
        console.log('File deleted from filesystem:', document.filePath);
      } catch (fileError) {
        console.error('Error deleting file from filesystem:', fileError);
        // Continue with database deletion even if file deletion fails
      }
    }

    // Remove document from array
    nominee.documents.splice(documentIndex, 1);
    await nominee.save();

    console.log('Document deleted successfully from database');

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Delete document error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      documentId: req.params.documentId,
      nomineeId: req.nomineeId
    });
    
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting document'
    });
  }
};

// Update linked user status
export const updateLinkedUserStatus = async (req, res) => {
  try {
    const { medicalStatus, deathStatus } = req.body;

    const nominee = await Nominee.findById(req.nomineeId);
    if (!nominee) {
      return res.status(404).json({
        success: false,
        message: 'Nominee not found'
      });
    }

    // Update linked user status
    if (medicalStatus) {
      nominee.linkedUserDetails.medicalStatus = medicalStatus;
    }
    if (deathStatus) {
      nominee.linkedUserDetails.deathStatus = deathStatus;
    }

    await nominee.save();

    res.json({
      success: true,
      message: 'Linked user status updated successfully',
      linkedUserDetails: nominee.linkedUserDetails
    });

  } catch (error) {
    console.error('Update linked user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating linked user status'
    });
  }
};

// Verify nominee (user confirms or rejects)
export const verifyNominee = async (req, res) => {
  try {
    const { token, action } = req.body;

    if (!token || !action) {
      return res.status(400).json({
        success: false,
        message: 'Token and action are required'
      });
    }

    if (!['confirm', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be either "confirm" or "reject"'
      });
    }

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Check if it's a nominee verification token
    if (decoded.action !== 'nominee_verification') {
      return res.status(400).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    // Find the nominee
    const nominee = await Nominee.findById(decoded.nomineeId);
    if (!nominee) {
      return res.status(404).json({
        success: false,
        message: 'Nominee not found'
      });
    }

    // Check if already processed
    if (nominee.userConfirmed !== false) {
      return res.status(400).json({
        success: false,
        message: 'This nominee verification has already been processed'
      });
    }

    // Check if token matches
    if (nominee.verificationToken !== token) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
    }

    // Update nominee based on action
    if (action === 'confirm') {
      nominee.userConfirmed = true;
      nominee.userConfirmedAt = new Date();
      nominee.verificationStatus = 'Verified';
      nominee.linkedUserVerified = true;
      
      await nominee.save();
      
      res.json({
        success: true,
        message: 'Nominee verification confirmed successfully',
        nominee: {
          id: nominee._id,
          name: nominee.name,
          email: nominee.email,
          relationWithUser: nominee.relationWithUser,
          verificationStatus: 'Verified'
        }
      });
    } else {
      // Reject the nominee
      nominee.userConfirmed = false;
      nominee.userConfirmedAt = new Date();
      nominee.verificationStatus = 'Rejected';
      nominee.isActive = false;
      
      await nominee.save();
      
      res.json({
        success: true,
        message: 'Nominee verification rejected',
        nominee: {
          id: nominee._id,
          name: nominee.name,
          email: nominee.email,
          relationWithUser: nominee.relationWithUser,
          verificationStatus: 'Rejected'
        }
      });
    }

  } catch (error) {
    console.error('Verify nominee error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during nominee verification'
    });
  }
};

// Get verification status (for nominee to check their status)
export const getVerificationStatus = async (req, res) => {
  try {
    const nominee = await Nominee.findById(req.nomineeId).select(
      'verificationStatus userConfirmed userConfirmedAt emailVerificationSent emailVerificationSentAt linkedUserVerified'
    );
    
    if (!nominee) {
      return res.status(404).json({
        success: false,
        message: 'Nominee not found'
      });
    }

    res.json({
      success: true,
      verificationStatus: nominee.verificationStatus,
      userConfirmed: nominee.userConfirmed,
      userConfirmedAt: nominee.userConfirmedAt,
      emailVerificationSent: nominee.emailVerificationSent,
      emailVerificationSentAt: nominee.emailVerificationSentAt,
      linkedUserVerified: nominee.linkedUserVerified
    });

  } catch (error) {
    console.error('Get verification status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching verification status'
    });
  }
};

// Logout nominee
export const logoutNominee = async (req, res) => {
  try {
    // In a more sophisticated setup, you might want to blacklist the token
    res.json({
      success: true,
      message: 'Nominee logged out successfully'
    });
  } catch (error) {
    console.error('Nominee logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout'
    });
  }
};
