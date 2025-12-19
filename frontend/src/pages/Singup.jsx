import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import BiometricAuth from '../components/BiometricAuth';
import FaceVerification from '../components/FaceVerification';
import { 
  Eye, 
  EyeOff, 
  Shield, 
  User, 
  Lock, 
  Mail,
  ArrowRight,
  Zap,
  CheckCircle,
  Globe,
  Database,
  MapPin,
  CreditCard,
  Phone,
  Calendar,
  UserCheck
} from 'lucide-react';

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBiometric, setShowBiometric] = useState(false);
  const [showFaceEnrollment, setShowFaceEnrollment] = useState(false);
  const [signupData, setSignupData] = useState(null);
  const [user, setUser] = useState(null);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
        address: {
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
      },
      aadharNumber: '',
      ppoNumber: '',
      phoneNumber: '',
      dateOfBirth: '',
      gender: ''
    }
  });

  const password = watch('password');

  // Debug: Check if PPO Number field is being registered
  console.log('PPO Number field registration:', register('ppoNumber'));
  console.log('Form errors:', errors);

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);

    try {
    // Remove confirmPassword from data sent to backend
      const { confirmPassword, ...dataToSend } = data;

    const result = await signup(dataToSend, 'normal');
    
    if (result.success) {
      setSignupData(dataToSend);
      setUser(result.user);
      setShowFaceEnrollment(true);
    } else {
      setError(result.message);
    }
    } catch (err) {
      setError('An error occurred during signup. Please try again.');
    } finally {
    setLoading(false);
    }
  };

  if (showFaceEnrollment && user) {
    return (
      <FaceVerification
        user={user}
        setUser={setUser}
        onEnrollmentComplete={() => navigate('/verification')}
        onEnrollmentCancel={() => navigate('/verification')}
      />
    );
  }

  if (showBiometric) {
    return (
      <BiometricAuth
        mode="enroll"
        onComplete={(result) =>
          result.success ? navigate('/verification') : setError('Face enrollment failed. Please try again.')
        }
        onCancel={() => navigate('/verification')}
        userId={signupData?.email}
        userEmail={signupData?.email}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">

        {/* Left Column - Signup Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Create Your Account
            </h2>
            <p className="text-gray-600">
              Join our secure government benefits platform
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Basic Information
              </h3>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                    {...register('name', {
                      required: 'Name is required',
                      minLength: {
                        value: 2,
                        message: 'Name must be at least 2 characters'
                      }
                    })}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email address"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
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
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    className={`block w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Create a strong password"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    className={`block w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Confirm your password"
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: value => value === password || 'Passwords do not match'
                    })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Address Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                Address Information
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Street */}
                  <div className="md:col-span-2">
                    <label htmlFor="address.street" className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    <input
                      id="address.street"
                      type="text"
                      className={`block w-full px-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 ${
                        errors.address?.street ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter street address"
                      {...register('address.street', {
                        required: 'Street address is required'
                      })}
                    />
                    {errors.address?.street && (
                      <p className="mt-1 text-sm text-red-600">{errors.address.street.message}</p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      id="address.city"
                      type="text"
                      className={`block w-full px-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 ${
                        errors.address?.city ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter city"
                      {...register('address.city', {
                        required: 'City is required'
                      })}
                    />
                    {errors.address?.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.address.city.message}</p>
                    )}
                  </div>

                  {/* State */}
                  <div>
                    <label htmlFor="address.state" className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      id="address.state"
                      type="text"
                      className={`block w-full px-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 ${
                        errors.address?.state ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter state"
                      {...register('address.state', {
                        required: 'State is required'
                      })}
                    />
                    {errors.address?.state && (
                      <p className="mt-1 text-sm text-red-600">{errors.address.state.message}</p>
                    )}
                  </div>

                  {/* Pincode */}
                  <div>
                    <label htmlFor="address.pincode" className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode
                    </label>
                    <input
                      id="address.pincode"
                      type="text"
                      maxLength="6"
                      className={`block w-full px-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 ${
                        errors.address?.pincode ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter 6-digit pincode"
                      {...register('address.pincode', {
                        required: 'Pincode is required',
                        pattern: {
                          value: /^\d{6}$/,
                          message: 'Pincode must be exactly 6 digits'
                        }
                      })}
                    />
                    {errors.address?.pincode && (
                      <p className="mt-1 text-sm text-red-600">{errors.address.pincode.message}</p>
                    )}
                  </div>

                  {/* Country */}
                  <div>
                    <label htmlFor="address.country" className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      id="address.country"
                      type="text"
                      className={`block w-full px-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 ${
                        errors.address?.country ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter country"
                      {...register('address.country', {
                        required: 'Country is required'
                      })}
                    />
                    {errors.address?.country && (
                      <p className="mt-1 text-sm text-red-600">{errors.address.country.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <UserCheck className="w-5 h-5 mr-2 text-blue-600" />
                Personal Information
              </h3>
              

              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Left Column */}
                  <div className="flex-1 space-y-4">
                    {/* Aadhar Number */}
                    <div>
                      <label htmlFor="aadharNumber" className="block text-sm font-medium text-gray-700 mb-2">
                        Aadhar Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CreditCard className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="aadharNumber"
                          type="text"
                          maxLength="12"
                          className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 ${
                            errors.aadharNumber ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Enter 12-digit Aadhar number"
                          {...register('aadharNumber', {
                            required: 'Aadhar number is required',
                            pattern: {
                              value: /^\d{12}$/,
                              message: 'Aadhar number must be exactly 12 digits'
                            }
                          })}
                        />
                      </div>
                      {errors.aadharNumber && (
                        <p className="mt-1 text-sm text-red-600">{errors.aadharNumber.message}</p>
                      )}
                    </div>

                    {/* PPO Number - SIMPLE TEST VERSION */}
                    <div style={{ backgroundColor: '#fef3c7', border: '2px solid #f59e0b', padding: '10px', margin: '10px 0', borderRadius: '8px' }}>
                      <p style={{ color: '#92400e', fontWeight: 'bold', marginBottom: '10px' }}>DEBUG: PPO Number Field Test</p>
                      
                      {/* Simple input without react-hook-form */}
                      <label htmlFor="ppoNumberTest" className="block text-sm font-medium text-gray-700 mb-2">
                        PPO Number Test (Simple Input)
                      </label>
                      <input
                        id="ppoNumberTest"
                        name="ppoNumberTest"
                        type="text"
                        maxLength="12"
                        className="block w-full px-3 py-3 border-2 border-yellow-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        placeholder="Test PPO number input"
                      />
                      
                      {/* React-hook-form version */}
                      <label htmlFor="ppoNumber" className="block text-sm font-medium text-gray-700 mb-2 mt-4">
                        PPO Number (React Hook Form)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CreditCard className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="ppoNumber"
                          name="ppoNumber"
                          type="text"
                          maxLength="12"
                          className="block w-full pl-10 pr-3 py-3 border-2 border-yellow-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors duration-300"
                          placeholder="Enter 12-digit PPO number"
                          {...register('ppoNumber', {
                            required: 'PPO number is required',
                            pattern: {
                              value: /^\d{12}$/,
                              message: 'PPO number must be exactly 12 digits'
                            }
                          })}
                        />
                      </div>
                      {errors.ppoNumber && (
                        <p className="mt-1 text-sm text-red-600 font-bold">{errors.ppoNumber.message}</p>
                      )}
                      <p className="mt-2 text-xs text-yellow-700">Both inputs should be visible in the DOM inspector</p>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="phoneNumber"
                          type="tel"
                          maxLength="10"
                          className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 ${
                            errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Enter 10-digit phone number"
                          {...register('phoneNumber', {
                            required: 'Phone number is required',
                            pattern: {
                              value: /^[6-9]\d{9}$/,
                              message: 'Phone number must be a valid 10-digit Indian mobile number'
                            }
                          })}
                        />
                      </div>
                      {errors.phoneNumber && (
                        <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="flex-1 space-y-4">
                    {/* Date of Birth */}
                    <div>
                      <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="dateOfBirth"
                          type="date"
                          className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 ${
                            errors.dateOfBirth ? 'border-red-300' : 'border-gray-300'
                          }`}
                          {...register('dateOfBirth', {
                            required: 'Date of birth is required',
                            validate: value => {
                              const today = new Date();
                              const birthDate = new Date(value);
                              const age = today.getFullYear() - birthDate.getFullYear();
                              return age >= 18 || 'You must be at least 18 years old';
                            }
                          })}
                        />
                      </div>
                      {errors.dateOfBirth && (
                        <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>
                      )}
                    </div>

                    {/* Gender */}
                    <div>
                      <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                      </label>
                      <select
                        id="gender"
                        className={`block w-full px-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 ${
                          errors.gender ? 'border-red-300' : 'border-gray-300'
                        }`}
                        {...register('gender', {
                          required: 'Gender is required'
                        })}
                      >
                        <option value="">Select your gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.gender && (
                        <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                      )}
                    </div>
                  </div>
                </div>
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Zap className="w-5 h-5 mr-2 animate-pulse" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>

            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Right Column - Information Panel */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Secure Government Benefits
            </h3>
            <p className="text-gray-600">
              Your information is protected with enterprise-grade security
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold text-gray-800">Bank-Level Security</h4>
                <p className="text-gray-600 text-sm">
                  Your data is encrypted and protected with the same security standards used by major banks.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold text-gray-800">Secure Storage</h4>
                <p className="text-gray-600 text-sm">
                  All your information is stored securely and never shared with unauthorized parties.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold text-gray-800">Verified Benefits</h4>
                <p className="text-gray-600 text-sm">
                  Access to verified government schemes and benefits with transparent tracking.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-orange-600" />
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold text-gray-800">Nationwide Access</h4>
                <p className="text-gray-600 text-sm">
                  Access benefits from any state or central government scheme across India.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-xl">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-800">
                  <strong>Quick Setup:</strong> Complete your registration in just a few minutes and start accessing benefits immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;