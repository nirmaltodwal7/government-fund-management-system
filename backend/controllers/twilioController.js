import twilio from 'twilio';
import { SpeechClient } from '@google-cloud/speech';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Twilio client (lazy initialization)
let client = null;

const getTwilioClient = () => {
  if (!client) {
    console.log('🔍 Twilio Credentials Check:');
    console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? '✅ Set' : '❌ Missing');
    console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? '✅ Set' : '❌ Missing');
    console.log('TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER ? '✅ Set' : '❌ Missing');

    // Validate Twilio credentials format
    if (process.env.TWILIO_ACCOUNT_SID && !process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
      console.error('❌ Invalid TWILIO_ACCOUNT_SID format - should start with "AC"');
    }
    if (process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_AUTH_TOKEN.length < 30) {
      console.error('❌ TWILIO_AUTH_TOKEN appears to be too short');
    }

    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return client;
};

// Initialize Google Cloud Speech client
const speechClient = new SpeechClient({
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE || './google-cloud-key.json',
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
});

// Initialize Google Cloud Text-to-Speech client
const ttsClient = new TextToSpeechClient({
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE || './google-cloud-key.json',
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
});

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Test Twilio credentials endpoint
export const testTwilioCredentials = async (req, res) => {
  try {
    console.log('🧪 Testing Twilio credentials...');
    
    // Test credentials by making a simple API call
    const account = await getTwilioClient().api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    
    res.json({
      success: true,
      message: 'Twilio credentials are valid',
      accountSid: account.sid,
      accountName: account.friendlyName,
      status: account.status
    });
  } catch (error) {
    console.error('❌ Twilio credentials test failed:', error);
    
    res.status(500).json({
      success: false,
      message: 'Twilio credentials test failed',
      error: error.message,
      code: error.code,
      status: error.status
    });
  }
};

// TwiML response for incoming calls
export const handleIncomingCall = (req, res) => {
  try {
    console.log('📞 Incoming call received');
    
    const twiml = new twilio.twiml.VoiceResponse();
    
    // Greet the caller
    twiml.say({
      voice: 'alice',
      language: 'en-US'
    }, 'Hello! Welcome to our AI assistant. Please speak after the beep, and I will help you with your questions.');
    
    // Record the caller's message
    twiml.record({
      maxLength: 30,
      action: '/api/twilio/process-recording',
      method: 'POST',
      finishOnKey: '#',
      playBeep: true
    });
    
    // If no recording is made, say goodbye
    twiml.say({
      voice: 'alice',
      language: 'en-US'
    }, 'Thank you for calling. Goodbye!');
    
    res.type('text/xml');
    res.send(twiml.toString());
  } catch (error) {
    console.error('Error handling incoming call:', error);
    res.status(500).send('Error processing call');
  }
};

// Process the recorded audio
export const processRecording = async (req, res) => {
  try {
    console.log('🎵 Processing recorded audio');
    
    const { RecordingUrl, CallSid } = req.body;
    
    if (!RecordingUrl) {
      console.log('No recording URL provided');
      return sendErrorResponse(res, 'No recording found');
    }
    
    // Download the recording from Twilio
    const recordingBuffer = await downloadRecording(RecordingUrl);
    
    // Convert speech to text using Google Cloud Speech
    const transcription = await speechToText(recordingBuffer);
    
    if (!transcription) {
      console.log('No transcription available');
      return sendErrorResponse(res, 'Could not understand your message');
    }
    
    console.log('📝 Transcription:', transcription);
    
    // Get AI response from Gemini
    const aiResponse = await getAIResponse(transcription);
    
    console.log('🤖 AI Response:', aiResponse);
    
    // Convert AI response to speech
    const audioBuffer = await textToSpeech(aiResponse);
    
    // Save audio file temporarily
    const audioFileName = `response_${CallSid}_${Date.now()}.wav`;
    const audioPath = path.join(__dirname, '../uploads/temp', audioFileName);
    
    // Ensure temp directory exists
    const tempDir = path.dirname(audioPath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    fs.writeFileSync(audioPath, audioBuffer);
    
    // Create TwiML response with the AI-generated audio
    const twiml = new twilio.twiml.VoiceResponse();
    
    // Play the AI response
    twiml.play(`https://your-domain.com/api/twilio/audio/${audioFileName}`);
    
    // Ask if they want to continue
    twiml.say({
      voice: 'alice',
      language: 'en-US'
    }, 'Is there anything else I can help you with? Press any key to continue or hang up to end the call.');
    
    // Record another message
    twiml.record({
      maxLength: 30,
      action: '/api/twilio/process-recording',
      method: 'POST',
      finishOnKey: '#',
      playBeep: true
    });
    
    // Cleanup: Schedule file deletion after 5 minutes
    setTimeout(() => {
      try {
        if (fs.existsSync(audioPath)) {
          fs.unlinkSync(audioPath);
          console.log(`🗑️ Cleaned up audio file: ${audioFileName}`);
        }
      } catch (error) {
        console.error('Error cleaning up audio file:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes
    
    res.type('text/xml');
    res.send(twiml.toString());
    
  } catch (error) {
    console.error('Error processing recording:', error);
    sendErrorResponse(res, 'Sorry, I encountered an error processing your request');
  }
};

// Serve audio files
export const serveAudio = (req, res) => {
  try {
    const { filename } = req.params;
    const audioPath = path.join(__dirname, '../uploads/temp', filename);
    
    if (!fs.existsSync(audioPath)) {
      return res.status(404).send('Audio file not found');
    }
    
    res.setHeader('Content-Type', 'audio/wav');
    res.sendFile(audioPath);
  } catch (error) {
    console.error('Error serving audio:', error);
    res.status(500).send('Error serving audio file');
  }
};

// Download recording from Twilio
async function downloadRecording(recordingUrl) {
  try {
    const response = await fetch(recordingUrl);
    if (!response.ok) {
      throw new Error(`Failed to download recording: ${response.statusText}`);
    }
    return Buffer.from(await response.arrayBuffer());
  } catch (error) {
    console.error('Error downloading recording:', error);
    throw error;
  }
}

// Convert speech to text using Google Cloud Speech
async function speechToText(audioBuffer) {
  try {
    const audioBytes = audioBuffer.toString('base64');
    
    const request = {
      audio: {
        content: audioBytes,
      },
      config: {
        encoding: 'WEBM_OPUS',
        sampleRateHertz: 8000,
        languageCode: 'en-US',
        alternativeLanguageCodes: ['es-US', 'fr-FR'],
        enableAutomaticPunctuation: true,
        model: 'phone_call',
      },
    };
    
    const [response] = await speechClient.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    
    return transcription;
  } catch (error) {
    console.error('Error in speech-to-text:', error);
    return null;
  }
}

// Convert text to speech using Google Cloud Text-to-Speech
async function textToSpeech(text) {
  try {
    const request = {
      input: { text: text },
      voice: {
        languageCode: 'en-US',
        name: 'en-US-Neural2-F',
        ssmlGender: 'FEMALE',
      },
      audioConfig: {
        audioEncoding: 'LINEAR16',
        sampleRateHertz: 8000,
      },
    };
    
    const [response] = await ttsClient.synthesizeSpeech(request);
    return response.audioContent;
  } catch (error) {
    console.error('Error in text-to-speech:', error);
    throw error;
  }
}

// Get AI response from Gemini
async function getAIResponse(userMessage) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `You are a helpful AI assistant in a phone call. The caller said: "${userMessage}". 
    Please provide a helpful, concise response (maximum 2-3 sentences) that would be appropriate for a phone conversation. 
    Be friendly, professional, and helpful. If you don't understand something, politely ask for clarification.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text.trim();
  } catch (error) {
    console.error('Error getting AI response:', error);
    return "I'm sorry, I'm having trouble processing your request right now. Please try again.";
  }
}

// Send error response
function sendErrorResponse(res, message) {
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say({
    voice: 'alice',
    language: 'en-US'
  }, message);
  twiml.hangup();
  
  res.type('text/xml');
  res.send(twiml.toString());
}

// Make outbound call (optional feature)
export const makeOutboundCall = async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;
    
    if (!phoneNumber || !message) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and message are required'
      });
    }
    
    const call = await getTwilioClient().calls.create({
      twiml: `<Response><Say voice="alice" language="en-US">${message}</Say></Response>`,
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER
    });
    
    res.json({
      success: true,
      message: 'Call initiated successfully',
      callSid: call.sid
    });
  } catch (error) {
    console.error('Error making outbound call:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to make call',
      error: error.message
    });
  }
};

// Get call status
export const getCallStatus = async (req, res) => {
  try {
    const { callSid } = req.params;
    
    const call = await getTwilioClient().calls(callSid).fetch();
    
    res.json({
      success: true,
      call: {
        sid: call.sid,
        status: call.status,
        direction: call.direction,
        from: call.from,
        to: call.to,
        startTime: call.startTime,
        endTime: call.endTime,
        duration: call.duration
      }
    });
  } catch (error) {
    console.error('Error fetching call status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch call status',
      error: error.message
    });
  }
};

// Generate call to logged-in user
export const generateCallToUser = async (req, res) => {
  try {
    const { phoneNumber, userName } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Check if Twilio phone number is configured
    if (!process.env.TWILIO_PHONE_NUMBER) {
      console.error('TWILIO_PHONE_NUMBER environment variable is not set');
      return res.status(500).json({
        success: false,
        message: 'Twilio phone number not configured. Please contact administrator.'
      });
    }

    // Validate phone number format (add country code if missing)
    let formattedPhoneNumber = phoneNumber;
    if (!phoneNumber.startsWith('+')) {
      // Assume Indian number if no country code
      formattedPhoneNumber = `+91${phoneNumber}`;
    }
    
    // Create a personalized message
    const personalizedMessage = userName 
      ? `Hello ${userName}! This is an automated call from our AI assistant. Please speak after the beep, and I will help you with your questions.`
      : 'Hello! This is an automated call from our AI assistant. Please speak after the beep, and I will help you with your questions.';
    
    // Create TwiML for the call
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say({
      voice: 'alice',
      language: 'en-US'
    }, personalizedMessage);
    
    // Record the user's message
    twiml.record({
      maxLength: 30,
      action: '/api/twilio/process-recording',
      method: 'POST',
      finishOnKey: '#',
      playBeep: true
    });
    
    // Fallback message
    twiml.say({
      voice: 'alice',
      language: 'en-US'
    }, 'Thank you for calling. Goodbye!');
    
    console.log(`📞 Attempting to call ${formattedPhoneNumber} from ${process.env.TWILIO_PHONE_NUMBER}`);
    
    // Make the call
    try {
      const call = await getTwilioClient().calls.create({
        twiml: twiml.toString(),
        to: formattedPhoneNumber,
        from: process.env.TWILIO_PHONE_NUMBER
      });
    
      console.log(`📞 Generated call to user ${formattedPhoneNumber} (${userName || 'Unknown'}) - Call SID: ${call.sid}`);
      
      res.json({
        success: true,
        message: 'Call generated successfully',
        callSid: call.sid,
        phoneNumber: formattedPhoneNumber,
        userName: userName
      });
    } catch (callError) {
      console.error('Error creating Twilio call:', callError);
      console.error('Call error details:', {
        message: callError.message,
        code: callError.code,
        status: callError.status,
        moreInfo: callError.moreInfo
      });
      
      // Handle specific Twilio errors
      let errorMessage = 'Failed to create call';
      let statusCode = 500;
      
      if (callError.code === 21219) {
        errorMessage = 'Phone number is not verified. Please verify the number in your Twilio account or upgrade to a paid account.';
        statusCode = 400;
      } else if (callError.code === 21211) {
        errorMessage = 'Invalid phone number format.';
        statusCode = 400;
      } else if (callError.code === 21214) {
        errorMessage = 'Phone number is not a valid mobile number.';
        statusCode = 400;
      }
      
      res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: callError.message,
        details: {
          code: callError.code,
          status: callError.status,
          twilioError: true
        }
      });
      return;
    }
  } catch (error) {
    console.error('Error generating call to user:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to generate call';
    if (error.message.includes('from')) {
      errorMessage = 'Twilio phone number not configured properly';
    } else if (error.message.includes('to')) {
      errorMessage = 'Invalid phone number format';
    } else if (error.message.includes('credential')) {
      errorMessage = 'Twilio credentials not configured properly';
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message
    });
  }
};
