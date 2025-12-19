# Twilio Call Bot Setup Guide

## Environment Variables Required

Add these variables to your `.env` file in the backend directory:

```env
# Twilio Configuration (for call bot)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID=your-google-cloud-project-id
GOOGLE_CLOUD_KEY_FILE=./google-cloud-key.json

# Google Gemini AI Configuration
GEMINI_API_KEY=your-gemini-api-key
```

## Setup Instructions

### 1. Twilio Setup
1. Sign up for a Twilio account at https://www.twilio.com/
2. Get your Account SID and Auth Token from the Twilio Console
3. Purchase a phone number from Twilio
4. Add the credentials to your `.env` file

### 2. Google Cloud Setup
1. Create a Google Cloud Project
2. Enable the following APIs:
   - Cloud Speech-to-Text API
   - Cloud Text-to-Speech API
3. Create a service account and download the JSON key file
4. Place the key file in the backend directory as `google-cloud-key.json`
5. Add your project ID to the `.env` file

### 3. Google Gemini AI Setup
1. Go to https://makersuite.google.com/app/apikey
2. Create an API key for Gemini
3. Add the API key to your `.env` file

### 4. Webhook Configuration
1. In your Twilio Console, go to Phone Numbers > Manage > Active Numbers
2. Click on your phone number
3. Set the webhook URL to: `https://your-domain.com/api/twilio/webhook/incoming`
4. Set HTTP method to POST

## API Endpoints

### Webhook Endpoints (for Twilio)
- `POST /api/twilio/webhook/incoming` - Handles incoming calls
- `POST /api/twilio/process-recording` - Processes recorded audio
- `GET /api/twilio/audio/:filename` - Serves generated audio files

### API Endpoints (for your application)
- `POST /api/twilio/call` - Make outbound calls
- `GET /api/twilio/call/:callSid` - Get call status

## Usage Examples

### Making an Outbound Call
```javascript
const response = await fetch('/api/twilio/call', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    phoneNumber: '+1234567890',
    message: 'Hello! This is an automated call from our system.'
  })
});
```

### Getting Call Status
```javascript
const response = await fetch('/api/twilio/call/CALL_SID');
const callData = await response.json();
```

## Features

- **Incoming Call Handling**: Automatically answers calls and greets users
- **Speech-to-Text**: Converts user speech to text using Google Cloud Speech
- **AI Responses**: Generates intelligent responses using Google Gemini
- **Text-to-Speech**: Converts AI responses back to speech
- **Conversation Flow**: Maintains conversation context
- **Outbound Calls**: Ability to make automated outbound calls
- **Call Status Tracking**: Monitor call status and duration

## File Structure

```
backend/
├── controllers/
│   └── twilioController.js    # Main Twilio call bot logic
├── routes/
│   └── twilioRoutes.js        # Twilio API routes
├── uploads/
│   └── temp/                  # Temporary audio files
└── google-cloud-key.json     # Google Cloud service account key
```

## Testing

1. Install dependencies: `npm install`
2. Set up environment variables
3. Start the server: `npm run dev`
4. Configure Twilio webhook URL
5. Call your Twilio number to test the bot

## Troubleshooting

- Ensure all environment variables are set correctly
- Check that Google Cloud APIs are enabled
- Verify Twilio webhook URL is accessible
- Check server logs for detailed error messages
- Ensure audio files directory has write permissions
