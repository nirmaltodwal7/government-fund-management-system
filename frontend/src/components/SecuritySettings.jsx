import React, { useState } from 'react';
import { Shield, Lock, Eye, AlertTriangle, Settings, Smartphone, Wifi, Database } from 'lucide-react';

const SecuritySettings = ({ user, setUser }) => {
  const [settings, setSettings] = useState({
    faceRecognition: {
      enabled: true,
      multiAngle: true,
      lowLight: true,
      antiSpoofing: true,
      confidenceThreshold: 85,
    },
    voiceVerification: {
      enabled: true,
      noiseReduction: true,
      adaptiveLearning: true,
      confidenceThreshold: 80,
    },
    livenessDetection: {
      enabled: true,
      challengeCount: 3,
      timeoutSeconds: 15,
      strictMode: false,
    },
    security: {
      dailyLimit: 20,
      sessionTimeout: 30,
      dataEncryption: true,
      auditLogging: true,
    },
    notifications: {
      failedAttempts: true,
      successfulAuth: false,
      dailyLimitReached: true,
      systemAlerts: true,
    }
  });

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const securityLevel = () => {
    const totalSettings = 15;
    const enabledSettings = [
      settings.faceRecognition.enabled,
      settings.faceRecognition.multiAngle,
      settings.faceRecognition.lowLight,
      settings.faceRecognition.antiSpoofing,
      settings.voiceVerification.enabled,
      settings.voiceVerification.noiseReduction,
      settings.voiceVerification.adaptiveLearning,
      settings.livenessDetection.enabled,
      settings.livenessDetection.strictMode,
      settings.security.dataEncryption,
      settings.security.auditLogging,
      settings.notifications.failedAttempts,
      settings.notifications.successfulAuth,
      settings.notifications.dailyLimitReached,
      settings.notifications.systemAlerts,
    ].filter(Boolean).length;

    return Math.round((enabledSettings / totalSettings) * 100);
  };

  const getSecurityLevelColor = (level) => {
    if (level >= 90) return 'text-green-500';
    if (level >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Security Settings</h1>
        <p className="text-gray-600">Configure advanced biometric security parameters</p>
      </div>

      {/* Security Level Overview */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Security Level</h3>
              <p className="text-gray-600">Current system protection status</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold ${getSecurityLevelColor(securityLevel())}`}>
              {securityLevel()}%
            </div>
            <p className={`text-sm ${getSecurityLevelColor(securityLevel())}`}>
              {securityLevel() >= 90 ? 'Maximum Security' :
               securityLevel() >= 70 ? 'High Security' : 'Basic Security'}
            </p>
          </div>
        </div>
        <div className="mt-6">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                securityLevel() >= 90 ? 'bg-green-500' :
                securityLevel() >= 70 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${securityLevel()}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Face Recognition Settings */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
          <div className="flex items-center space-x-3 mb-6">
            <Eye className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-800">Face Recognition</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-800 font-medium">Enable Face Recognition</p>
                <p className="text-gray-600 text-sm">Primary facial authentication</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.faceRecognition.enabled}
                  onChange={(e) => updateSetting('faceRecognition', 'enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-800 font-medium">Multi-Angle Recognition</p>
                <p className="text-gray-600 text-sm">Detect face from multiple angles</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.faceRecognition.multiAngle}
                  onChange={(e) => updateSetting('faceRecognition', 'multiAngle', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-800 font-medium">Low Light Enhancement</p>
                <p className="text-gray-600 text-sm">Improve recognition in poor lighting</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.faceRecognition.lowLight}
                  onChange={(e) => updateSetting('faceRecognition', 'lowLight', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-800 font-medium">Anti-Spoofing Protection</p>
                <p className="text-gray-600 text-sm">Prevent photo/video attacks</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.faceRecognition.antiSpoofing}
                  onChange={(e) => updateSetting('faceRecognition', 'antiSpoofing', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-800 font-medium">Confidence Threshold</p>
                <span className="text-blue-600 font-bold">{settings.faceRecognition.confidenceThreshold}%</span>
              </div>
              <input
                type="range"
                min="70"
                max="95"
                value={settings.faceRecognition.confidenceThreshold}
                onChange={(e) => updateSetting('faceRecognition', 'confidenceThreshold', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>Less Strict</span>
                <span>More Strict</span>
              </div>
            </div>
          </div>
        </div>

        {/* Voice Verification Settings */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
          <div className="flex items-center space-x-3 mb-6">
            <Smartphone className="w-6 h-6 text-indigo-600" />
            <h3 className="text-xl font-bold text-gray-800">Voice Verification</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-800 font-medium">Enable Voice Verification</p>
                <p className="text-gray-600 text-sm">Voice biometric authentication</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.voiceVerification.enabled}
                  onChange={(e) => updateSetting('voiceVerification', 'enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-indigo-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-800 font-medium">Noise Reduction</p>
                <p className="text-gray-600 text-sm">Filter background noise</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.voiceVerification.noiseReduction}
                  onChange={(e) => updateSetting('voiceVerification', 'noiseReduction', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-indigo-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-800 font-medium">Adaptive Learning</p>
                <p className="text-gray-600 text-sm">Improve recognition over time</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.voiceVerification.adaptiveLearning}
                  onChange={(e) => updateSetting('voiceVerification', 'adaptiveLearning', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-indigo-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-800 font-medium">Confidence Threshold</p>
                <span className="text-indigo-600 font-bold">{settings.voiceVerification.confidenceThreshold}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="95"
                value={settings.voiceVerification.confidenceThreshold}
                onChange={(e) => updateSetting('voiceVerification', 'confidenceThreshold', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>Less Strict</span>
                <span>More Strict</span>
              </div>
            </div>
          </div>
        </div>

        {/* Liveness Detection Settings */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
          <div className="flex items-center space-x-3 mb-6">
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
            <h3 className="text-xl font-bold text-gray-800">Liveness Detection</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-800 font-medium">Enable Liveness Detection</p>
                <p className="text-gray-600 text-sm">Verify live person presence</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.livenessDetection.enabled}
                  onChange={(e) => updateSetting('livenessDetection', 'enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-yellow-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-800 font-medium">Strict Mode</p>
                <p className="text-gray-600 text-sm">Enhanced spoofing protection</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.livenessDetection.strictMode}
                  onChange={(e) => updateSetting('livenessDetection', 'strictMode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-yellow-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-800 font-medium">Challenge Count</p>
                <span className="text-yellow-600 font-bold">{settings.livenessDetection.challengeCount}</span>
              </div>
              <input
                type="range"
                min="2"
                max="5"
                value={settings.livenessDetection.challengeCount}
                onChange={(e) => updateSetting('livenessDetection', 'challengeCount', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>Faster</span>
                <span>More Secure</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-800 font-medium">Timeout (seconds)</p>
                <span className="text-yellow-600 font-bold">{settings.livenessDetection.timeoutSeconds}s</span>
              </div>
              <input
                type="range"
                min="10"
                max="30"
                value={settings.livenessDetection.timeoutSeconds}
                onChange={(e) => updateSetting('livenessDetection', 'timeoutSeconds', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>Quick</span>
                <span>Patient</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Security Settings */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
          <div className="flex items-center space-x-3 mb-6">
            <Lock className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-bold text-gray-800">System Security</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-800 font-medium">Daily Verification Limit</p>
                <span className="text-green-600 font-bold">{settings.security.dailyLimit}</span>
              </div>
              <input
                type="range"
                min="3"
                max="50"
                value={settings.security.dailyLimit}
                onChange={(e) => updateSetting('security', 'dailyLimit', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>Restrictive</span>
                <span>Flexible</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-800 font-medium">Session Timeout (minutes)</p>
                <span className="text-green-600 font-bold">{settings.security.sessionTimeout}m</span>
              </div>
              <input
                type="range"
                min="15"
                max="60"
                value={settings.security.sessionTimeout}
                onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>Secure</span>
                <span>Convenient</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-800 font-medium">Data Encryption</p>
                <p className="text-gray-600 text-sm">Encrypt biometric templates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.security.dataEncryption}
                  onChange={(e) => updateSetting('security', 'dataEncryption', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-800 font-medium">Audit Logging</p>
                <p className="text-gray-600 text-sm">Log all verification attempts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.security.auditLogging}
                  onChange={(e) => updateSetting('security', 'auditLogging', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Save Settings Button */}
      <div className="mt-8 flex justify-center">
        <button className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Save All Settings</span>
        </button>
      </div>
    </div>
  );
};

export default SecuritySettings;
