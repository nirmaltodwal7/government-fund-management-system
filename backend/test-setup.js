import dotenv from 'dotenv';
import twilio from 'twilio';
import { SpeechClient } from '@google-cloud/speech';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config();

console.log('🧪 Testing Twilio Call Bot Setup...\n');

// Test environment variables
console.log('1. Checking environment variables...');
const requiredVars = {
  'TWILIO_ACCOUNT_SID': process.env.TWILIO_ACCOUNT_SID,
  'TWILIO_AUTH_TOKEN': process.env.TWILIO_AUTH_TOKEN,
  'TWILIO_PHONE_NUMBER': process.env.TWILIO_PHONE_NUMBER,
  'GOOGLE_CLOUD_PROJECT_ID': process.env.GOOGLE_CLOUD_PROJECT_ID,
  'GEMINI_API_KEY': process.env.GEMINI_API_KEY
};

let allVarsPresent = true;
for (const [key, value] of Object.entries(requiredVars)) {
  if (value) {
    console.log(`   ✅ ${key}: ${value.substring(0, 10)}...`);
  } else {
    console.log(`   ❌ ${key}: Missing`);
    allVarsPresent = false;
  }
}

if (!allVarsPresent) {
  console.log('\n❌ Some environment variables are missing. Please check your .env file.');
  process.exit(1);
}

console.log('\n2. Testing Twilio connection...');
try {
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  console.log('   ✅ Twilio client initialized successfully');
} catch (error) {
  console.log(`   ❌ Twilio connection failed: ${error.message}`);
}

console.log('\n3. Testing Google Cloud Speech client...');
try {
  const speechClient = new SpeechClient({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
  });
  console.log('   ✅ Google Cloud Speech client initialized successfully');
} catch (error) {
  console.log(`   ❌ Google Cloud Speech client failed: ${error.message}`);
}

console.log('\n4. Testing Google Cloud Text-to-Speech client...');
try {
  const ttsClient = new TextToSpeechClient({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
  });
  console.log('   ✅ Google Cloud Text-to-Speech client initialized successfully');
} catch (error) {
  console.log(`   ❌ Google Cloud Text-to-Speech client failed: ${error.message}`);
}

console.log('\n5. Testing Google Gemini AI...');
try {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log('   ✅ Google Gemini AI client initialized successfully');
} catch (error) {
  console.log(`   ❌ Google Gemini AI client failed: ${error.message}`);
}

console.log('\n✅ Setup test completed!');
console.log('\n📋 Next steps:');
console.log('1. Configure your Twilio webhook URL in the Twilio Console');
console.log('2. Set webhook URL to: https://your-domain.com/api/twilio/webhook/incoming');
console.log('3. Start your server: npm run dev');
console.log('4. Test the call bot by calling your Twilio number');
console.log('5. Use the test page at: http://localhost:5000/twilio-test.html');
