import React, { useState, useRef, useEffect } from 'react';
import { Camera, Square, Play, Pause } from 'lucide-react';
import * as faceapi from 'face-api.js';

const FaceTest = () => {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [stream, setStream] = useState(null);
  const [logs, setLogs] = useState([]);
  
  const videoRef = useRef(null);
  const detectionIntervalRef = useRef(null);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

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
  }, []);

  const loadModels = async () => {
    try {
      addLog('🔄 Loading face-api.js models...');
      
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      addLog('✅ TinyFaceDetector loaded');
      
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      addLog('✅ FaceLandmark68Net loaded');
      
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
      addLog('✅ FaceRecognitionNet loaded');
      
      setModelsLoaded(true);
      addLog('🎉 All models loaded successfully!');
    } catch (error) {
      addLog(`❌ Error loading models: ${error.message}`);
    }
  };

  const startCamera = async () => {
    try {
      addLog('📷 Requesting camera access...');
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      
      addLog('✅ Camera access granted');
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        videoRef.current.onloadedmetadata = () => {
          addLog(`📹 Video ready: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`);
        };
      }
      
      setIsActive(true);
      
      // Start detection
      detectionIntervalRef.current = setInterval(detectFace, 500);
      
    } catch (error) {
      addLog(`❌ Camera error: ${error.message}`);
    }
  };

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
    addLog('🛑 Camera stopped');
  };

  const detectFace = async () => {
    if (!modelsLoaded || !videoRef.current) return;
    
    try {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();
      
      if (detections.length > 0) {
        if (!faceDetected) {
          addLog(`✅ Face detected! (${detections.length} face(s))`);
          setFaceDetected(true);
        }
      } else {
        if (faceDetected) {
          addLog('❌ Face lost');
          setFaceDetected(false);
        }
      }
    } catch (error) {
      addLog(`❌ Detection error: ${error.message}`);
    }
  };

  const testDetection = async () => {
    addLog('🔍 Manual detection test...');
    await detectFace();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Face Detection Test
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Video Feed */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Camera Feed</h3>
            
            <div className="relative mb-4">
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                {isActive && faceDetected && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="border-2 border-green-600 w-48 h-60 rounded-lg animate-pulse">
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-green-600 px-3 py-1 rounded text-white text-sm">
                        Face Detected
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              {!isActive ? (
                <button
                  onClick={startCamera}
                  disabled={!modelsLoaded}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg"
                >
                  <Play className="w-5 h-5" />
                  <span>Start Camera</span>
                </button>
              ) : (
                <div className="flex space-x-4">
                  <button
                    onClick={stopCamera}
                    className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                  >
                    <Pause className="w-5 h-5" />
                    <span>Stop Camera</span>
                  </button>
                  
                  <button
                    onClick={testDetection}
                    className="flex items-center space-x-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Test Detection</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Status & Logs */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">Status</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Models Loaded</span>
                  <div className={`w-3 h-3 rounded-full ${modelsLoaded ? 'bg-green-600' : 'bg-red-600'}`} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Camera Active</span>
                  <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-600' : 'bg-gray-300'}`} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Face Detected</span>
                  <div className={`w-3 h-3 rounded-full ${faceDetected ? 'bg-green-600' : 'bg-gray-300'}`} />
                </div>
              </div>
            </div>
            
            {/* Logs */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">Debug Logs</h3>
              
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm">
                {logs.length === 0 ? (
                  <div className="text-gray-500">No logs yet...</div>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="mb-1">
                      {log}
                    </div>
                  ))
                )}
              </div>
              
              <button
                onClick={() => setLogs([])}
                className="mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm"
              >
                Clear Logs
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceTest;
