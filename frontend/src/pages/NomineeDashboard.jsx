import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  User, 
  Shield, 
  Upload, 
  FileText, 
  Heart, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Eye,
  Trash2,
  Plus,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Users,
  FileImage,
  AlertCircle
} from 'lucide-react';

const NomineeDashboard = () => {
  const { user, userType } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [nomineeDetails, setNomineeDetails] = useState(null);
  const [linkedUserDetails, setLinkedUserDetails] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState({
    deathCertificate: null,
    medicalDocuments: []
  });

  // Fetch verification status
  const fetchVerificationStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/nominees/verification-status`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setVerificationStatus(response.data);
      }
    } catch (error) {
      console.error('Error fetching verification status:', error);
    }
  };

  // Fetch nominee profile data
  useEffect(() => {
    const fetchNomineeData = async () => {
      try {
        setLoading(true);
        setError('');

        // Check if user is authenticated
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please login to access the dashboard');
          return;
        }

        // Fetch both profile and verification status
        const [profileResponse, verificationResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/nominees/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }),
          axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/nominees/verification-status`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            }
          )
        ]);
        
        if (profileResponse.data.success) {
          const nominee = profileResponse.data.nominee;
          setNomineeDetails({
            name: nominee.name,
            email: nominee.email,
            aadharNumber: nominee.aadharNumber,
            phoneNumber: nominee.phoneNumber,
            relationWithUser: nominee.relationWithUser,
            registrationDate: nominee.createdAt,
            status: nominee.isActive ? 'Active' : 'Inactive',
            verificationStatus: nominee.verificationStatus
          });

          // Set linked user details from the nominee's linked user data
          if (nominee.linkedUserDetails) {
            setLinkedUserDetails({
              name: nominee.linkedUserDetails.name,
              aadharNumber: nominee.linkedUserDetails.aadharNumber,
              phoneNumber: nominee.linkedUserDetails.phoneNumber,
              email: nominee.linkedUserDetails.email,
              address: nominee.linkedUserDetails.address,
              dateOfBirth: nominee.linkedUserDetails.dateOfBirth,
              gender: nominee.linkedUserDetails.gender,
              pensionStatus: nominee.linkedUserDetails.pensionStatus,
              lastLogin: nominee.linkedUserDetails.lastLogin,
              medicalStatus: nominee.linkedUserDetails.medicalStatus,
              deathStatus: nominee.linkedUserDetails.deathStatus
            });
          }

          // Set uploaded files from nominee's documents
          if (nominee.documents && nominee.documents.length > 0) {
            const deathCert = nominee.documents.find(doc => doc.type === 'Death Certificate');
            const medicalDocs = nominee.documents.filter(doc => doc.type === 'Medical Document');
            
            // Transform documents to have consistent field names
            const transformDocument = (doc) => ({
              id: doc._id,
              name: doc.fileName,
              size: 0, // Size not stored in DB, will be 0
              type: doc.type,
              uploadDate: doc.uploadDate,
              status: doc.status
            });
            
            setUploadedFiles({
              deathCertificate: deathCert ? transformDocument(deathCert) : null,
              medicalDocuments: medicalDocs ? medicalDocs.map(transformDocument) : []
            });
          }
        }

        // Set verification status
        if (verificationResponse.data.success) {
          setVerificationStatus(verificationResponse.data);
        }
      } catch (error) {
        console.error('Error fetching nominee data:', error);
        if (error.response?.status === 401) {
          setError('Session expired. Please login again.');
          // Redirect to login after 3 seconds
          setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('userType');
            window.location.href = '/login';
          }, 3000);
        } else {
          setError(error.response?.data?.message || 'Failed to fetch nominee data');
        }
      } finally {
        setLoading(false);
      }
    };

    if (userType === 'nominee') {
      fetchNomineeData();
    }
  }, [userType]);

  const handleFileUpload = async (type, event) => {
    console.log('handleFileUpload called with:', { type, event });
    const file = event.target.files[0];
    console.log('File selected:', file);
    console.log('Upload type:', type);
    
    if (!file) {
      console.log('No file selected');
      setError('No file selected. Please choose a file to upload.');
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid file type (PDF, JPG, PNG)');
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      setError('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type === 'deathCertificate' ? 'Death Certificate' : 'Medical Document');

      // Upload file to backend
      const token = localStorage.getItem('token');
      console.log('🚀 Sending file to backend:', { type, fileName: file.name, fileSize: file.size });
      const response = await axios.post('http://localhost:5000/api/nominees/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });
      console.log('📡 Backend response:', response.data);

      if (response.data.success) {
        const uploadedDoc = response.data.document;
        
        if (type === 'deathCertificate') {
          setUploadedFiles(prev => ({
            ...prev,
            deathCertificate: {
              id: uploadedDoc._id,
              name: uploadedDoc.fileName,
              size: file.size,
              type: uploadedDoc.type,
              uploadDate: uploadedDoc.uploadDate,
              status: uploadedDoc.status
            }
          }));
          setSuccess('Death certificate uploaded successfully! Notification emails have been sent to both the administration and the linked user.');
        } else if (type === 'medicalDocuments') {
          setUploadedFiles(prev => ({
            ...prev,
            medicalDocuments: [
              ...prev.medicalDocuments,
              {
                id: uploadedDoc._id,
                name: uploadedDoc.fileName,
                size: file.size,
                type: uploadedDoc.type,
                uploadDate: uploadedDoc.uploadDate,
                status: uploadedDoc.status
              }
            ]
          }));
          setSuccess('Medical document uploaded successfully! Notification emails have been sent to both the administration and the linked user.');
        }
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (error) {
      console.error('File upload error:', error);
      console.error('Error details:', error.response?.data);
      
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('userType');
          window.location.href = '/login';
        }, 3000);
      } else if (error.response?.status === 413) {
        setError('File too large. Please select a file smaller than 10MB.');
      } else if (error.response?.status === 400) {
        setError(error.response.data.message || 'Invalid file type or format.');
      } else {
        setError(error.response?.data?.message || 'Failed to upload file. Please try again.');
      }
    } finally {
      setUploading(false);
      setUploadType('');
    }
  };

  const removeFile = async (type, fileId) => {
    // Validate inputs
    if (!type || !fileId) {
      console.error('Invalid parameters for removeFile:', { type, fileId });
      setError('Invalid file information. Please refresh the page and try again.');
      return;
    }

    // Show confirmation dialog
    const confirmDelete = window.confirm(
      `Are you sure you want to delete this ${type === 'deathCertificate' ? 'death certificate' : 'medical document'}? This action cannot be undone.`
    );
    
    if (!confirmDelete) {
      return;
    }

    setDeleting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to delete documents.');
        return;
      }

      console.log('Deleting document:', { type, fileId });
      
      // Call API to delete document
      const response = await axios.delete(`http://localhost:5000/api/nominees/documents/${fileId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        // Update local state
        if (type === 'deathCertificate') {
          setUploadedFiles(prev => ({
            ...prev,
            deathCertificate: null
          }));
        } else if (type === 'medicalDocuments') {
          setUploadedFiles(prev => ({
            ...prev,
            medicalDocuments: prev.medicalDocuments.filter(file => file.id !== fileId)
          }));
        }
        
        setSuccess('Document deleted successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.message || 'Failed to delete document.');
      }
    } catch (error) {
      console.error('Delete document error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('userType');
          window.location.href = '/login';
        }, 3000);
      } else if (error.response?.status === 404) {
        setError('Document not found. It may have already been deleted.');
        // Refresh the file list
        window.location.reload();
      } else {
        setError(error.response?.data?.message || 'Failed to delete document. Please try again.');
      }
    } finally {
      setDeleting(false);
    }
  };

  const triggerFileInput = (inputId) => {
    console.log('🎯 triggerFileInput called with:', inputId);
    const fileInput = document.getElementById(inputId);
    if (fileInput) {
      console.log('✅ File input found, triggering click for:', inputId);
      fileInput.click();
    } else {
      console.error('❌ File input not found:', inputId);
      setError(`File input not found: ${inputId}. Please refresh the page and try again.`);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      const event = { target: { files: [file] } };
      handleFileUpload(type, event);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading nominee dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show message if no data
  if (!nomineeDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Nominee Data Found</h2>
          <p className="text-gray-600">Please contact support if this issue persists.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Nominee Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your nominee account and linked user information</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                nomineeDetails.status === 'Active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                <CheckCircle className="w-4 h-4 inline mr-1" />
                {nomineeDetails.status} Nominee
              </div>
              {nomineeDetails.verificationStatus && (
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  nomineeDetails.verificationStatus === 'Verified' 
                    ? 'bg-blue-100 text-blue-800' 
                    : nomineeDetails.verificationStatus === 'Pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {nomineeDetails.verificationStatus}
                </div>
              )}
              {verificationStatus && !verificationStatus.userConfirmed && (
                <div className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Awaiting User Confirmation
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Nominee Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 p-3 rounded-full">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 ml-3">Your Details</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-gray-900 font-medium">{nomineeDetails.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{nomineeDetails.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Aadhar Number</label>
                  <p className="text-gray-900 font-mono">{nomineeDetails.aadharNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone Number</label>
                  <p className="text-gray-900">{nomineeDetails.phoneNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Relation</label>
                  <p className="text-gray-900">{nomineeDetails.relationWithUser}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Registration Date</label>
                  <p className="text-gray-900">{formatDate(nomineeDetails.registrationDate)}</p>
                </div>
              </div>
            </div>

            {/* Verification Status Section */}
            {verificationStatus && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 ml-3">Verification Status</h2>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg border-2 ${
                      verificationStatus.verificationStatus === 'Verified' 
                        ? 'border-green-200 bg-green-50' 
                        : verificationStatus.verificationStatus === 'Pending'
                        ? 'border-yellow-200 bg-yellow-50'
                        : 'border-red-200 bg-red-50'
                    }`}>
                      <div className="flex items-center">
                        {verificationStatus.verificationStatus === 'Verified' ? (
                          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        ) : verificationStatus.verificationStatus === 'Pending' ? (
                          <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                        )}
                        <span className="font-medium text-gray-900">
                          Overall Status: {verificationStatus.verificationStatus}
                        </span>
                      </div>
                    </div>

                    <div className={`p-4 rounded-lg border-2 ${
                      verificationStatus.userConfirmed 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-orange-200 bg-orange-50'
                    }`}>
                      <div className="flex items-center">
                        {verificationStatus.userConfirmed ? (
                          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        ) : (
                          <Clock className="w-5 h-5 text-orange-600 mr-2" />
                        )}
                        <span className="font-medium text-gray-900">
                          User Confirmation: {verificationStatus.userConfirmed ? 'Confirmed' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3">Verification Timeline</h3>
                    <div className="space-y-2 text-sm">
                      {verificationStatus.emailVerificationSent && (
                        <div className="flex items-center text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          <span>Verification email sent to user: {formatDate(verificationStatus.emailVerificationSentAt)}</span>
                        </div>
                      )}
                      {verificationStatus.userConfirmed && verificationStatus.userConfirmedAt && (
                        <div className="flex items-center text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          <span>User confirmed nomination: {formatDate(verificationStatus.userConfirmedAt)}</span>
                        </div>
                      )}
                      {!verificationStatus.userConfirmed && verificationStatus.emailVerificationSent && (
                        <div className="flex items-center text-orange-600">
                          <Clock className="w-4 h-4 text-orange-500 mr-2" />
                          <span>Waiting for user confirmation...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Automated Call Alert */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <div className="flex items-start">
                      <Phone className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 mb-2">📞 Automated Call Alert</h4>
                        <div className="space-y-2 text-sm text-blue-800">
                          <p><strong>Call Status:</strong> Generated successfully</p>
                          <p><strong>Call SID:</strong> CAc81069f3ee6e6898bcb1328e0550481c</p>
                          <p><strong>Recipient:</strong> +917307973865 (sahil bagga)</p>
                          <p><strong>Caller ID:</strong> +12294598201</p>
                          <p><strong>Purpose:</strong> Nominee verification call</p>
                          <p className="text-blue-700 mt-2">
                            <em>An automated verification call has been initiated to the linked user. 
                            They will receive a call to confirm your nomination status.</em>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {!verificationStatus.userConfirmed && verificationStatus.emailVerificationSent && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <AlertTriangle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900 mb-1">Verification Email Sent</h4>
                          <p className="text-sm text-blue-800">
                            A verification email has been sent to the user you're nominating for. 
                            They need to confirm your nomination before you can access their benefits information.
                          </p>
                          <p className="text-sm text-blue-800 mt-2">
                            If they haven't received the email, please ask them to check their spam folder or contact our support team.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'overview'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Users className="w-4 h-4 inline mr-2" />
                    Linked User Details
                  </button>
                  <button
                    onClick={() => setActiveTab('documents')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'documents'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <FileText className="w-4 h-4 inline mr-2" />
                    Document Upload
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="bg-green-100 p-3 rounded-full">
                        <Building2 className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-xl font-semibold text-gray-900">Linked User Information</h3>
                        <p className="text-gray-600">
                          {linkedUserDetails 
                            ? `User details linked via Aadhar: ${linkedUserDetails.aadharNumber}`
                            : 'No linked user data available'
                          }
                        </p>
                      </div>
                    </div>

                    {!linkedUserDetails ? (
                      <div className="text-center py-12">
                        <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Linked User Data</h3>
                        <p className="text-gray-600">
                          The linked user information is not available. This might be because the user 
                          has not been verified or there was an issue with the Aadhar verification.
                        </p>
                      </div>
                    ) : (

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Full Name</label>
                          <p className="text-gray-900 font-medium">{linkedUserDetails.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Aadhar Number</label>
                          <p className="text-gray-900 font-mono">{linkedUserDetails.aadharNumber}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Phone Number</label>
                          <p className="text-gray-900">{linkedUserDetails.phoneNumber}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Email</label>
                          <p className="text-gray-900">{linkedUserDetails.email}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                          <p className="text-gray-900">{formatDate(linkedUserDetails.dateOfBirth)}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Gender</label>
                          <p className="text-gray-900">{linkedUserDetails.gender}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Address</label>
                          <div className="text-gray-900">
                            {linkedUserDetails.address ? (
                              <>
                                <p>{linkedUserDetails.address.street || 'N/A'}</p>
                                <p>{linkedUserDetails.address.city || 'N/A'}, {linkedUserDetails.address.state || 'N/A'}</p>
                                <p>{linkedUserDetails.address.pincode || 'N/A'}, {linkedUserDetails.address.country || 'N/A'}</p>
                              </>
                            ) : (
                              <p>Address not available</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Pension Status</label>
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              linkedUserDetails.pensionStatus === 'Active' ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                            <span className="text-gray-900">{linkedUserDetails.pensionStatus}</span>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Last Login</label>
                          <p className="text-gray-900">{formatDate(linkedUserDetails.lastLogin)}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Medical Status</label>
                          <div className="flex items-center">
                            <Heart className={`w-4 h-4 mr-2 ${
                              linkedUserDetails.medicalStatus === 'Unknown' ? 'text-gray-400' : 'text-red-500'
                            }`} />
                            <span className="text-gray-900">{linkedUserDetails.medicalStatus}</span>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Death Status</label>
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              linkedUserDetails.deathStatus === 'Alive' ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                            <span className="text-gray-900">{linkedUserDetails.deathStatus}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    )}
                  </div>
                )}

                {activeTab === 'documents' && (
                  <div>
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">Document Upload</h3>
                          <p className="text-gray-600">Upload documents to declare user status changes</p>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center justify-between text-blue-700">
                            <div className="flex items-center">
                              <Upload className="w-5 h-5 mr-2" />
                              <span className="font-medium">Quick Upload</span>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => triggerFileInput('death-certificate')}
                                className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded-md transition-colors"
                              >
                                Death Cert
                              </button>
                              <button
                                onClick={() => triggerFileInput('medical-documents')}
                                className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-3 py-1 rounded-md transition-colors"
                              >
                                Medical Doc
                              </button>
                            </div>
                          </div>
                          <p className="text-blue-600 text-sm mt-1">Click buttons above or select document type below</p>
                        </div>
                      </div>
                    </div>

                    {/* Death Certificate Upload */}
                    <div className="mb-8">
                      <div 
                        className="bg-red-50 border border-red-200 hover:border-red-300 hover:bg-red-100 rounded-xl p-6 transition-all duration-200"
                      >
                        <div className="flex items-center mb-4">
                          <div className="bg-red-100 p-2 rounded-full">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                          </div>
                          <h4 className="text-lg font-semibold text-red-900 ml-3">Death Certificate Upload</h4>
                        </div>
                        <p className="text-red-700 mb-4">
                          Upload the death certificate to declare that the linked user has passed away. 
                          This will transfer all pension benefits to you as the nominee.
                        </p>
                        
                        {uploadedFiles.deathCertificate ? (
                          <div className="bg-white border border-red-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <FileText className="w-5 h-5 text-red-600 mr-3" />
                                <div>
                                  <p className="font-medium text-gray-900">{uploadedFiles.deathCertificate.name}</p>
                                  <p className="text-sm text-gray-500">
                                    {formatFileSize(uploadedFiles.deathCertificate.size)} • 
                                    Uploaded on {formatDate(uploadedFiles.deathCertificate.uploadDate)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button className="text-blue-600 hover:text-blue-800">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => removeFile('deathCertificate', uploadedFiles.deathCertificate.id)}
                                  disabled={deleting}
                                  className="text-red-600 hover:text-red-800 disabled:text-red-400 disabled:cursor-not-allowed"
                                  title={deleting ? 'Deleting...' : 'Delete file'}
                                >
                                  {deleting ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div 
                            className="border-2 border-dashed border-red-300 hover:border-red-400 hover:bg-red-50 rounded-lg p-6 text-center transition-all duration-200"
                            onDragOver={handleDragOver}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, 'deathCertificate')}
                          >
                            <input
                              type="file"
                              id="death-certificate"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileUpload('deathCertificate', e)}
                              className="hidden"
                            />
                            <label
                              htmlFor="death-certificate"
                              className="cursor-pointer flex flex-col items-center"
                            >
                              <div className="bg-red-100 p-4 rounded-full mb-4">
                                <Upload className="w-8 h-8 text-red-600" />
                              </div>
                              <span className="text-red-700 font-semibold text-lg mb-2">Upload Death Certificate</span>
                              <span className="text-red-600 text-sm mb-2">PDF, JPG, PNG up to 10MB</span>
                              <span className="text-red-500 text-xs mb-4">Click to browse or drag & drop files here</span>
                              <button
                                type="button"
                                disabled={uploading}
                                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 flex items-center"
                              >
                                {uploading ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Choose File
                                  </>
                                )}
                              </button>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Medical Documents Upload */}
                    <div className="mb-8">
                      <div 
                        className="bg-yellow-50 border border-yellow-200 hover:border-yellow-300 hover:bg-yellow-100 rounded-xl p-6 transition-all duration-200"
                      >
                        <div className="flex items-center mb-4">
                          <div className="bg-yellow-100 p-2 rounded-full">
                            <Heart className="w-5 h-5 text-yellow-600" />
                          </div>
                          <h4 className="text-lg font-semibold text-yellow-900 ml-3">Medical Documents Upload</h4>
                        </div>
                        <p className="text-yellow-700 mb-4">
                          Upload medical documents to declare that the linked user is not well and 
                          unable to access the portal for pension management.
                        </p>
                        
                        <div className="space-y-4">
                          {uploadedFiles.medicalDocuments.map((file) => (
                            <div key={file.id} className="bg-white border border-yellow-200 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <FileImage className="w-5 h-5 text-yellow-600 mr-3" />
                                  <div>
                                    <p className="font-medium text-gray-900">{file.name}</p>
                                    <p className="text-sm text-gray-500">
                                      {formatFileSize(file.size)} • 
                                      Uploaded on {formatDate(file.uploadDate)}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button className="text-blue-600 hover:text-blue-800">
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => removeFile('medicalDocuments', file.id)}
                                    disabled={deleting}
                                    className="text-red-600 hover:text-red-800 disabled:text-red-400 disabled:cursor-not-allowed"
                                    title={deleting ? 'Deleting...' : 'Delete file'}
                                  >
                                    {deleting ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                    ) : (
                                      <Trash2 className="w-4 h-4" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          <div 
                            className="border-2 border-dashed border-yellow-300 hover:border-yellow-400 hover:bg-yellow-50 rounded-lg p-6 text-center transition-all duration-200"
                            onDragOver={handleDragOver}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, 'medicalDocuments')}
                          >
                            <input
                              type="file"
                              id="medical-documents"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileUpload('medicalDocuments', e)}
                              className="hidden"
                            />
                            <label
                              htmlFor="medical-documents"
                              className="cursor-pointer flex flex-col items-center"
                            >
                              <div className="bg-yellow-100 p-4 rounded-full mb-4">
                                <Upload className="w-8 h-8 text-yellow-600" />
                              </div>
                              <span className="text-yellow-700 font-semibold text-lg mb-2">Upload Medical Document</span>
                              <span className="text-yellow-600 text-sm mb-2">PDF, JPG, PNG up to 10MB</span>
                              <span className="text-yellow-500 text-xs mb-4">Click to browse or drag & drop files here</span>
                              <button
                                type="button"
                                disabled={uploading}
                                className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 disabled:cursor-not-allowed text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 flex items-center"
                              >
                                {uploading ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Choose File
                                  </>
                                )}
                              </button>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Upload Status */}
                    {uploading && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                          <span className="text-blue-700">Uploading file...</span>
                        </div>
                      </div>
                    )}

                    {/* Success Message */}
                    {success && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                          <span className="text-green-700">{success}</span>
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                            <span className="text-red-700">{error}</span>
                          </div>
                          <button
                            onClick={() => setError('')}
                            className="text-red-600 hover:text-red-800 ml-4"
                          >
                            <span className="sr-only">Clear error</span>
                            ×
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NomineeDashboard;
