import nodemailer from 'nodemailer';

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER, // your email
      pass: process.env.SMTP_PASS, // your email password or app password
    },
  });
};

// Send contact form email
export const sendContactEmail = async (req, res) => {
  const { name, email, phone, subject, message, inquiryType } = req.body;

  try {
    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, subject, and message are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid email address' 
      });
    }

    const transporter = createTransporter();

    // Email content for admin
    const adminMailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">New Contact Form Submission</h1>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-top: 0;">Contact Details</h2>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; background: #f1f1f1; font-weight: bold; width: 30%;">Name:</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; background: #f1f1f1; font-weight: bold;">Email:</td>
                <td style="padding: 10px; border: 1px solid #ddd;"><a href="mailto:${email}" style="color: #007bff;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; background: #f1f1f1; font-weight: bold;">Phone:</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${phone || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; background: #f1f1f1; font-weight: bold;">Inquiry Type:</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${inquiryType || 'General'}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; background: #f1f1f1; font-weight: bold;">Subject:</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${subject}</td>
              </tr>
            </table>
            
            <h3 style="color: #333;">Message:</h3>
            <div style="background: white; padding: 20px; border: 1px solid #ddd; border-radius: 5px; margin-bottom: 20px;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; border-left: 4px solid #2196f3;">
              <p style="margin: 0; color: #1976d2;">
                <strong>Action Required:</strong> Please respond to this inquiry within 24 hours as per our service commitment.
              </p>
            </div>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0;">This email was sent from the Government Benefits Platform contact form.</p>
            <p style="margin: 5px 0 0 0; font-size: 12px;">Time: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `,
    };

    // Email content for user confirmation
    const userMailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Thank you for contacting us - Government Benefits Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Thank You for Contacting Us!</h1>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-top: 0;">Dear ${name},</h2>
            
            <p style="color: #555; line-height: 1.6;">
              Thank you for reaching out to us through our contact form. We have received your message and our support team will get back to you within 24 hours.
            </p>
            
            <div style="background: white; padding: 20px; border: 1px solid #ddd; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Your Inquiry Details:</h3>
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>Inquiry Type:</strong> ${inquiryType || 'General'}</p>
              <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; border-left: 4px solid #4caf50; margin: 20px 0;">
              <h4 style="color: #2e7d32; margin-top: 0;">What happens next?</h4>
              <ul style="color: #2e7d32; margin: 10px 0;">
                <li>Our support team will review your inquiry</li>
                <li>You'll receive a detailed response within 24 hours</li>
                <li>If urgent, you can call our 24/7 helpline: 1800-123-4567</li>
              </ul>
            </div>
            
            <div style="background: #fff3e0; padding: 15px; border-radius: 5px; border-left: 4px solid #ff9800; margin: 20px 0;">
              <h4 style="color: #f57c00; margin-top: 0;">Need immediate assistance?</h4>
              <p style="color: #f57c00; margin: 10px 0;">
                <strong>24/7 Helpline:</strong> 1800-123-4567<br>
                <strong>Email Support:</strong> support@govbenefits.gov.in
              </p>
            </div>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0;">Government Benefits Platform</p>
            <p style="margin: 5px 0 0 0; font-size: 12px;">Secure • Transparent • Efficient</p>
          </div>
        </div>
      `,
    };

    // Send both emails
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userMailOptions);

    res.status(200).json({
      success: true,
      message: 'Thank you for your message! We have received your inquiry and will get back to you within 24 hours. A confirmation email has been sent to your email address.'
    });

  } catch (error) {
    console.error('Error sending contact email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later or contact us directly.'
    });
  }
};

// Test email configuration
export const testEmailConfig = async (req, res) => {
  try {
    const transporter = createTransporter();
    
    // Verify connection configuration
    await transporter.verify();
    
    res.status(200).json({
      success: true,
      message: 'Email configuration is working correctly'
    });
  } catch (error) {
    console.error('Email configuration test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Email configuration test failed. Please check your SMTP settings.',
      error: error.message
    });
  }
};

