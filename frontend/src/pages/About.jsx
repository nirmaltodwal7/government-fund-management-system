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
  UserCheck,
  Calendar,
  Target,
  TrendingUp,
  Phone,
  Mail,
  MapPin,
  Star,
  Clock,
  Building,
  Briefcase
} from 'lucide-react';

const About = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const [activeTimelineItem, setActiveTimelineItem] = useState(0);
  const navigate = useNavigate();

  const heroStats = [
    { number: "50M+", label: "Registered Citizens", color: "text-blue-600" },
    { number: "₹5.2L Cr", label: "Benefits Distributed", color: "text-green-600" },
    { number: "99.9%", label: "Uptime Guaranteed", color: "text-purple-600" },
    { number: "15 Sec", label: "Average Processing", color: "text-orange-600" }
  ];

  const achievements = [
    {
      title: "Digital India Excellence Award",
      year: "2024",
      description: "Recognition for innovative biometric payment systems",
      icon: <Award className="w-8 h-8" />
    },
    {
      title: "UN Sustainable Development Goals",
      year: "2023",
      description: "Contribution to poverty reduction through tech",
      icon: <Globe className="w-8 h-8" />
    },
    {
      title: "ISO 27001 Certified",
      year: "2023",
      description: "International security management standards",
      icon: <Shield className="w-8 h-8" />
    },
    {
      title: "National Security Excellence",
      year: "2022",
      description: "Outstanding fraud prevention mechanisms",
      icon: <Lock className="w-8 h-8" />
    }
  ];

  const teamMembers = [
    {
      name: "Shivam Sharma",
      position: "Chief Technology Officer",
      department: "Technology & Innovation",
      expertise: "AI & Machine Learning, Biometric Systems",
      achievements: "Led 50+ digital transformation projects"
    },
    {
      name: "Sahil Bagga",
      position: "Head of Security",
      department: "Cybersecurity & Compliance",
      expertise: "Cybersecurity, Fraud Prevention",
      experience: "12+ years",
      achievements: "Reduced fraud by 99.8% system-wide"
    },
    {
      name: "Sanjay Singh",
      position: "Director of Operations",
      department: "Beneficiary Services",
      expertise: "Public Policy, Operations Management",
      experience: "18+ years",
      achievements: "Streamlined processes for 45M+ beneficiaries"
    },
    {
      name: "Nirmal Todwal",
      position: "Chief Financial Officer",
      department: "Financial Planning & Analysis",
      expertise: "Financial Technology, Risk Management",
      experience: "20+ years",
      achievements: "Managed ₹5.2L+ Cr in benefit distributions"
    }
  ];

  const timeline = [
    {
      phase: "Project Inception",
      date: "January 2020",
      status: "completed",
      description: "Government initiative launched to digitize benefit distribution with focus on transparency and fraud prevention.",
      keyPoints: [
        "Stakeholder consultation completed",
        "Technical requirements finalized",
        "Budget approval of ₹2,000 Cr secured"
      ]
    },
    {
      phase: "Technology Development",
      date: "June 2020 - March 2021",
      status: "completed",
      description: "Core platform development with advanced biometric integration and database connectivity.",
      keyPoints: [
        "Face recognition system implemented",
        "Death registry integration completed",
        "Aadhaar API integration successful",
        "Security protocols established"
      ]
    },
    {
      phase: "Pilot Testing",
      date: "April 2021 - September 2021",
      status: "completed",
      description: "Limited rollout in 5 states to test system reliability and user acceptance.",
      keyPoints: [
        "1M+ test transactions processed",
        "99.7% success rate achieved",
        "User feedback incorporated",
        "Performance optimization completed"
      ]
    },
    {
      phase: "National Rollout",
      date: "October 2021 - Present",
      status: "active",
      description: "Nationwide deployment across all states and union territories with continuous monitoring.",
      keyPoints: [
        "All 36 states/UTs connected",
        "50M+ citizens registered",
        "₹5.2L+ Cr distributed safely",
        "24/7 monitoring operational"
      ]
    },
    {
      phase: "Enhancement Phase",
      date: "2024 - 2026",
      status: "upcoming",
      description: "Advanced AI features, mobile app launch, and integration with emerging government schemes.",
      keyPoints: [
        "AI-powered fraud detection",
        "Mobile application development",
        "Blockchain integration planned",
        "International best practices adoption"
      ]
    }
  ];

  const features = [
    {
      icon: <Eye className="w-12 h-12" />,
      title: "Biometric Authentication",
      description: "Advanced face recognition technology ensures only legitimate beneficiaries receive funds",
      stats: "99.8% accuracy rate"
    },
    {
      icon: <Database className="w-12 h-12" />,
      title: "Real-time Database Sync",
      description: "Instant verification against death registries and Aadhaar database prevents fraudulent payments",
      stats: "< 2 sec response time"
    },
    {
      icon: <Shield className="w-12 h-12" />,
      title: "Multi-layer Security",
      description: "Bank-grade encryption with continuous monitoring protects sensitive financial data",
      stats: "256-bit encryption"
    },
    {
      icon: <TrendingUp className="w-12 h-12" />,
      title: "Predictive Analytics",
      description: "AI-powered insights help optimize benefit distribution and prevent system abuse",
      stats: "15% efficiency gain"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % achievements.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timelineInterval = setInterval(() => {
      setActiveTimelineItem((prev) => (prev + 1) % timeline.length);
    }, 4000);
    return () => clearInterval(timelineInterval);
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

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Dynamic Stats */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-blue-100 text-blue-800 rounded-full px-6 py-3 text-sm font-semibold mb-6">
              <Building className="w-4 h-4 mr-2" />
              Government of India Digital Initiative
            </div>
            
            <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Secure Benefit
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Distribution Platform
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
              Revolutionary digital platform ensuring transparent, secure, and efficient delivery of government benefits 
              through cutting-edge biometric technology and real-time fraud prevention systems.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button 
                onClick={() => navigate('/verification')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center justify-center"
              >
                <Eye className="mr-3 w-6 h-6" />
                Start Verification Process
              </button>
              <button className="border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 text-gray-700 px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center">
                <Phone className="mr-3 w-5 h-5" />
                Get Support
              </button>
            </div>
          </div>

          {/* Dynamic Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {heroStats.map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group hover:scale-105">
                <div className={`text-4xl font-bold ${stat.color} mb-2 group-hover:scale-110 transition-transform duration-300`}>
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 bg-gray-50" data-section="features">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Advanced Security Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines cutting-edge technology with robust security measures to ensure every rupee reaches the right beneficiary.
            </p>
          </div>

          <div className={`grid lg:grid-cols-2 xl:grid-cols-4 gap-8 transition-all duration-1000 ${isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group">
                <div className="text-blue-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{feature.description}</p>
                <div className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block">
                  {feature.stats}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section - 4 Cards */}
      <section className="py-20 bg-white" data-section="team">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Leadership Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Meet the dedicated professionals leading India's digital transformation in government benefit distribution.
            </p>
          </div>

          <div className={`grid lg:grid-cols-2 xl:grid-cols-4 gap-8 transition-all duration-1000 ${isVisible.team ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 group hover:scale-105">
                <div className="text-center mb-6">
                  <div className="relative mx-auto mb-4">
                    
                    <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center">
                      <Star className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-semibold mb-1">{member.position}</p>
                  <p className="text-sm text-gray-600 mb-3">{member.department}</p>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center text-gray-700">
                    <Briefcase className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="font-medium">Expertise:</span>
                  </div>
                  <p className="text-gray-600 ml-6">{member.expertise}</p>
                  
                 
                  
                 
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Timeline */}
      <section className="py-20 bg-gray-50" data-section="timeline">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Project Timeline</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Journey of transforming India's benefit distribution system from conception to nationwide implementation.
            </p>
          </div>

          <div className={`transition-all duration-1000 ${isVisible.timeline ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-200"></div>
              
              <div className="space-y-12">
                {timeline.map((item, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} transition-all duration-500 ${
                      activeTimelineItem === index ? 'scale-105' : ''
                    }`}
                  >
                    {/* Content */}
                    <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                      <div className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${
                        item.status === 'completed' ? 'border-green-500' : 
                        item.status === 'active' ? 'border-blue-500' : 'border-gray-400'
                      }`}>
                        <div className="flex items-center mb-3">
                          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            item.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            item.status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {item.status.toUpperCase()}
                          </div>
                          <span className="ml-3 text-sm text-gray-600 font-medium">{item.date}</span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{item.phase}</h3>
                        <p className="text-gray-600 mb-4">{item.description}</p>
                        
                        <div className="space-y-2">
                          {item.keyPoints.map((point, pointIndex) => (
                            <div key={pointIndex} className="flex items-center text-sm">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                              <span className="text-gray-700">{point}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Timeline Node */}
                    <div className="relative z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white ${
                        item.status === 'completed' ? 'bg-green-500' : 
                        item.status === 'active' ? 'bg-blue-500' : 'bg-gray-400'
                      } ${activeTimelineItem === index ? 'scale-150 shadow-lg' : ''} transition-all duration-500`}>
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    </div>
                    
                    <div className="w-5/12"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Carousel */}
      <section className="py-20 bg-white" data-section="achievements">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-12">Awards & Recognition</h2>
          
          <div className={`relative bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 transition-all duration-1000 ${isVisible.achievements ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex items-center justify-center mb-6">
              <div className="text-blue-600 transform scale-150">
                {achievements[currentSlide].icon}
              </div>
            </div>
            
            <div className="mb-4">
              <span className="text-sm font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                {achievements[currentSlide].year}
              </span>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {achievements[currentSlide].title}
            </h3>
            <p className="text-gray-600 text-lg">
              {achievements[currentSlide].description}
            </p>
            
            <div className="flex justify-center space-x-2 mt-8">
              {achievements.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide ? 'bg-blue-600 w-8' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Support */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Experience?</h2>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Join millions of citizens already benefiting from our secure, transparent, and efficient digital platform.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <Phone className="w-6 h-6 mr-4 text-blue-200" />
                  <span className="text-lg">24/7 Helpline: 1800-123-4567</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-6 h-6 mr-4 text-blue-200" />
                  <span className="text-lg">support@govbenefits.gov.in</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-6 h-6 mr-4 text-blue-200" />
                  <span className="text-lg">New Delhi, India</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Quick Access Portal</h3>
              
              <div className="space-y-4">
                <button 
                  onClick={() => navigate('/verification')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center shadow-lg"
                >
                  <Eye className="mr-3 w-6 h-6" />
                  Start Face Verification
                </button>
                
                <button className="w-full border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 text-gray-700 px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center">
                  <FileCheck className="mr-3 w-6 h-6" />
                  Check Application Status
                </button>
                
                <button 
                  onClick={() => navigate('/signup')}
                  className="w-full border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 text-gray-700 px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center"
                >
                  <Users className="mr-3 w-6 h-6" />
                  Register New Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;