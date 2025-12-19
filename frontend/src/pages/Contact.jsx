import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle, 
  ArrowRight, 
  Shield, 
  Users, 
  Globe,
  MessageCircle,
  Headphones,
  FileText,
  Calendar,
  Star,
  ChevronDown,
  ChevronUp,
  Zap,
  Building,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Contact = () => {
  const [isVisible, setIsVisible] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const contactInfo = [
    {
      icon: <Phone className="w-8 h-8" />,
      title: "24/7 Helpline",
      details: ["1800-123-4567", "1800-987-6543"],
      description: "Round-the-clock support for urgent queries and technical assistance",
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      icon: <Mail className="w-8 h-8" />,
      title: "Email Support",
      details: ["support@govbenefits.gov.in", "help@govbenefits.gov.in"],
      description: "Detailed assistance via email with guaranteed response within 24 hours",
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Office Locations",
      details: ["New Delhi, India", "Mumbai, Maharashtra", "Bangalore, Karnataka"],
      description: "Visit our regional offices for in-person assistance and document verification",
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Business Hours",
      details: ["Mon-Fri: 9:00 AM - 6:00 PM", "Sat: 10:00 AM - 4:00 PM"],
      description: "Office hours for walk-in support and scheduled appointments",
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    }
  ];

  const faqs = [
    {
      question: "How do I register for government benefits?",
      answer: "You can register through our secure online portal by providing your Aadhaar number, personal details, and completing the face verification process. The entire process takes less than 10 minutes."
    },
    {
      question: "What documents do I need for verification?",
      answer: "You'll need a valid Aadhaar card, proof of address, bank account details, and a government-issued photo ID. All documents should be clear and legible for faster processing."
    },
    {
      question: "How long does it take to receive benefits?",
      answer: "Once your application is approved and face verification is completed, benefits are typically transferred within 2-3 business days directly to your registered bank account."
    },
    {
      question: "Is my personal information secure?",
      answer: "Yes, we use bank-grade encryption and advanced security protocols to protect your data. Our system is ISO 27001 certified and follows strict government security standards."
    },
    {
      question: "What if I face technical issues during verification?",
      answer: "Our technical support team is available 24/7. You can call our helpline, use the live chat feature, or visit our nearest office for immediate assistance."
    },
    {
      question: "Can I update my information after registration?",
      answer: "Yes, you can update your personal information, bank details, and address through your dashboard. Some changes may require re-verification for security purposes."
    }
  ];

  const inquiryTypes = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'verification', label: 'Verification Issues' },
    { value: 'benefits', label: 'Benefits Related' },
    { value: 'complaint', label: 'Complaint' },
    { value: 'feedback', label: 'Feedback' }
  ];

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/contact/send', formData);
      
      if (response.data.success) {
        setIsSubmitted(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          inquiryType: 'general'
        });
      } else {
        setSubmitError(response.data.message || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending contact form:', error);
      setSubmitError(
        error.response?.data?.message || 
        'Failed to send message. Please check your connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center bg-blue-700 bg-opacity-50 rounded-full px-6 py-3 text-sm font-medium mb-8"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              24/7 Customer Support Available
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl lg:text-6xl font-bold leading-tight mb-6"
            >
              Get in Touch
              <span className="block text-yellow-400">We're Here to Help</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-blue-100 leading-relaxed max-w-3xl mx-auto"
            >
              Have questions about government benefits? Need technical assistance? Our dedicated support team is ready to help you with any queries or concerns.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Contact Information Cards */}
      <section className="py-20 bg-white" data-section="contact-info">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible['contact-info'] ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-6">Multiple Ways to Reach Us</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the most convenient way to get in touch with our support team
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isVisible['contact-info'] ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group"
              >
                <div className={`${info.bgColor} w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <div className={info.color}>
                    {info.icon}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-4">{info.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{info.description}</p>
                
                <div className="space-y-2">
                  {info.details.map((detail, detailIndex) => (
                    <div key={detailIndex} className="text-sm font-semibold text-gray-700">
                      {detail}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white" data-section="contact-form">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isVisible['contact-form'] ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100"
            >
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-gray-800 mb-4">Send us a Message</h3>
                <p className="text-gray-600">Fill out the form below and we'll get back to you within 24 hours</p>
              </div>

              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-800 mb-4">Message Sent Successfully!</h4>
                  <p className="text-gray-600 mb-6">
                    Thank you for contacting us! We have received your inquiry and will get back to you within 24 hours. 
                    A confirmation email has been sent to your email address.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-blue-800 text-sm">
                      <strong>What happens next?</strong><br />
                      • Our support team will review your inquiry<br />
                      • You'll receive a detailed response within 24 hours<br />
                      • For urgent matters, call our 24/7 helpline: 1800-123-4567
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setSubmitError('');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Inquiry Type</label>
                      <select
                        name="inquiryType"
                        value={formData.inquiryType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      >
                        {inquiryTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      placeholder="Enter message subject"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 resize-none"
                      placeholder="Enter your message here..."
                    />
                  </div>

                  {submitError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center"
                    >
                      <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                      {submitError}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                        Sending Message...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={isVisible['contact-form'] ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
                <h4 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <Headphones className="w-6 h-6 mr-3 text-blue-600" />
                  Why Choose Our Support?
                </h4>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h5 className="font-semibold text-gray-800">24/7 Availability</h5>
                      <p className="text-gray-600 text-sm">Round-the-clock support for urgent matters</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h5 className="font-semibold text-gray-800">Expert Team</h5>
                      <p className="text-gray-600 text-sm">Trained professionals with deep knowledge</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h5 className="font-semibold text-gray-800">Quick Response</h5>
                      <p className="text-gray-600 text-sm">Guaranteed response within 24 hours</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h4 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <FileText className="w-6 h-6 mr-3 text-blue-600" />
                  Quick Links
                </h4>
                <div className="space-y-3">
                  <a href="/faq" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-300">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Frequently Asked Questions
                  </a>
                  <a href="/help" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-300">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Help Center
                  </a>
                  <a href="/status" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-300">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    System Status
                  </a>
                  <a href="/downloads" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-300">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Download Forms
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white" data-section="faq">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible['faq'] ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Find quick answers to common questions</p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible['faq'] ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-300"
                >
                  <h3 className="text-lg font-semibold text-gray-800 pr-4">{faq.question}</h3>
                  {expandedFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                
                <AnimatePresence>
                  {expandedFaq === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-8 pb-6 text-gray-600 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold text-white mb-6"
          >
            Still Need Help?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-blue-100 mb-8 leading-relaxed"
          >
            Our support team is always ready to assist you with any questions or concerns.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center">
              <Phone className="w-5 h-5 mr-2" />
              Call Now: 1800-123-4567
            </button>
            <button className="border-2 border-white hover:bg-white hover:text-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300">
              <Mail className="w-5 h-5 mr-2" />
              Email Support
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
