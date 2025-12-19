import React, { useState } from 'react';

const TwilioCallBot = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('Hello! This is a test call from our AI assistant. Please speak after the beep and I will help you with your questions.');
  const [callSid, setCallSid] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [userName, setUserName] = useState('');
  const [userPhoneNumber, setUserPhoneNumber] = useState('');
  const [userCallStatus, setUserCallStatus] = useState(null);

  const makeCall = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch('/api/twilio/call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          message
        })
      });

      const data = await response.json();

      if (data.success) {
        setStatus({ type: 'success', message: `Call initiated successfully! Call SID: ${data.callSid}` });
        setCallSid(data.callSid);
      } else {
        setStatus({ type: 'error', message: data.message });
      }
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const checkCallStatus = async () => {
    if (!callSid) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/twilio/call/${callSid}`);
      const data = await response.json();

      if (data.success) {
        setStatus({ 
          type: 'info', 
          message: `Status: ${data.call.status}, Duration: ${data.call.duration || 'N/A'}s` 
        });
      } else {
        setStatus({ type: 'error', message: data.message });
      }
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const generateUserCall = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUserCallStatus(null);

    try {
      const response = await fetch('/api/twilio/generate-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: userPhoneNumber,
          userName: userName
        })
      });

      const data = await response.json();

      if (data.success) {
        setUserCallStatus({ type: 'success', message: `Call generated successfully! Call SID: ${data.callSid}` });
      } else {
        setUserCallStatus({ type: 'error', message: data.message });
      }
    } catch (error) {
      setUserCallStatus({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="twilio-call-bot">
      <div className="container mx-auto p-6 max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          🤖 Twilio Call Bot
        </h1>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">📋 Setup Required</h3>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>✅ Twilio account with phone number</li>
            <li>✅ Google Cloud Speech-to-Text API enabled</li>
            <li>✅ Google Cloud Text-to-Speech API enabled</li>
            <li>✅ Google Gemini API key</li>
            <li>✅ Environment variables configured</li>
            <li>✅ Webhook URL set in Twilio Console</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">📞 Generate Call to User</h2>
          
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <p className="text-gray-700 text-sm">
              Generate an AI-powered call to a specific user's phone number. The AI will greet them personally and help with their questions.
            </p>
          </div>

          <form onSubmit={generateUserCall} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Name:
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter user's name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number:
              </label>
              <input
                type="tel"
                value={userPhoneNumber}
                onChange={(e) => setUserPhoneNumber(e.target.value)}
                placeholder="+1234567890"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating Call...' : 'Generate Call to User'}
            </button>
          </form>

          {userCallStatus && (
            <div className={`mt-4 p-4 rounded-md ${
              userCallStatus.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
              userCallStatus.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
              'bg-blue-50 border border-blue-200 text-blue-800'
            }`}>
              <strong>{userCallStatus.type === 'success' ? '✅ Success:' : userCallStatus.type === 'error' ? '❌ Error:' : 'ℹ️ Info:'}</strong> {userCallStatus.message}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">📞 Make Outbound Call</h2>
          
          <form onSubmit={makeCall} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number:
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1234567890"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message:
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter the message to be spoken..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Making Call...' : 'Make Call'}
            </button>
          </form>

          {callSid && (
            <div className="mt-4">
              <button
                onClick={checkCallStatus}
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Checking...' : 'Check Call Status'}
              </button>
            </div>
          )}
        </div>

        {status && (
          <div className={`p-4 rounded-md ${
            status.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
            status.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
            'bg-blue-50 border border-blue-200 text-blue-800'
          }`}>
            <strong>{status.type === 'success' ? '✅ Success:' : status.type === 'error' ? '❌ Error:' : 'ℹ️ Info:'}</strong> {status.message}
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">📋 Webhook Configuration</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Webhook URL:</strong> <code className="bg-gray-200 px-2 py-1 rounded">https://your-domain.com/api/twilio/webhook/incoming</code></p>
            <p><strong>HTTP Method:</strong> POST</p>
            <p><strong>Fallback URL:</strong> <code className="bg-gray-200 px-2 py-1 rounded">https://your-domain.com/api/twilio/webhook/incoming</code></p>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">🔧 Features</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• <strong>Incoming Call Handling:</strong> Automatically answers calls and greets users</li>
            <li>• <strong>Speech-to-Text:</strong> Converts user speech to text using Google Cloud Speech</li>
            <li>• <strong>AI Responses:</strong> Generates intelligent responses using Google Gemini</li>
            <li>• <strong>Text-to-Speech:</strong> Converts AI responses back to speech</li>
            <li>• <strong>Conversation Flow:</strong> Maintains conversation context</li>
            <li>• <strong>Outbound Calls:</strong> Ability to make automated outbound calls</li>
            <li>• <strong>Call Status Tracking:</strong> Monitor call status and duration</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TwilioCallBot;
