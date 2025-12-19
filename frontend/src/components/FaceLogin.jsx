import React, { useState, useRef, useEffect } from 'react';
import { Camera, Square, RotateCcw, CheckCircle, AlertTriangle, Play, Pause, Shield } from 'lucide-react';
import * as faceapi from 'face-api.js';

const FaceLogin = ({ onLoginSuccess, onBackToPassword }) => {
  const [isActive, setIsActive] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('idle');
  const [stream, setStream] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [userId, setUserId] = useState('');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectionIntervalRef = useRef(null);

  useEffect(() => {
    loadModels();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [stream]);

  // Load face-api.js models
  const loadModels = async () => {
    try {
      console.log('Loading face-api.js models...');
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
      setModelsLoaded(true);
      console.log('Models loaded successfully');
    } catch (error) {
      console.error('Error loading models:', error);
      alert('Failed to load face recognition models. Please refresh the page.');
    }
  };

  // Real face detection using face-api.js
  const detectFace = async () => {
    if (!modelsLoaded || !videoRef.current) return null;
    
    // Check if video is ready
    if (videoRef.current.readyState < 2) {
      console.log('Video not ready yet');
      return null;
    }
    
    try {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions({
          inputSize: 416,
          scoreThreshold: 0.5
        }))
        .withFaceLandmarks()
        .withFaceDescriptors();
      
      if (detections.length > 0) {
        setFaceDetected(true);
        // Draw detection box on canvas
        drawDetections(detections);
        return detections[0];
      } else {
        setFaceDetected(false);
        // Clear canvas
        clearCanvas();
        return null;
      }
    } catch (error) {
      console.error('Error detecting face:', error);
      setFaceDetected(false);
      return null;
    }
  };

  // Draw face detection boxes on canvas
  const drawDetections = (detections) => {
    if (!canvasRef.current || !videoRef.current) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    detections.forEach(detection => {
      const { x, y, width, height } = detection.detection.box;
      
      // Draw bounding box
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
      
      // Draw landmarks
      if (detection.landmarks) {
        ctx.fillStyle = '#ff0000';
        detection.landmarks.positions.forEach(point => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
          ctx.fill();
        });
      }
    });
  };

  // Clear canvas
  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Verify face for login
  const verifyFaceForLogin = async () => {
    if (!modelsLoaded) {
      alert('Models are still loading. Please wait.');
      return;
    }

    if (!userId.trim()) {
      alert('Please enter your User ID first.');
      return;
    }

    setVerificationStatus('detecting');
    setVerificationProgress(0);

    try {
      setVerificationProgress(25);

      // Detect current face
      const currentFace = await detectFace();
      if (!currentFace) {
        alert('No face detected. Please ensure your face is visible.');
        setVerificationStatus('idle');
        return;
      }

      setVerificationProgress(50);

      // Send face descriptor for login verification
      const response = await fetch('/api/faces/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId.trim(),
          descriptor: Array.from(currentFace.descriptor)
        })
      });

      setVerificationProgress(75);

      const data = await response.json();

      setVerificationProgress(100);

      if (data.success && data.isMatch) {
        setVerificationStatus('success');
        alert('Face verification successful! Logging you in...');
        
        // Call the success callback with user data and token
        onLoginSuccess(data.token, data.user);
      } else {
        setVerificationStatus('failed');
        alert(data.message || 'Face verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying face for login:', error);
      setVerificationStatus('failed');
      alert('Face verification failed. Please try again.');
    }
  };

  const startVerification = async () => {
    if (!modelsLoaded) {
      alert('Face recognition models are still loading. Please wait.');
      return;
    }

    try {
      console.log('Requesting camera access...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      
      console.log('Camera access granted');
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded');
          setIsActive(true);
          
          // Start continuous face detection
          detectionIntervalRef.current = setInterval(async () => {
            await detectFace();
          }, 500);
        };
      }
      
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Camera access denied. Please enable camera permissions and refresh the page.');
    }
  };

  const stopVerification = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    
    // Clear canvas
    clearCanvas();
    
    setStream(null);
    setIsActive(false);
    setVerificationStatus('idle');
    setFaceDetected(false);
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'detecting': return 'text-blue-600';
      case 'success': return 'text-green-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'detecting': return <RotateCcw className="w-5 h-5 animate-spin" />;
      case 'success': return <CheckCircle className="w-5 h-5" />;
      case 'failed': return <AlertTriangle className="w-5 h-5" />;
      default: return <Camera className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-3 transition-all duration-700">
          Face Login
        </h1>
        <p className="text-gray-600 text-lg">Secure face-based authentication</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Video Feed */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 transition-all duration-500 hover:shadow-xl">
          <div className="relative">
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }} />
              {isActive && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`border-2 w-48 h-60 rounded-lg relative ${faceDetected ? 'border-green-600 animate-pulse' : 'border-blue-600 animate-pulse'}`}>
                    <div className={`absolute -top-6 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded text-white text-sm shadow-md ${faceDetected ? 'bg-green-600' : 'bg-blue-600'}`}>
                      {faceDetected ? 'Face Detected ✓' : 'Looking for face...'}
                    </div>
                  </div>
                </div>
              )}
              {!isActive && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Camera feed will appear here</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* User ID Input */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User ID
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter your User ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isActive}
              />
            </div>
            
            <div className="flex justify-center mt-4 space-x-4">
              {!isActive ? (
                <div className="flex space-x-4">
                  <button
                    onClick={startVerification}
                    disabled={!modelsLoaded}
                    className="flex items-center space-x-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <Play className="w-5 h-5" />
                    <span>Start Camera</span>
                  </button>
                </div>
              ) : (
                <div className="flex space-x-4">
                  <button
                    onClick={verifyFaceForLogin}
                    disabled={!modelsLoaded || !faceDetected || !userId.trim()}
                    className="flex items-center space-x-2 px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <Shield className="w-5 h-5" />
                    <span>Login with Face</span>
                  </button>
                  <button
                    onClick={stopVerification}
                    className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <Pause className="w-5 h-5" />
                    <span>Stop Camera</span>
                  </button>
                </div>
              )}
            </div>
            
            {/* Status Message */}
            {isActive && (
              <div className="mt-4 text-center">
                {!faceDetected ? (
                  <p className="text-blue-600 text-sm">
                    Position your face in the camera view to enable login
                  </p>
                ) : (
                  <p className="text-green-600 text-sm font-medium">
                    ✓ Face detected! You can now login with your face
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Verification Progress */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 transition-all duration-500 hover:shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className={getStatusColor()}>{getStatusIcon()}</div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Login Status</h3>
                <p className={`text-sm ${getStatusColor()}`}>
                  {verificationStatus === 'idle' && 'Ready to start'}
                  {verificationStatus === 'detecting' && 'Verifying your face...'}
                  {verificationStatus === 'success' && 'Login successful!'}
                  {verificationStatus === 'failed' && 'Login failed. Please try again.'}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Models Loaded</span>
                <div className={`w-3 h-3 rounded-full ${modelsLoaded ? 'bg-green-600' : 'bg-red-600'}`} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Face Detected</span>
                <div className={`w-3 h-3 rounded-full ${faceDetected ? 'bg-green-600' : 'bg-gray-300'}`} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">User ID Entered</span>
                <div className={`w-3 h-3 rounded-full ${userId.trim() ? 'bg-green-600' : 'bg-gray-300'}`} />
              </div>
            </div>
            
            {/* Progress Bar */}
            {verificationStatus === 'detecting' && (
              <div className="mt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Verification Progress</span>
                  <span className="text-gray-800 font-bold">{verificationProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300 bg-blue-600"
                    style={{ width: `${verificationProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Back to Password Login */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 transition-all duration-500 hover:shadow-xl">
            <h4 className="text-lg font-bold text-gray-800 mb-4">Alternative Login</h4>
            <p className="text-gray-600 text-sm mb-4">
              Having trouble with face recognition? Use traditional password login instead.
            </p>
            <button
              onClick={onBackToPassword}
              className="w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Back to Password Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceLogin;
