# 🔧 Twilio Environment Setup Guide

## ❌ **Error Fixed: Missing TWILIO_PHONE_NUMBER**

The error you encountered was:
```
Error: Required parameter "params['from']" missing.
```

This happens when the `TWILIO_PHONE_NUMBER` environment variable is not set.

## ✅ **Solution: Set Up Environment Variables**

### 1. Create/Update `.env` file in backend directory

Create a `.env` file in your `backend` directory with these variables:

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/your-database-name

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# SMTP Configuration (for email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Twilio Configuration (REQUIRED FOR CALL BOT)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID=your-google-cloud-project-id
GOOGLE_CLOUD_KEY_FILE=./google-cloud-key.json

# Google Gemini AI Configuration
GEMINI_API_KEY=your-gemini-api-key

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 2. Get Twilio Credentials

1. **Sign up for Twilio**: Go to https://www.twilio.com/
2. **Get Account SID**: Found in Twilio Console Dashboard
3. **Get Auth Token**: Found in Twilio Console Dashboard
4. **Buy a Phone Number**: 
   - Go to Phone Numbers > Manage > Buy a number
   - Choose a number with voice capabilities
   - Copy the phone number (e.g., +1234567890)

### 3. Test Your Setup

Run the test script to verify everything is configured:

```bash
cd backend
npm run test-setup
```

You should see:
```
✅ TWILIO_ACCOUNT_SID: AC1234567...
✅ TWILIO_AUTH_TOKEN: your-auth-token...
✅ TWILIO_PHONE_NUMBER: +1234567890
✅ GOOGLE_CLOUD_PROJECT_ID: your-project-id
✅ GEMINI_API_KEY: your-api-key...
```

### 4. Restart Your Server

After setting up environment variables:

```bash
cd backend
npm run dev
```

### 5. Test the Generate Call Button

1. Go to your Dashboard
2. Click "Generate Call" button
3. Check your phone - it should ring!

## 🔍 **Troubleshooting**

### If you still get the "from" parameter error:

1. **Check .env file location**: Make sure it's in the `backend` directory
2. **Check .env file format**: No spaces around `=`, no quotes unless needed
3. **Restart server**: Environment variables are loaded on startup
4. **Check phone number format**: Must include country code (e.g., +1234567890)

### Common Issues:

- **Missing + in phone number**: Use `+1234567890` not `1234567890`
- **Wrong directory**: `.env` file must be in `backend/` directory
- **Server not restarted**: Restart after adding environment variables
- **Invalid credentials**: Double-check Twilio Account SID and Auth Token

## 📞 **Phone Number Format**

The system automatically formats phone numbers:
- **Input**: `9876543210` (Indian number)
- **Formatted**: `+919876543210`
- **Twilio Phone**: `+1234567890` (your Twilio number)

## 🚀 **Next Steps**

Once environment variables are set:

1. ✅ Generate Call button will work
2. ✅ Calls will be made to user's phone
3. ✅ AI assistant will answer and help
4. ✅ Call SID will be returned for tracking

The error is now fixed with proper validation and error handling!
