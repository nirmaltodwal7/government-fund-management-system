import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  CheckCircle, 
  Eye, 
  Database, 
  CreditCard, 
  ArrowRight, 
  FileCheck, 
  Lock, 
  Award,
  ChevronLeft,
  ChevronRight,
  Zap,
  Globe,
  UserCheck
} from 'lucide-react';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const navigate = useNavigate();

  const schemes = [
    {
      title: "Pradhan Mantri Pension Yojana",
      description: "Guaranteed pension for senior citizens with face recognition security",
      image: "../../public/p1.jpg",
      beneficiaries: "2.3M+"
    },
    {
      title: "Direct Benefit Transfer (DBT)",
      description: "Seamless subsidy transfers with advanced fraud prevention",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=300&fit=crop",
      beneficiaries: "15M+"
    },
    {
      title: "Rural Employment Guarantee",
      description: "Employment benefits with biometric authentication",
      image: "https://www.shutterstock.com/image-photo/deposit-protection-bank-insurance-financial-260nw-2317213089.jpg ",
      beneficiaries: "8.7M+"
    }
  ];

  const securityFeatures = [
    {
      icon: <Eye className="w-8 h-8" />,
      title: "Face Recognition Security",
      description: "Mandatory facial authentication before any fund transfer to ensure rightful beneficiaries receive payments"
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: "Death Registry Integration",
      description: "Real-time connection with death registration databases prevents payments to deceased beneficiaries"
    },
    {
      icon: <UserCheck className="w-8 h-8" />,
      title: "Aadhaar Authentication",
      description: "Seamless integration with Aadhaar system for foolproof identity verification and validation"
    },
    {
      icon: <FileCheck className="w-8 h-8" />,
      title: "Digital Life Certification",
      description: "Periodic digital verification to confirm beneficiary status and prevent fraudulent claims"
    }
  ];

  const stats = [
    { number: "₹2.8L Cr", label: "Total Benefits Distributed", icon: <CreditCard className="w-6 h-6" /> },
    { number: "45M+", label: "Active Beneficiaries", icon: <Users className="w-6 h-6" /> },
    { number: "99.8%", label: "Fraud Prevention Rate", icon: <Shield className="w-6 h-6" /> },
    { number: "24/7", label: "System Availability", icon: <Globe className="w-6 h-6" /> }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % schemes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(prev => ({
            ...prev,
            [entry.target.dataset.section]: true
          }));
        }
      });
    }, observerOptions);

    document.querySelectorAll('[data-section]').forEach(el => observer.observe(el));
    
    return () => observer.disconnect();
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % schemes.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + schemes.length) % schemes.length);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center bg-blue-700 bg-opacity-50 rounded-full px-4 py-2 text-sm font-medium">
                <Shield className="w-4 h-4 mr-2" />
                Secured by Advanced Biometric Technology
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Direct Government
                <span className="block text-yellow-400">Benefits Platform</span>
              </h1>
              
              <p className="text-xl text-blue-100 leading-relaxed">
                Experience transparent, secure, and efficient distribution of government funds with cutting-edge face recognition technology and fraud prevention systems.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                >
                  Access Your Benefits
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
                <button 
                  onClick={() => navigate('/about')}
                  className="border-2 border-white hover:bg-white hover:text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300"
                >
                  Learn More
                </button>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl p-8 border border-white border-opacity-20">
                <img 
                  src="../../public/WhatsApp Image 2025-09-08 at 18.41.47_bc1ed8bb.jpg" 
                  alt="Government Digital Services" 
                  className="w-full h-80 object-cover rounded-2xl shadow-2xl"
                />
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">99.8%</div>
                    <div className="text-sm text-blue-100">Security Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">24/7</div>
                    <div className="text-sm text-blue-100">Available</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white" data-section="stats">
        <div className="max-w-7xl mx-auto px-6">
          <div className={`grid grid-cols-2 lg:grid-cols-4 gap-8 transition-all duration-1000 ${isVisible.stats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {stats.map((stat, index) => (
              <div key={index} className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Features Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white" data-section="security">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-red-100 text-red-800 rounded-full px-4 py-2 text-sm font-medium mb-4">
              <Lock className="w-4 h-4 mr-2" />
              Advanced Security Protocol
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              Revolutionary Security Mechanisms
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform employs cutting-edge technology to ensure every rupee reaches the rightful beneficiary while preventing fraud and misuse of government funds.
            </p>
          </div>

          <div className={`grid lg:grid-cols-2 xl:grid-cols-4 gap-8 transition-all duration-1000 delay-300 ${isVisible.security ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {securityFeatures.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                <div className="text-blue-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-8 border border-red-100">
            <div className="flex items-start space-x-4">
              <div className="bg-red-100 p-3 rounded-full">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Zero Tolerance for Fraud</h3>
                <p className="text-gray-700 text-lg leading-relaxed mb-4">
                  Our integrated system automatically detects and prevents fund transfers to deceased beneficiaries by cross-referencing death registration databases, conducting periodic life certifications, and requiring mandatory face recognition for every transaction.
                </p>
                <div className="flex items-center text-red-600 font-semibold">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  99.8% fraud prevention rate achieved
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Schemes Carousel */}
      <section className="py-20 bg-blue-900" data-section="schemes">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">Government Schemes & Programs</h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Explore various government initiatives designed to support citizens with financial assistance and social security benefits.
            </p>
          </div>

          <div className={`relative transition-all duration-1000 delay-300 ${isVisible.schemes ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="grid lg:grid-cols-2">
                <div className="relative h-80 lg:h-auto">
                  <img 
                    src={schemes[currentSlide].image}
                    alt={schemes[currentSlide].title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-yellow-500 text-blue-900 px-3 py-1 rounded-full text-sm font-semibold">
                    {schemes[currentSlide].beneficiaries} Beneficiaries
                  </div>
                </div>
                
                <div className="p-12 flex flex-col justify-center">
                  <div className="mb-6">
                    <Award className="w-12 h-12 text-blue-600 mb-4" />
                    <h3 className="text-3xl font-bold text-gray-800 mb-4">
                      {schemes[currentSlide].title}
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed mb-6">
                      {schemes[currentSlide].description}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => navigate('/about')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300 flex items-center"
                    >
                      Learn More
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </button>
                    
                    <div className="flex space-x-2">
                      {schemes.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSlide(index)}
                          className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                            index === currentSlide ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-100 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-100 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
            >
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </section>

      {/* Trust & Transparency Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50" data-section="trust">
        <div className="max-w-7xl mx-auto px-6">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible.trust ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-4xl font-bold text-gray-800 mb-6">Built on Trust & Transparency</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our commitment to transparent governance ensures every citizen receives their rightful benefits through secure, efficient, and accountable systems.
            </p>
          </div>

          <div className={`grid lg:grid-cols-3 gap-8 transition-all duration-1000 delay-300 ${isVisible.trust ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="text-center group">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-600 group-hover:scale-110 transition-all duration-300">
                <Zap className="w-10 h-10 text-green-600 group-hover:text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Instant Processing</h3>
              <p className="text-gray-600 leading-relaxed">
                Real-time verification and instant fund transfers ensure beneficiaries receive their payments without delays.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 group-hover:scale-110 transition-all duration-300">
                <Eye className="w-10 h-10 text-blue-600 group-hover:text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Complete Transparency</h3>
              <p className="text-gray-600 leading-relaxed">
                Track every transaction with full audit trails and transparent reporting mechanisms for public accountability.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-600 group-hover:scale-110 transition-all duration-300">
                <Lock className="w-10 h-10 text-purple-600 group-hover:text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Uncompromised Security</h3>
              <p className="text-gray-600 leading-relaxed">
                Bank-grade security protocols with multi-layer authentication protect every transaction and user data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Access Your Government Benefits?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Join millions of citizens who trust our secure platform for transparent and efficient government benefit distribution.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/verification')}
              className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
            >
              <Eye className="w-5 h-5 mr-2" />
              Start Face Verification
            </button>
            <button className="border-2 border-white hover:bg-white hover:text-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300">
              Contact Support
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;