import React, { useState, useRef, useEffect } from 'react';
import { Camera, Play, Pause } from 'lucide-react';
import * as faceapi from 'face-api.js';

const SimpleFaceTest = () => {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [stream, setStream] = useState(null);
  const [logs, setLogs] = useState([]);
  const [videoReady, setVideoReady] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

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
    };
  }, []);

  const loadModels = async () => {
    try {
      addLog('🔄 Starting model loading...');
      
      // Check if faceapi is available
      if (!faceapi || !faceapi.nets) {
        addLog('❌ face-api.js not properly loaded');
        return;
      }
      
      addLog('📦 face-api.js loaded, checking available nets...');
      addLog(`Available nets: ${Object.keys(faceapi.nets).join(', ')}`);
      
      // Try to load models one by one with detailed error handling
      try {
        addLog('🔄 Loading TinyFaceDetector...');
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        addLog('✅ TinyFaceDetector loaded successfully');
      } catch (error) {
        addLog(`❌ TinyFaceDetector failed: ${error.message}`);
        throw error;
      }
      
      try {
        addLog('🔄 Loading FaceLandmark68Net...');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        addLog('✅ FaceLandmark68Net loaded successfully');
      } catch (error) {
        addLog(`❌ FaceLandmark68Net failed: ${error.message}`);
        throw error;
      }
      
      try {
        addLog('🔄 Loading FaceRecognitionNet...');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
        addLog('✅ FaceRecognitionNet loaded successfully');
      } catch (error) {
        addLog(`❌ FaceRecognitionNet failed: ${error.message}`);
        throw error;
      }
      
      setModelsLoaded(true);
      addLog('🎉 All models loaded successfully!');
      
    } catch (error) {
      addLog(`❌ Model loading failed: ${error.message}`);
      addLog(`Error stack: ${error.stack}`);
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
      addLog(`Stream tracks: ${mediaStream.getTracks().length}`);
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        videoRef.current.onloadedmetadata = () => {
          addLog(`📹 Video metadata loaded: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`);
          setVideoReady(true);
        };
        
        videoRef.current.oncanplay = () => {
          addLog('▶️ Video can play');
        };
        
        videoRef.current.onerror = (error) => {
          addLog(`❌ Video error: ${error.message}`);
        };
      }
      
      setIsActive(true);
      
    } catch (error) {
      addLog(`❌ Camera error: ${error.message}`);
      addLog(`Error name: ${error.name}`);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setIsActive(false);
    setFaceDetected(false);
    setVideoReady(false);
    addLog('🛑 Camera stopped');
  };

  const testFaceDetection = async () => {
    if (!modelsLoaded) {
      addLog('❌ Models not loaded yet');
      return;
    }
    
    if (!videoRef.current) {
      addLog('❌ Video element not available');
      return;
    }
    
    if (!videoReady) {
      addLog('❌ Video not ready yet');
      return;
    }
    
    try {
      addLog('🔍 Starting face detection...');
      addLog(`Video dimensions: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`);
      
      // Test basic face detection first
      const basicDetections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions());
      addLog(`📊 Basic detection found ${basicDetections.length} faces`);
      
      if (basicDetections.length > 0) {
        addLog('✅ Basic face detection working!');
        
        // Now test with landmarks and descriptors
        const fullDetections = await faceapi
          .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptors();
        
        addLog(`📊 Full detection found ${fullDetections.length} faces`);
        
        if (fullDetections.length > 0) {
          addLog('✅ Full face detection working!');
          setFaceDetected(true);
          
          // Draw detection box
          if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            fullDetections.forEach(detection => {
              const { x, y, width, height } = detection.detection.box;
              ctx.strokeStyle = '#00ff00';
              ctx.lineWidth = 2;
              ctx.strokeRect(x, y, width, height);
            });
          }
        } else {
          addLog('❌ Full detection failed');
          setFaceDetected(false);
        }
      } else {
        addLog('❌ No faces detected');
        setFaceDetected(false);
      }
      
    } catch (error) {
      addLog(`❌ Detection error: ${error.message}`);
      addLog(`Error stack: ${error.stack}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Simple Face Detection Test
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Video Feed */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Camera Feed</h3>
            
            <div className="relative mb-4">
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full"
                  style={{ pointerEvents: 'none' }}
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
                    onClick={testFaceDetection}
                    disabled={!videoReady}
                    className="flex items-center space-x-2 px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg"
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
                  <span className="text-gray-600">Video Ready</span>
                  <div className={`w-3 h-3 rounded-full ${videoReady ? 'bg-green-600' : 'bg-gray-300'}`} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Face Detected</span>
                  <div className={`w-3 h-3 rounded-full ${faceDetected ? 'bg-green-600' : 'bg-gray-300'}`} />
                </div>
              </div>
            </div>
            
            {/* Logs */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Debug Logs</h3>
                <button
                  onClick={clearLogs}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
                >
                  Clear
                </button>
              </div>
              
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleFaceTest;

