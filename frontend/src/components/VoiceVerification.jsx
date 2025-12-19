import React, { useState, useRef } from 'react';
import { Mic, MicOff, Volume2, AudioWaveform as Waveform, CheckCircle, AlertTriangle, Play, Square } from 'lucide-react';

const VoiceVerification = ({ user, setUser }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('idle');
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [voiceMatch, setVoiceMatch] = useState(0);

  const mediaRecorderRef = useRef(null);
  const intervalRef = useRef(null);
  const animationRef = useRef(null);

  const phrases = [
    "Please say: My voice is my password",
    "Please say: Secure access granted",
    "Please say: Voice authentication active",
    "Please say: Biometric verification enabled"
  ];

  const [currentPhrase] = useState(phrases[Math.floor(Math.random() * phrases.length)]);

  const startRecording = async () => {
    if (user.verificationCount >= 20) {
      alert('Daily verification limit reached. Please try again tomorrow.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);

      analyser.fftSize = 256;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateAudioLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        setAudioLevel(Math.min(100, (average / 255) * 100 * 2));

        if (isRecording) {
          animationRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setVerificationStatus('recording');
      setRecordingTime(0);

      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 5) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

      updateAudioLevel();

      mediaRecorder.ondataavailable = (event) => {
        console.log('Audio data:', event.data);
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        audioContext.close();
      };

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Microphone access denied. Please enable microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      setIsAnalyzing(true);
      setVerificationStatus('analyzing');

      let progress = 0;
      const analysisInterval = setInterval(() => {
        progress += Math.random() * 20;
        setVoiceMatch(Math.min(100, progress));

        if (progress >= 100) {
          clearInterval(analysisInterval);
          const success = Math.random() > 0.15;

          setTimeout(() => {
            setIsAnalyzing(false);

            if (success) {
              setVerificationStatus('success');
              setUser(prev => ({ ...prev, verificationCount: prev.verificationCount + 1 }));
            } else {
              setVerificationStatus('failed');
            }

            setTimeout(() => {
              setVerificationStatus('idle');
              setVoiceMatch(0);
              setRecordingTime(0);
              setAudioLevel(0);
            }, 3000);
          }, 1000);
        }
      }, 200);
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'recording': return 'text-red-600';
      case 'analyzing': return 'text-blue-600';
      case 'success': return 'text-green-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'recording': return <Mic className="w-5 h-5" />;
      case 'analyzing': return <Waveform className="w-5 h-5 animate-pulse" />;
      case 'success': return <CheckCircle className="w-5 h-5" />;
      case 'failed': return <AlertTriangle className="w-5 h-5" />;
      default: return <MicOff className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">Voice Verification</h1>
        <p className="text-gray-600 text-lg">Advanced voice biometric authentication</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recording Interface */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 transition-all duration-500 hover:shadow-xl">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Voice Recording</h3>

          {/* Phrase to speak */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <Volume2 className="w-5 h-5 text-blue-600" />
              <span className="text-blue-600 font-medium">Required Phrase:</span>
            </div>
            <p className="text-gray-800 text-lg font-medium">{currentPhrase}</p>
          </div>

          {/* Recording Visualization */}
          <div className="relative mb-6">
            <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              {isRecording ? (
                <div className="flex items-end space-x-1 h-20">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-gradient-to-t from-blue-500 to-indigo-500 w-3 rounded-t transition-all duration-150"
                      style={{
                        height: `${Math.random() * audioLevel + 10}%`,
                        opacity: 0.3 + (audioLevel / 100) * 0.7
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center">
                  <MicOff className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Click start to begin recording</p>
                </div>
              )}
            </div>

            {isRecording && (
              <div className="absolute top-4 right-4 bg-red-500 px-3 py-1 rounded-full">
                <span className="text-white text-sm font-bold">
                  00:{recordingTime.toString().padStart(2, '0')}
                </span>
              </div>
            )}
          </div>

          {/* Control Button */}
          <div className="flex justify-center">
            {!isRecording && !isAnalyzing ? (
              <button
                onClick={startRecording}
                disabled={user.verificationCount >= 20 || verificationStatus === 'success'}
                className="flex items-center space-x-2 px-8 py-4 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-full transition-all duration-300 transform hover:scale-105"
              >
                <Play className="w-6 h-6" />
                <span className="font-medium">Start Recording</span>
              </button>
            ) : (
              <button
                onClick={stopRecording}
                disabled={isAnalyzing}
                className="flex items-center space-x-2 px-8 py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-full transition-all duration-300"
              >
                <Square className="w-6 h-6" />
                <span className="font-medium">
                  {isRecording ? 'Stop Recording' : 'Processing...'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Analysis Results */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 transition-all duration-500 hover:shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className={getStatusColor()}>
                {getStatusIcon()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Analysis Status</h3>
                <p className={`text-sm ${getStatusColor()}`}>
                  {verificationStatus === 'idle' && 'Ready to record'}
                  {verificationStatus === 'recording' && 'Recording in progress...'}
                  {verificationStatus === 'analyzing' && 'Analyzing voice pattern...'}
                  {verificationStatus === 'success' && 'Voice verified successfully!'}
                  {verificationStatus === 'failed' && 'Voice verification failed'}
                </p>
              </div>
            </div>
          </div>

          {(isAnalyzing || verificationStatus === 'success' || verificationStatus === 'failed') && (
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 transition-all duration-500 hover:shadow-xl">
              <h4 className="text-lg font-bold text-gray-800 mb-4">Voice Match Analysis</h4>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Voice Pattern Match</span>
                    <span className="text-gray-800 font-bold">{Math.round(voiceMatch)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        voiceMatch >= 80 ? 'bg-green-600' :
                        voiceMatch >= 60 ? 'bg-yellow-500' :
                        'bg-red-600'
                      }`}
                      style={{ width: `${voiceMatch}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center">
                    <p className="text-gray-600 text-sm">Frequency Analysis</p>
                    <p className={`text-lg font-bold ${voiceMatch >= 75 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {voiceMatch >= 75 ? 'Match' : 'Partial'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600 text-sm">Speech Pattern</p>
                    <p className={`text-lg font-bold ${voiceMatch >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                      {voiceMatch >= 70 ? 'Verified' : 'Failed'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 transition-all duration-500 hover:shadow-xl">
            <h4 className="text-lg font-bold text-gray-800 mb-4">Biometric Features</h4>

            <div className="space-y-3">
              {[
                { feature: 'Vocal Frequency', status: voiceMatch > 0 ? 'detected' : 'pending' },
                { feature: 'Speech Cadence', status: voiceMatch > 25 ? 'detected' : 'pending' },
                { feature: 'Voice Texture', status: voiceMatch > 50 ? 'detected' : 'pending' },
                { feature: 'Pronunciation Pattern', status: voiceMatch > 75 ? 'detected' : 'pending' },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-600">{item.feature}</span>
                  <div className={`w-3 h-3 rounded-full ${
                    item.status === 'detected' ? 'bg-green-600' : 
                    item.status === 'processing' ? 'bg-yellow-500 animate-pulse' :
                    'bg-gray-300'
                  }`} />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 transition-all duration-500 hover:shadow-xl">
            <h4 className="text-lg font-bold text-gray-800 mb-4">Daily Usage</h4>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Verifications</span>
              <span className="text-gray-800 font-bold">{user.verificationCount}/20</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  user.verificationCount >= 20 ? 'bg-red-600' : 'bg-blue-600'
                }`}
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

export default VoiceVerification;
