import React from 'react';
import { Calendar, Clock, TrendingUp, Shield, Eye, Mic, Camera } from 'lucide-react';

const UsageTracking = ({ user }) => {
  // Mock data for demonstration
  const weeklyData = [
    { day: 'Monday', count: 3 },
    { day: 'Tuesday', count: 5 },
    { day: 'Wednesday', count: 2 },
    { day: 'Thursday', count: 4 },
    { day: 'Friday', count: 5 },
    { day: 'Saturday', count: 1 },
    { day: 'Sunday', count: user.verificationCount },
  ];

  const verificationTypes = [
    { type: 'Face Recognition', count: 12, percentage: 45, color: 'bg-blue-500' },
    { type: 'Voice Verification', count: 8, percentage: 30, color: 'bg-purple-500' },
    { type: 'Liveness Detection', count: 7, percentage: 25, color: 'bg-green-500' },
  ];

  const recentSessions = [
    {
      timestamp: '2024-01-15 14:30:22',
      type: 'Face + Voice',
      status: 'Success',
      duration: '12.3s',
      confidence: '94%'
    },
    {
      timestamp: '2024-01-15 09:15:45',
      type: 'Liveness Check',
      status: 'Success',
      duration: '8.7s',
      confidence: '97%'
    },
    {
      timestamp: '2024-01-14 16:42:10',
      type: 'Face Recognition',
      status: 'Success',
      duration: '5.2s',
      confidence: '92%'
    },
    {
      timestamp: '2024-01-14 11:28:33',
      type: 'Voice Verification',
      status: 'Failed',
      duration: '15.8s',
      confidence: '67%'
    },
    {
      timestamp: '2024-01-13 13:55:17',
      type: 'Multi-angle Face',
      status: 'Success',
      duration: '18.4s',
      confidence: '89%'
    },
  ];

  const timeUntilReset = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">Usage Tracking</h1>
        <p className="text-gray-600 text-lg">Monitor your verification patterns and system usage</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Today's Usage</p>
              <p className="text-3xl font-bold text-blue-600">{user.verificationCount}/20</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${(user.verificationCount / 20) * 100}%` }}
              ></div>
            </div>
            <p className="text-gray-500 text-xs mt-2">Resets in {timeUntilReset()}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Weekly Total</p>
              <p className="text-3xl font-bold text-green-600">27</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-green-600 text-sm mt-2">↑ 12% vs last week</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Success Rate</p>
              <p className="text-3xl font-bold text-purple-600">94%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-purple-600 text-sm mt-2">Excellent performance</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Avg Duration</p>
              <p className="text-3xl font-bold text-yellow-600">8.7s</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-yellow-600 text-sm mt-2">Fast verification</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Weekly Usage Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Weekly Usage Pattern</h3>
          <div className="space-y-4">
            {weeklyData.map((day, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-600 w-20">{day.day}</span>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${(day.count / 20) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-gray-800 font-bold w-8 text-right">{day.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Type Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Verification Types</h3>
          <div className="space-y-4">
            {verificationTypes.map((type, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">{type.type}</span>
                  <span className="text-gray-800 font-bold">{type.count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 ${type.color} rounded-full transition-all duration-500`}
                    style={{ width: `${type.percentage}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{type.percentage}% of total</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Recent Verification Sessions</h3>
          <div className="flex items-center space-x-2 text-gray-500">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Last 7 days</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-gray-500 font-medium py-3 px-4">Timestamp</th>
                <th className="text-left text-gray-500 font-medium py-3 px-4">Type</th>
                <th className="text-left text-gray-500 font-medium py-3 px-4">Status</th>
                <th className="text-left text-gray-500 font-medium py-3 px-4">Duration</th>
                <th className="text-left text-gray-500 font-medium py-3 px-4">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {recentSessions.map((session, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="text-gray-800 text-sm">
                      {new Date(session.timestamp).toLocaleDateString()}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {new Date(session.timestamp).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {session.type.includes('Face') && <Camera className="w-4 h-4 text-blue-600" />}
                      {session.type.includes('Voice') && <Mic className="w-4 h-4 text-purple-600" />}
                      {session.type.includes('Liveness') && <Eye className="w-4 h-4 text-green-600" />}
                      <span className="text-gray-800 text-sm">{session.type}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      session.status === 'Success' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {session.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-800 text-sm">{session.duration}</td>
                  <td className="py-3 px-4">
                    <div className={`text-sm font-bold ${
                      parseInt(session.confidence) >= 90 ? 'text-green-600' :
                      parseInt(session.confidence) >= 75 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {session.confidence}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsageTracking;
