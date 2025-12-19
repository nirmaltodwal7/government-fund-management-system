import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const NomineeVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [nomineeDetails, setNomineeDetails] = useState(null);
  const [action, setAction] = useState('');

  const token = searchParams.get('token');
  const actionParam = searchParams.get('action');

  useEffect(() => {
    if (actionParam && ['confirm', 'reject'].includes(actionParam)) {
      setAction(actionParam);
      handleVerification(actionParam);
    }
  }, [actionParam]);

  const handleVerification = async (verificationAction) => {
    if (!token) {
      setError('Invalid verification link. Token is missing.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/nominees/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          action: verificationAction
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setNomineeDetails(data.nominee);
        
        // Redirect after 3 seconds
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('An error occurred while processing the verification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualAction = (verificationAction) => {
    handleVerification(verificationAction);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Processing Verification...
            </h2>
            <p className="text-gray-500">
              Please wait while we process your {action} request.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Nominee Verification
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Verify or reject nominee registration request
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          {message && (
            <div className={`mb-4 p-4 rounded-md ${
              action === 'confirm' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {action === 'confirm' ? (
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${
                    action === 'confirm' ? 'text-green-800' : 'text-yellow-800'
                  }`}>
                    {action === 'confirm' ? 'Success' : 'Nominee Rejected'}
                  </h3>
                  <div className={`mt-2 text-sm ${
                    action === 'confirm' ? 'text-green-700' : 'text-yellow-700'
                  }`}>
                    {message}
                  </div>
                </div>
              </div>
            </div>
          )}

          {nomineeDetails && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                Nominee Details:
              </h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>Name:</strong> {nomineeDetails.name}</p>
                <p><strong>Email:</strong> {nomineeDetails.email}</p>
                <p><strong>Relation:</strong> {nomineeDetails.relationWithUser}</p>
                <p><strong>Status:</strong> {nomineeDetails.verificationStatus}</p>
              </div>
            </div>
          )}

          {!actionParam && !loading && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nominee Verification Required
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Please confirm or reject the nominee registration request.
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => handleManualAction('confirm')}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ✅ Confirm Nominee
                </button>
                <button
                  onClick={() => handleManualAction('reject')}
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ❌ Reject Nominee
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              You will be redirected to the home page in a few seconds.
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-2 text-blue-600 hover:text-blue-500 text-sm font-medium"
            >
              Go to Home Page
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Important Information
          </h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start">
              <span className="flex-shrink-0 h-1.5 w-1.5 bg-blue-400 rounded-full mt-2 mr-2"></span>
              By confirming, you authorize this person to access your pension benefits in case of your demise.
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 h-1.5 w-1.5 bg-blue-400 rounded-full mt-2 mr-2"></span>
              If you don't recognize this person, please reject the request immediately.
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 h-1.5 w-1.5 bg-blue-400 rounded-full mt-2 mr-2"></span>
              You can contact our support team if you have any concerns.
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 h-1.5 w-1.5 bg-blue-400 rounded-full mt-2 mr-2"></span>
              This verification link is valid for 7 days.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NomineeVerification;
