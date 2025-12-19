import React, { useState, useRef, useEffect } from 'react';
import { Camera, Square, RotateCcw, CheckCircle, AlertTriangle, Play, Pause, UserPlus, Shield, ArrowLeft } from 'lucide-react';
import * as faceapi from 'face-api.js';

const BiometricAuth = ({ 
  mode = 'enroll', // 'enroll' or 'verify'
  onComplete, 
  onCancel, 
  userId,
  userEmail 
}) => {
  const [isActive, setIsActive] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('idle');
  const [stream, setStream] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [error, setError] = useState('');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectionIntervalRef = useRef(null);

  useEffect(() => {
    loadModels();
    if (userId) {
      checkEnrollmentStatus();
    }
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [userId]);

  // Check if user is already enrolled
  const checkEnrollmentStatus = async () => {
    if (!userId) return;
    
    try {
      console.log('🔍 Checking enrollment status for:', userId);
      const response = await fetch(`http://localhost:5000/api/faces/enrollment-status/${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Enrollment status:', data.isEnrolled);
        // Note: We don't set isEnrolled here since this component handles both enroll and verify modes
      } else {
        console.log('⚠️ Enrollment status check failed:', response.status);
      }
    } catch (error) {
      console.error('❌ Error checking enrollment status:', error);
      // Don't crash the app if API is unavailable
    }
  };

  // Load face-api.js models
  const loadModels = async () => {
    try {
      console.log('Loading face-api.js models...');
      console.log('Available models:', faceapi.nets);
      
      // Check if faceapi is properly loaded
      if (!faceapi || !faceapi.nets) {
        throw new Error('face-api.js not properly loaded');
      }
      
      // Load models with retry mechanism
      const loadModel = async (modelName, loadFunction) => {
        try {
          console.log(`🔄 Loading ${modelName}...`);
          await loadFunction();
          console.log(`✅ ${modelName} loaded`);
        } catch (error) {
          console.error(`❌ ${modelName} failed:`, error);
          throw error;
        }
      };
      
      await loadModel('TinyFaceDetector', () => faceapi.nets.tinyFaceDetector.loadFromUri('/models'));
      await loadModel('FaceLandmark68Net', () => faceapi.nets.faceLandmark68Net.loadFromUri('/models'));
      await loadModel('FaceRecognitionNet', () => faceapi.nets.faceRecognitionNet.loadFromUri('/models'));
      
      setModelsLoaded(true);
      console.log('✅ All models loaded successfully');
    } catch (error) {
      console.error('❌ Error loading models:', error);
      console.error('Error details:', error.message);
      setError(`Failed to load face recognition models: ${error.message}. Please refresh the page.`);
    }
  };

  // Real face detection using face-api.js
  const detectFace = async () => {
    if (!modelsLoaded) {
      console.log('❌ Models not loaded yet');
      return null;
    }
    
    if (!videoRef.current) {
      console.log('❌ Video ref not available');
      return null;
    }
    
    try {
      console.log('🔍 Attempting face detection...');
      console.log('Video element:', videoRef.current);
      console.log('Video dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
      
      // Try different detection approaches
      let detections = [];
      
      // Method 1: Try with default options
      try {
        console.log('🔍 Trying default detection...');
        detections = await faceapi
          .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptors();
        console.log(`📊 Default detection: ${detections.length} faces`);
      } catch (error) {
        console.log('❌ Default detection failed:', error.message);
      }
      
      // Method 2: Try with custom options if no faces found
      if (detections.length === 0) {
        try {
          console.log('🔍 Trying custom detection options...');
          const options = new faceapi.TinyFaceDetectorOptions({
            inputSize: 320,
            scoreThreshold: 0.3 // Lower threshold for better detection
          });
          
          detections = await faceapi
            .detectAllFaces(videoRef.current, options)
            .withFaceLandmarks()
            .withFaceDescriptors();
          console.log(`📊 Custom detection: ${detections.length} faces`);
        } catch (error) {
          console.log('❌ Custom detection failed:', error.message);
        }
      }
      
      // Method 3: Try basic detection without landmarks/descriptors
      if (detections.length === 0) {
        try {
          console.log('🔍 Trying basic detection...');
          const basicDetections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions());
          console.log(`📊 Basic detection: ${basicDetections.length} faces`);
          
          if (basicDetections.length > 0) {
            // If basic detection works, try to add landmarks and descriptors
            detections = await faceapi
              .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
              .withFaceLandmarks()
              .withFaceDescriptors();
            console.log(`📊 Enhanced detection: ${detections.length} faces`);
          }
        } catch (error) {
          console.log('❌ Basic detection failed:', error.message);
        }
      }
      
      console.log('📊 Final detection results:', detections.length, 'faces found');
      
      if (detections.length > 0) {
        setFaceDetected(true);
        console.log('✅ Face detected successfully');
        return detections[0];
      } else {
        setFaceDetected(false);
        console.log('❌ No face detected with any method');
        return null;
      }
    } catch (error) {
      console.error('❌ Error detecting face:', error);
      console.error('Error details:', error.message);
      return null;
    }
  };

  // Check liveness by analyzing face landmarks
  const checkLiveness = async () => {
    const face = await detectFace();
    if (!face || !face.landmarks) return false;
    
    try {
      const landmarks = face.landmarks;
      
      // Check for eye blinking (simple liveness check)
      const leftEye = landmarks.getLeftEye();
      const rightEye = landmarks.getRightEye();
      
      const leftEAR = calculateEAR(leftEye);
      const rightEAR = calculateEAR(rightEye);
      
      // Eyes should be open for liveness
      return leftEAR > 0.25 && rightEAR > 0.25;
    } catch (error) {
      console.error('Error checking liveness:', error);
      return false;
    }
  };

  // Calculate Eye Aspect Ratio for blink detection
  const calculateEAR = (eye) => {
    const vertical1 = Math.abs(eye[1].y - eye[5].y);
    const vertical2 = Math.abs(eye[2].y - eye[4].y);
    const horizontal = Math.abs(eye[0].x - eye[3].x);
    
    return (vertical1 + vertical2) / (2 * horizontal);
  };

  // Start camera
  const startCamera = async () => {
    if (!modelsLoaded) {
      setError('Models are still loading. Please wait.');
      return;
    }

    try {
      console.log('📷 Requesting camera access...');
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: 'user' // Front camera
        } 
      });
      
      console.log('✅ Camera access granted');
      console.log('Stream tracks:', mediaStream.getTracks());
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          console.log('📹 Video metadata loaded');
          console.log('Video dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
        };
        
        videoRef.current.oncanplay = () => {
          console.log('▶️ Video can play');
        };
      }
      
      setIsActive(true);
      
      // Start continuous face detection with shorter interval
      detectionIntervalRef.current = setInterval(async () => {
        await detectFace();
      }, 500); // Check every 500ms instead of 1000ms
      
    } catch (error) {
      console.error('❌ Error accessing camera:', error);
      console.error('Error details:', error.message);
      
      if (error.name === 'NotAllowedError') {
        setError('Camera access denied. Please enable camera permissions and refresh the page.');
      } else if (error.name === 'NotFoundError') {
        setError('No camera found. Please connect a camera and try again.');
      } else if (error.name === 'NotReadableError') {
        setError('Camera is already in use by another application. Please close other camera apps and try again.');
      } else {
        setError(`Camera error: ${error.message}. Please try again.`);
      }
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    setStream(null);
    setIsActive(false);
    setFaceDetected(false);
  };

  // Enroll user's face
  const enrollFace = async () => {
    if (!modelsLoaded) {
      setError('Models are still loading. Please wait.');
      return;
    }

    setVerificationStatus('enrolling');
    setCurrentStep('Capturing face samples...');
    setProgress(0);

    try {
      // Capture multiple face samples for better accuracy
      const samples = [];
      for (let i = 0; i < 5; i++) {
        setCurrentStep(`Capturing sample ${i + 1} of 5...`);
        const face = await detectFace();
        if (face) {
          samples.push(face.descriptor);
          setProgress((i + 1) * 20);
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          setError('No face detected. Please ensure your face is visible.');
          setVerificationStatus('idle');
          return;
        }
      }

      setCurrentStep('Processing face data...');
      
      // Calculate average descriptor
      const avgDescriptor = new Float32Array(128);
      for (let i = 0; i < 128; i++) {
        let sum = 0;
        for (const sample of samples) {
          sum += sample[i];
        }
        avgDescriptor[i] = sum / samples.length;
      }

      // Send to backend for storage
      const response = await fetch('http://localhost:5000/api/faces/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          descriptor: Array.from(avgDescriptor),
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        setVerificationStatus('success');
        setCurrentStep('Face enrollment successful!');
        setTimeout(() => {
          onComplete({ success: true, mode: 'enroll' });
        }, 2000);
      } else {
        throw new Error('Failed to enroll face');
      }
    } catch (error) {
      console.error('Error enrolling face:', error);
      setVerificationStatus('failed');
      setError('Face enrollment failed. Please try again.');
    }
  };

  // Verify user's face
  const verifyFace = async () => {
    if (!modelsLoaded) {
      setError('Models are still loading. Please wait.');
      return;
    }

    setVerificationStatus('verifying');
    setCurrentStep('Verifying face...');
    setProgress(0);

    try {
      // Get stored face descriptors
      const response = await fetch(`http://localhost:5000/api/faces/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch stored faces');
      }
      
      const storedFaces = await response.json();
      if (storedFaces.length === 0) {
        setError('No enrolled face found. Please enroll first.');
        setVerificationStatus('idle');
        return;
      }

      setProgress(25);

      // Detect current face
      const currentFace = await detectFace();
      if (!currentFace) {
        setError('No face detected. Please ensure your face is visible.');
        setVerificationStatus('idle');
        return;
      }

      setProgress(50);

      // Check liveness
      const isLive = await checkLiveness();
      if (!isLive) {
        setError('Liveness check failed. Please ensure you are a real person.');
        setVerificationStatus('failed');
        return;
      }

      setProgress(75);

      // Compare with stored faces
      let bestMatch = null;
      let minDistance = Infinity;

      for (const storedFace of storedFaces) {
        const distance = faceapi.euclideanDistance(
          currentFace.descriptor,
          new Float32Array(storedFace.descriptor)
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          bestMatch = storedFace;
        }
      }

      setProgress(100);

      // Threshold for face matching (lower = more strict)
      const threshold = 0.6;
      if (minDistance < threshold) {
        setVerificationStatus('success');
        setCurrentStep('Face verification successful!');
        setTimeout(() => {
          onComplete({ success: true, mode: 'verify', confidence: Math.max(0, (threshold - minDistance) / threshold * 100) });
        }, 2000);
      } else {
        setVerificationStatus('failed');
        setError('Face verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying face:', error);
      setVerificationStatus('failed');
      setError('Face verification failed. Please try again.');
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'verifying': return 'text-blue-600';
      case 'enrolling': return 'text-purple-600';
      case 'success': return 'text-green-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'verifying': return <RotateCcw className="w-5 h-5 animate-spin" />;
      case 'enrolling': return <UserPlus className="w-5 h-5 animate-pulse" />;
      case 'success': return <CheckCircle className="w-5 h-5" />;
      case 'failed': return <AlertTriangle className="w-5 h-5" />;
      default: return <Camera className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <button
              onClick={onCancel}
              className="mr-4 p-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            {mode === 'enroll' ? 'Face Enrollment' : 'Face Verification'}
          </h1>
          <p className="text-gray-600 text-lg">
            {mode === 'enroll' 
              ? 'Set up your biometric authentication for secure access'
              : 'Verify your identity using face recognition'
            }
          </p>
          {userEmail && (
            <p className="text-sm text-gray-500 mt-2">Account: {userEmail}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Video Feed */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
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
                {isActive && faceDetected && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="border-2 border-green-600 w-48 h-60 rounded-lg relative animate-pulse">
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-green-600 px-3 py-1 rounded text-white text-sm shadow-md">
                        Face Detected
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
              
              {/* Control Buttons */}
              <div className="flex justify-center mt-4 space-x-4">
                {!isActive ? (
                  <button
                    onClick={startCamera}
                    disabled={!modelsLoaded}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <Play className="w-5 h-5" />
                    <span>Start Camera</span>
                  </button>
                ) : (
                  <div className="flex flex-wrap justify-center gap-4">
                    <button
                      onClick={stopCamera}
                      className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105"
                    >
                      <Pause className="w-5 h-5" />
                      <span>Stop Camera</span>
                    </button>
                    
                    <button
                      onClick={detectFace}
                      disabled={!isActive}
                      className="flex items-center space-x-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white rounded-lg transition-all duration-300 transform hover:scale-105"
                    >
                      <Camera className="w-5 h-5" />
                      <span>Test Detection</span>
                    </button>
                    
                    {mode === 'enroll' ? (
                      <button
                        onClick={enrollFace}
                        disabled={!faceDetected || verificationStatus === 'enrolling'}
                        className="flex items-center space-x-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white rounded-lg transition-all duration-300 transform hover:scale-105"
                      >
                        <UserPlus className="w-5 h-5" />
                        <span>Enroll Face</span>
                      </button>
                    ) : (
                      <button
                        onClick={verifyFace}
                        disabled={!faceDetected || verificationStatus === 'verifying'}
                        className="flex items-center space-x-2 px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg transition-all duration-300 transform hover:scale-105"
                      >
                        <Shield className="w-5 h-5" />
                        <span>Verify Face</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status Panel */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className={getStatusColor()}>{getStatusIcon()}</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Status</h3>
                  <p className={`text-sm ${getStatusColor()}`}>
                    {verificationStatus === 'idle' && 'Ready to start'}
                    {verificationStatus === 'enrolling' && 'Enrolling face data...'}
                    {verificationStatus === 'verifying' && 'Verifying face...'}
                    {verificationStatus === 'success' && 'Success!'}
                    {verificationStatus === 'failed' && 'Failed. Please try again.'}
                  </p>
                </div>
              </div>
              
              {currentStep && (
                <div className="mb-4">
                  <p className="text-gray-600 text-sm">{currentStep}</p>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Models Loaded</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${modelsLoaded ? 'bg-green-600' : 'bg-red-600'}`} />
                    <span className="text-xs text-gray-500">
                      {modelsLoaded ? 'Ready' : 'Loading...'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Camera Active</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-600' : 'bg-gray-300'}`} />
                    <span className="text-xs text-gray-500">
                      {isActive ? 'Streaming' : 'Offline'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Face Detected</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${faceDetected ? 'bg-green-600' : 'bg-gray-300'}`} />
                    <span className="text-xs text-gray-500">
                      {faceDetected ? 'Found' : 'Searching...'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Detection Status</span>
                  <span className="text-xs text-gray-500">
                    {isActive && modelsLoaded ? 'Running' : 'Stopped'}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {(verificationStatus === 'enrolling' || verificationStatus === 'verifying') && (
              <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">
                    {verificationStatus === 'enrolling' ? 'Enrollment Progress' : 'Verification Progress'}
                  </span>
                  <span className="text-gray-800 font-bold">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      verificationStatus === 'enrolling' ? 'bg-purple-600' : 'bg-blue-600'
                    }`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
              <h4 className="text-lg font-bold text-blue-800 mb-3">Instructions</h4>
              <ul className="text-blue-700 text-sm space-y-2">
                <li>• Ensure good lighting on your face</li>
                <li>• Look directly at the camera</li>
                <li>• Keep your face centered in the frame</li>
                <li>• Avoid wearing sunglasses or masks</li>
                {mode === 'enroll' && <li>• Stay still during enrollment process</li>}
                {mode === 'verify' && <li>• Blink naturally for liveness detection</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiometricAuth;
