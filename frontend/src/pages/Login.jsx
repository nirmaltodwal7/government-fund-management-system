import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FaceLogin from '../components/FaceLogin';
import { 
  Eye, 
  EyeOff, 
  Shield, 
  User, 
  Lock, 
  ArrowRight,
  Zap,
  Globe,
  Database,
  Camera
} from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFaceLogin, setShowFaceLogin] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password, 'normal');
    
    if (result.success) {
      // Navigate to verification route first - face verification required
      navigate('/verification');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };


  // Handle face login success
  const handleFaceLoginSuccess = (token, user) => {
    // Store the token and user data
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Navigate to verification route first - face verification required
    navigate('/verification');
  };

  // Handle back to password login
  const handleBackToPassword = () => {
    setShowFaceLogin(false);
  };

  const stats = [
    { number: "99.8%", label: "Security Rate", icon: <Shield className="w-5 h-5" /> },
    { number: "45M+", label: "Active Users", icon: <User className="w-5 h-5" /> },
    { number: "24/7", label: "Available", icon: <Globe className="w-5 h-5" /> }
  ];

  // Show face login if selected
  if (showFaceLogin) {
    return (
      <FaceLogin
        onLoginSuccess={handleFaceLoginSuccess}
        onBackToPassword={handleBackToPassword}
      />
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">
        {/* Left Column - Login Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Secure Login
            </h2>
            <p className="text-gray-600">
              Access your government benefits account
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Zap className="w-5 h-5 mr-2 animate-pulse" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>

            {/* Face Login Button */}
            <button
              type="button"
              onClick={() => setShowFaceLogin(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
            >
              <Camera className="w-5 h-5 mr-2" />
              Login with Face Recognition
            </button>

            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600 text-sm">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-300"
                >
                  Create new account
                </Link>
              </p>
              <p className="text-gray-600 text-sm mt-2">
                Looking for a unified experience?{' '}
                <Link
                  to="/auth"
                  className="font-medium text-green-600 hover:text-green-500 transition-colors duration-300"
                >
                  Unified Login/Register
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Right Column - Info Panel */}
        <div className="hidden md:block">
          <div className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white rounded-3xl p-8 shadow-2xl">
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-4">Government Benefits Portal</h3>
              <p className="text-blue-100 leading-relaxed">
                Secure access to all government schemes and benefits with advanced face recognition technology and fraud prevention systems.
              </p>
            </div>

            <div className="space-y-6 mb-8">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-700 bg-opacity-50 p-2 rounded-full">
                  <Shield className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h4 className="font-semibold">Advanced Security</h4>
                  <p className="text-blue-200 text-sm">Face recognition and biometric authentication</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-blue-700 bg-opacity-50 p-2 rounded-full">
                  <Database className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h4 className="font-semibold">Instant Access</h4>
                  <p className="text-blue-200 text-sm">Quick verification and benefit distribution</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-blue-700 bg-opacity-50 p-2 rounded-full">
                  <Zap className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h4 className="font-semibold">24/7 Availability</h4>
                  <p className="text-blue-200 text-sm">Access your benefits anytime, anywhere</p>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;