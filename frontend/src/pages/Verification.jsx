import React, { useState } from 'react';
import { 
  Shield, 
  Camera, 
  Mic, 
  Users, 
  Settings, 
  Activity,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Zap,
  Globe,
  Database,
  UserCheck,
  Fingerprint,
  Eye,
  Lock
} from 'lucide-react';
import { motion } from 'framer-motion';

const Verification = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStep, setVerificationStep] = useState(0);

  const verificationSteps = [
    {
      id: 'face',
      title: 'Face Verification',
      description: 'Advanced facial recognition technology',
      icon: Camera,
      color: 'blue'
    },
    {
      id: 'voice',
      title: 'Voice Verification',
      description: 'Voice pattern recognition',
      icon: Mic,
      color: 'green'
    },
    {
      id: 'liveness',
      title: 'Liveness Detection',
      description: 'Anti-spoofing protection',
      icon: Shield,
      color: 'purple'
    }
  ];

  const handleStartVerification = () => {
    setIsVerifying(true);
    // Simulate verification process
    setTimeout(() => {
      setVerificationStep(1);
    }, 1000);
  };

  const handleOpenBiometricSystem = () => {
    // Navigate to the biometric verification system
    window.location.href = '/verification';
  };

  const stats = [
    { number: "99.8%", label: "Accuracy Rate", icon: <Shield className="w-5 h-5" /> },
    { number: "45M+", label: "Verified Users", icon: <Users className="w-5 h-5" /> },
    { number: "24/7", label: "Available", icon: <Globe className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <Shield className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Biometric Verification System
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Secure your account with advanced biometric authentication including face recognition, 
            voice verification, and liveness detection.
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Verification Steps */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Fingerprint className="w-6 h-6 mr-3 text-blue-600" />
                Verification Methods
              </h2>

              <div className="space-y-6">
                {verificationSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                      className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                        step.color === 'blue' 
                          ? 'border-blue-200 bg-blue-50 hover:bg-blue-100' 
                          : step.color === 'green'
                          ? 'border-green-200 bg-green-50 hover:bg-green-100'
                          : 'border-purple-200 bg-purple-50 hover:bg-purple-100'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`p-3 rounded-xl mr-4 ${
                          step.color === 'blue' 
                            ? 'bg-blue-100 text-blue-600' 
                            : step.color === 'green'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-purple-100 text-purple-600'
                        }`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800">{step.title}</h3>
                          <p className="text-gray-600">{step.description}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          step.color === 'blue' 
                            ? 'bg-blue-200 text-blue-800' 
                            : step.color === 'green'
                            ? 'bg-green-200 text-green-800'
                            : 'bg-purple-200 text-purple-800'
                        }`}>
                          Available
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleOpenBiometricSystem}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:shadow-lg flex items-center justify-center"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Open Biometric Verification System
                  <ArrowRight className="w-5 h-5 ml-2" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStartVerification}
                  disabled={isVerifying}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifying ? (
                    <>
                      <Zap className="w-5 h-5 mr-2 animate-pulse" />
                      Starting Verification...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Start Quick Verification
                    </>
                  )}
                </motion.button>
              </div>

              {/* Verification Status */}
              {isVerifying && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl"
                >
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <div>
                      <h4 className="font-semibold text-green-800">Verification Initiated</h4>
                      <p className="text-green-600 text-sm">
                        Please complete the biometric verification in the new window that opened.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Info Panel */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white rounded-3xl p-8 shadow-2xl"
            >
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-4">Why Biometric Verification?</h3>
                <p className="text-blue-100 leading-relaxed">
                  Our advanced biometric system ensures maximum security and prevents fraud by using 
                  cutting-edge face recognition, voice verification, and liveness detection technology.
                </p>
              </div>

              <div className="space-y-6 mb-8">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-700 bg-opacity-50 p-2 rounded-full">
                    <Shield className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Maximum Security</h4>
                    <p className="text-blue-200 text-sm">Advanced encryption and anti-spoofing protection</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-blue-700 bg-opacity-50 p-2 rounded-full">
                    <Database className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Instant Verification</h4>
                    <p className="text-blue-200 text-sm">Quick and accurate identity verification</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-blue-700 bg-opacity-50 p-2 rounded-full">
                    <UserCheck className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Fraud Prevention</h4>
                    <p className="text-blue-200 text-sm">Prevents unauthorized access and identity theft</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-blue-700">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xl font-bold text-yellow-400">{stat.number}</div>
                    <div className="text-xs text-blue-200">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Security Features */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-6 bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
            >
              <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                <Lock className="w-5 h-5 mr-2 text-blue-600" />
                Security Features
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  End-to-end encryption
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Anti-spoofing protection
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Real-time verification
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Privacy-compliant storage
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verification;