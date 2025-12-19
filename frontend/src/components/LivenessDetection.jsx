import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, Smile, RotateCcw, CheckCircle, AlertTriangle, Play, Pause } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LivenessDetection = ({ user, setUser }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState('idle');
  const [stream, setStream] = useState(null);
  const [challengeProgress, setChallengeProgress] = useState([]);
  const [spoofingAttempts, setSpoofingAttempts] = useState(0);

  const videoRef = useRef(null);
  const navigate = useNavigate();

  const challenges = [
    { action: 'blink', instruction: 'Please blink your eyes', icon: Eye },
    { action: 'smile', instruction: 'Please smile', icon: Smile },
    { action: 'turn_left', instruction: 'Turn your head to the left', icon: RotateCcw },
    { action: 'turn_right', instruction: 'Turn your head to the right', icon: RotateCcw },
    { action: 'nod', instruction: 'Nod your head up and down', icon: RotateCcw },
  ];

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startLivenessDetection = async () => {
    if (user.verificationCount >= 20) {
      alert('Daily verification limit reached. Please try again tomorrow.');
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setIsActive(true);
      setVerificationStatus('active');
      setChallengeIndex(0);
      setChallengeProgress([]);
      setSpoofingAttempts(0);
      startChallenge(0);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Camera access denied. Please enable camera permissions.');
    }
  };

  const startChallenge = (index) => {
    if (index < challenges.length) {
      setCurrentChallenge(challenges[index].action);
      setTimeout(() => {
        const success = Math.random() > 0.1;
        setChallengeProgress(prev => [...prev, success]);
        if (success) {
          if (index === challenges.length - 1) {
            completeVerification(true);
          } else {
            setChallengeIndex(index + 1);
            setTimeout(() => startChallenge(index + 1), 1000);
          }
        } else {
          setSpoofingAttempts(prev => prev + 1);
          if (spoofingAttempts >= 2) {
            completeVerification(false);
          } else {
            setTimeout(() => startChallenge(index), 1000);
          }
        }
      }, 3000);
    }
  };

  const completeVerification = (success) => {
    setCurrentChallenge(null);
    if (success) {
      setVerificationStatus('success');
      setUser(prev => ({ ...prev, verificationCount: prev.verificationCount + 1 }));
    } else {
      setVerificationStatus('failed');
    }
    setTimeout(() => {
      stopDetection();
    }, 3000);
  };

  const stopDetection = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setIsActive(false);
    setVerificationStatus('idle');
    setCurrentChallenge(null);
    setChallengeIndex(0);
    setChallengeProgress([]);
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'active': return 'text-blue-600';
      case 'success': return 'text-green-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  // Updated for internal navigation
  const submitHandler = () => {
    navigate('/dashboard');
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'active': return <RotateCcw className="w-5 h-5 animate-spin" />;
      case 'success': return <CheckCircle className="w-5 h-5" />;
      case 'failed': return <AlertTriangle className="w-5 h-5" />;
      default: return <EyeOff className="w-5 h-5" />;
    }
  };

  const getCurrentChallengeIcon = () => {
    if (!currentChallenge) return null;
    const challenge = challenges.find(c => c.action === currentChallenge);
    return challenge ? challenge.icon : RotateCcw;
  };

  const getCurrentInstruction = () => {
    if (!currentChallenge) return '';
    const challenge = challenges.find(c => c.action === currentChallenge);
    return challenge ? challenge.instruction : '';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">Liveness Detection</h1>
        <p className="text-gray-600 text-lg">Advanced anti-spoofing verification with dynamic challenges</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Video Feed */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 transition-all duration-500 hover:shadow-xl">
          <div className="relative">
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              {isActive && currentChallenge && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center bg-white p-6 rounded-lg shadow-lg border border-blue-200 animate-fadeIn">
                    {(() => {
                      const Icon = getCurrentChallengeIcon();
                      return Icon ? <Icon className="w-12 h-12 text-blue-600 mx-auto mb-4" /> : null;
                    })()}
                    <h3 className="text-gray-800 text-xl font-bold mb-2">Liveness Challenge</h3>
                    <p className="text-blue-600 text-lg">{getCurrentInstruction()}</p>
                    <div className="mt-4 flex justify-center">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </div>
                </div>
              )}
              {isActive && !currentChallenge && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-2 border-green-600 w-48 h-60 rounded-lg relative animate-pulse">
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-green-600 px-3 py-1 rounded text-white text-sm shadow-md">
                      Liveness Detected
                    </div>
                  </div>
                </div>
              )}
              {!isActive && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <EyeOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Liveness detection inactive</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-center mt-4 space-x-4">
              {!isActive ? (
                <button
                  onClick={startLivenessDetection}
                  disabled={user.verificationCount >= 20}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  <Play className="w-5 h-5" />
                  <span>Start Liveness Detection</span>
                </button>
              ) : (
                <button
                  onClick={stopDetection}
                  className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  <Pause className="w-5 h-5" />
                  <span>Stop Detection</span>
                </button>
              )}
            </div>

            {/* Updated button handler */}
            <button 
              onClick={submitHandler}
              className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 mt-4"
            >
              <span>Main Dashboard</span>
            </button>
          </div>
        </div>

        {/* Detection Progress */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 transition-all duration-500 hover:shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className={getStatusColor()}>{getStatusIcon()}</div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Detection Status</h3>
                <p className={`text-sm ${getStatusColor()}`}>
                  {verificationStatus === 'idle' && 'Ready to start liveness detection'}
                  {verificationStatus === 'active' && 'Performing liveness challenges...'}
                  {verificationStatus === 'success' && 'Liveness verified successfully!'}
                  {verificationStatus === 'failed' && 'Liveness verification failed - possible spoofing'}
                </p>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 transition-all duration-500 hover:shadow-xl">
            <h4 className="text-lg font-bold text-gray-800 mb-4">Challenge Progress</h4>
            <div className="space-y-3">
              {challenges.map((challenge, index) => {
                const Icon = challenge.icon;
                const isCompleted = challengeProgress[index] !== undefined;
                const isSuccessful = challengeProgress[index] === true;
                const isCurrent = index === challengeIndex && isActive;
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-5 h-5 ${
                        isCompleted && isSuccessful ? 'text-green-600' :
                        isCompleted && !isSuccessful ? 'text-red-600' :
                        isCurrent ? 'text-blue-600' :
                        'text-gray-400'
                      }`} />
                      <span className={`${
                        isCompleted && isSuccessful ? 'text-green-600' :
                        isCompleted && !isSuccessful ? 'text-red-600' :
                        isCurrent ? 'text-blue-600' :
                        'text-gray-500'
                      }`}>
                        {challenge.instruction}
                      </span>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${
                      isCompleted && isSuccessful ? 'bg-green-600' :
                      isCompleted && !isSuccessful ? 'bg-red-600' :
                      isCurrent ? 'bg-blue-600 animate-pulse' :
                      'bg-gray-300'
                    }`} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Anti-Spoofing */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 transition-all duration-500 hover:shadow-xl">
            <h4 className="text-lg font-bold text-gray-800 mb-4">Anti-Spoofing Analysis</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Depth Perception</span>
                <span className={`text-sm font-bold ${isActive ? 'text-green-600' : 'text-gray-400'}`}>
                  {isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Micro-movement Detection</span>
                <span className={`text-sm font-bold ${isActive ? 'text-green-600' : 'text-gray-400'}`}>
                  {isActive ? 'Monitoring' : 'Standby'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Texture Analysis</span>
                <span className={`text-sm font-bold ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                  {isActive ? 'Processing' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Challenge Response</span>
                <span className={`text-sm font-bold ${currentChallenge ? 'text-yellow-600' : 'text-gray-400'}`}>
                  {currentChallenge ? 'Awaiting' : 'Ready'}
                </span>
              </div>
              {spoofingAttempts > 0 && (
                <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-red-600 text-sm font-bold">
                      Spoofing attempts detected: {spoofingAttempts}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Usage */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 transition-all duration-500 hover:shadow-xl">
            <h4 className="text-lg font-bold text-gray-800 mb-4">Daily Usage</h4>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Verifications</span>
              <span className="text-gray-800 font-bold">{user.verificationCount}/20</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${user.verificationCount >= 20 ? 'bg-red-600' : 'bg-green-600'}`}
                style={{ width: `${(user.verificationCount / 20) * 100}%` }}
              ></div>
            </div>
            <p className="text-gray-500 text-sm mt-2">Resets daily at midnight</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivenessDetection;
