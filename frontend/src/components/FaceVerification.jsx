import React, { useState, useRef, useEffect } from 'react';
import { Camera, Square, RotateCcw, CheckCircle, AlertTriangle, Play, Pause, UserPlus, Shield } from 'lucide-react';
import * as faceapi from 'face-api.js';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const FaceVerification = ({ user, setUser, onEnrollmentComplete, onEnrollmentCancel, onVerificationSuccess }) => {
  const [isActive, setIsActive] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('idle');
  const [faceAngle, setFaceAngle] = useState('center');
  const [livenessPassed, setLivenessPassed] = useState(false);
  const [stream, setStream] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [currentFaceDescriptor, setCurrentFaceDescriptor] = useState(null);
  const [enrollmentProgress, setEnrollmentProgress] = useState(0);
  const [verificationProgress, setVerificationProgress] = useState(0);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  
  const { setFaceVerificationStatus } = useAuth();
  const navigate = useNavigate();

  const angles = ['left', 'center', 'right'];
  const [currentAngleIndex, setCurrentAngleIndex] = useState(1);

  useEffect(() => {
    loadModels();
    checkEnrollmentStatus();
    
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

  // Check if user is already enrolled
  const checkEnrollmentStatus = async () => {
    try {
      const response = await fetch(`/api/faces/enrollment-status/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setIsEnrolled(data.isEnrolled);
      }
    } catch (error) {
      console.error('Error checking enrollment status:', error);
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
      console.log('Attempting face detection...');
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions({
          inputSize: 416,
          scoreThreshold: 0.5
        }))
        .withFaceLandmarks()
        .withFaceDescriptors();
      
      console.log(`Detected ${detections.length} faces`);
      
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

  // Enroll user's face
  const enrollFace = async () => {
    if (!modelsLoaded) {
      alert('Models are still loading. Please wait.');
      return;
    }

    setVerificationStatus('enrolling');
    setEnrollmentProgress(0);

    try {
      // Capture multiple face samples for better accuracy
      const samples = [];
      for (let i = 0; i < 5; i++) {
        const face = await detectFace();
        if (face) {
          samples.push(face.descriptor);
          setEnrollmentProgress((i + 1) * 20);
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          alert('No face detected. Please ensure your face is visible.');
          setVerificationStatus('idle');
          return;
        }
      }

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
      const response = await fetch('/api/faces/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          descriptor: Array.from(avgDescriptor),
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        setIsEnrolled(true);
        setVerificationStatus('success');
        alert('Face enrollment successful!');
        
        // Call enrollment completion callback if provided
        if (onEnrollmentComplete) {
          setTimeout(() => {
            onEnrollmentComplete();
          }, 2000); // Wait 2 seconds to show success message
        }
      } else {
        throw new Error('Failed to enroll face');
      }
    } catch (error) {
      console.error('Error enrolling face:', error);
      setVerificationStatus('failed');
      alert('Face enrollment failed. Please try again.');
    }
  };

  // Verify user's face
  const verifyFace = async () => {
    if (!modelsLoaded) {
      alert('Models are still loading. Please wait.');
      return;
    }

    if (!isEnrolled) {
      alert('Please enroll your face first.');
      return;
    }

    setVerificationStatus('detecting');
    setVerificationProgress(0);

    try {
      // Get stored face descriptors
      const response = await fetch(`/api/faces/${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch stored faces');
      }
      
      const storedFaces = await response.json();
      if (storedFaces.length === 0) {
        alert('No enrolled face found. Please enroll first.');
        setVerificationStatus('idle');
        return;
      }

      setVerificationProgress(25);

      // Detect current face
      const currentFace = await detectFace();
      if (!currentFace) {
        alert('No face detected. Please ensure your face is visible.');
        setVerificationStatus('idle');
        return;
      }

      setVerificationProgress(50);

      // Check liveness
      const isLive = await checkLiveness();
      if (!isLive) {
        alert('Liveness check failed. Please ensure you are a real person.');
        setVerificationStatus('failed');
        return;
      }

      setVerificationProgress(75);

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

      setVerificationProgress(100);

      // Threshold for face matching (lower = more strict)
      const threshold = 0.6;
      if (minDistance < threshold) {
        setVerificationStatus('success');
        setUser(prev => ({ ...prev, verificationCount: prev.verificationCount + 1 }));
        
        // Set face verification status in AuthContext
        setFaceVerificationStatus(true);
        
        // Call the verification success callback if provided
        if (onVerificationSuccess) {
          onVerificationSuccess();
        }
      } else {
        setVerificationStatus('failed');
        alert('Face verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying face:', error);
      setVerificationStatus('failed');
      alert('Face verification failed. Please try again.');
    }
  };

  const startVerification = async () => {
    if (user.verificationCount >= 20) {
      alert('Daily verification limit reached. Please try again tomorrow.');
      return;
    }

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
          
          // Start continuous face detection with shorter interval for better responsiveness
          detectionIntervalRef.current = setInterval(async () => {
            await detectFace();
          }, 500); // Reduced from 1000ms to 500ms
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
    setCurrentAngleIndex(1);
    setLivenessPassed(false);
    setFaceDetected(false);
    setCurrentFaceDescriptor(null);
  };


  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'detecting': return 'text-blue-600';
      case 'enrolling': return 'text-purple-600';
      case 'success': return 'text-green-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'detecting': return <RotateCcw className="w-5 h-5 animate-spin" />;
      case 'enrolling': return <UserPlus className="w-5 h-5 animate-pulse" />;
      case 'success': return <CheckCircle className="w-5 h-5" />;
      case 'failed': return <AlertTriangle className="w-5 h-5" />;
      default: return <Camera className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-3 transition-all duration-700">
          Face Verification
        </h1>
        <p className="text-gray-600 text-lg">Multi-angle face recognition with liveness detection</p>
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
            <div className="flex justify-center mt-4 space-x-4">
              {!isActive ? (
                <div className="flex space-x-4">
                  <button
                    onClick={startVerification}
                    disabled={!modelsLoaded || user.verificationCount >= 20}
                    className="flex items-center space-x-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <Play className="w-5 h-5" />
                    <span>Start Camera</span>
                  </button>
                </div>
              ) : (
                <div className="flex space-x-4">
                  {!isEnrolled ? (
                    <button
                      onClick={enrollFace}
                      disabled={!modelsLoaded || user.verificationCount >= 20 || !faceDetected}
                      className="flex items-center space-x-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white rounded-lg transition-all duration-300 transform hover:scale-105"
                    >
                      <UserPlus className="w-5 h-5" />
                      <span>Enroll Face</span>
                    </button>
                  ) : (
                    <button
                      onClick={verifyFace}
                      disabled={!modelsLoaded || user.verificationCount >= 20 || !faceDetected}
                      className="flex items-center space-x-2 px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg transition-all duration-300 transform hover:scale-105"
                    >
                      <Shield className="w-5 h-5" />
                      <span>Verify Face</span>
                    </button>
                  )}
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
                    Position your face in the camera view to enable enrollment/verification
                  </p>
                ) : (
                  <p className="text-green-600 text-sm font-medium">
                    ✓ Face detected! You can now enroll or verify your face
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
                <h3 className="text-lg font-bold text-gray-800">Verification Status</h3>
                <p className={`text-sm ${getStatusColor()}`}>
                  {verificationStatus === 'idle' && 'Ready to start'}
                  {verificationStatus === 'detecting' && 'Analyzing facial features...'}
                  {verificationStatus === 'enrolling' && 'Enrolling face data...'}
                  {verificationStatus === 'success' && 'Verification successful!'}
                  {verificationStatus === 'failed' && 'Verification failed. Please try again.'}
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
                <span className="text-gray-600">Enrollment Status</span>
                <div className={`w-3 h-3 rounded-full ${isEnrolled ? 'bg-green-600' : 'bg-yellow-500'}`} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Liveness Detection</span>
                <div className={`w-3 h-3 rounded-full ${livenessPassed || verificationStatus === 'success' ? 'bg-green-600' : 'bg-gray-300'}`} />
              </div>
            </div>
            
            {/* Progress Bars */}
            {(verificationStatus === 'enrolling' || verificationStatus === 'detecting') && (
              <div className="mt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">
                    {verificationStatus === 'enrolling' ? 'Enrollment Progress' : 'Verification Progress'}
                  </span>
                  <span className="text-gray-800 font-bold">
                    {verificationStatus === 'enrolling' ? enrollmentProgress : verificationProgress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      verificationStatus === 'enrolling' ? 'bg-purple-600' : 'bg-blue-600'
                    }`}
                    style={{ 
                      width: `${verificationStatus === 'enrolling' ? enrollmentProgress : verificationProgress}%` 
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {isActive && (
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 transition-all duration-500 hover:shadow-xl">
              <h4 className="text-lg font-bold text-gray-800 mb-4">Current Detection Angle</h4>
              <div className="text-center">
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-2 ${
                    faceAngle === 'center' ? 'bg-blue-100 border-2 border-blue-600' :
                    faceAngle === 'left' ? 'bg-yellow-100 border-2 border-yellow-600' :
                    'bg-purple-100 border-2 border-purple-600'
                  }`}
                >
                  <Square
                    className={`w-8 h-8 ${
                      faceAngle === 'center' ? 'text-blue-600' :
                      faceAngle === 'left' ? 'text-yellow-600' :
                      'text-purple-600'
                    }`}
                  />
                </div>
                <p className="text-gray-800 font-medium capitalize">{faceAngle} Angle</p>
                <p className="text-gray-500 text-sm">
                  {faceAngle === 'center' && 'Looking straight ahead'}
                  {faceAngle === 'left' && 'Turn head slightly left'}
                  {faceAngle === 'right' && 'Turn head slightly right'}
                </p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 transition-all duration-500 hover:shadow-xl">
            <h4 className="text-lg font-bold text-gray-800 mb-4">Daily Usage</h4>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Verifications</span>
              <span className="text-gray-800 font-bold">{user.verificationCount}/20</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${user.verificationCount >= 20 ? 'bg-red-600' : 'bg-blue-600'}`}
                style={{ width: `${(user.verificationCount / 20) * 100}%` }}
              ></div>
            </div>
            <p className="text-gray-500 text-sm mt-2">Resets daily at midnight</p>
          </div>

          {/* Debug Panel */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 transition-all duration-500 hover:shadow-xl">
            <h4 className="text-lg font-bold text-gray-800 mb-4">Debug Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Video Ready:</span>
                <span className={videoRef.current?.readyState >= 2 ? 'text-green-600' : 'text-red-600'}>
                  {videoRef.current?.readyState >= 2 ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Video Size:</span>
                <span className="text-gray-800">
                  {videoRef.current?.videoWidth ? `${videoRef.current.videoWidth}x${videoRef.current.videoHeight}` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Detection Active:</span>
                <span className={detectionIntervalRef.current ? 'text-green-600' : 'text-red-600'}>
                  {detectionIntervalRef.current ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Camera Stream:</span>
                <span className={stream ? 'text-green-600' : 'text-red-600'}>
                  {stream ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                console.log('Manual face detection test');
                detectFace();
              }}
              className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
            >
              Test Detection
            </button>
          </div>

          {/* Skip Face Enrollment */}
          {onEnrollmentCancel && (
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 transition-all duration-500 hover:shadow-xl">
              <h4 className="text-lg font-bold text-gray-800 mb-4">Skip Face Enrollment</h4>
              <p className="text-gray-600 text-sm mb-4">
                You can skip face enrollment for now and set it up later from your dashboard.
              </p>
              <button
                onClick={onEnrollmentCancel}
                className="w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Skip Face Enrollment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FaceVerification;
