const nodemailer = require("nodemailer");

// Create a transporter once rather than on each request
let transporter;

/**
 * Initialize email transporter with environment variables
 * Can be called when the app starts to validate email configuration
 */
exports.initializeEmailService = () => {
  // Check required environment variables
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ Email service configuration missing. Set EMAIL_USER and EMAIL_PASS environment variables.");
    return false;
  }

  try {
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      pool: true, // Use connection pooling for better performance
      maxConnections: 5, // Limit concurrent connections
      maxMessages: 100, // Limit messages per connection
      rateDelta: 1000, // Limit sends to 1 per second to avoid rate limiting
      rateLimit: 5, // Maximum messages per rateDelta
    });
    
    // Verify connection configuration
    return transporter.verify()
      .then(() => {
        console.log("✅ Email service initialized successfully");
        return true;
      })
      .catch(error => {
        console.error("❌ Email service verification failed:", error);
        return false;
      });
  } catch (error) {
    console.error("❌ Failed to initialize email service:", error);
    return false;
  }
};

/**
 * Send email notification for unlocked timeline entries
 * @param {string} to - Recipient email address
 * @param {string} title - Title of the unlocked timeline
 * @param {string} userName - Optional user name for personalization
 * @returns {Promise} - Resolves with info on success, rejects with error on failure
 */
exports.sendEmailNotification = async (to, title, userName = '') => {
  // Initialize transporter if not already done
  if (!transporter) {
    await exports.initializeEmailService();
    
    // If still not initialized, throw error
    if (!transporter) {
      const error = new Error("Email service not initialized");
      error.code = "EMAIL_SERVICE_NOT_INITIALIZED";
      throw error;
    }
  }

  const greeting = userName ? `Hi ${userName},` : 'Hi there,';
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const mailOptions = {
    from: `"EchoVerse" <${process.env.EMAIL_USER}>`,
    to,
    subject: `🎉 Your Time Capsule "${title}" Has Unlocked!`,
    html: `
      <div style="font-family:Arial, sans-serif; max-width:600px; margin:0 auto; padding:20px; border-radius:8px; border:1px solid #e0e0e0;">
        <div style="text-align:center; margin-bottom:20px;">
          <h1 style="color:#6366F1;">Your Time Capsule Has Unlocked!</h1>
          <p style="font-size:16px; color:#666;">Unlocked on ${currentDate}</p>
        </div>
        
        <div style="padding:20px; background-color:#f9f9f9; border-radius:5px; margin-bottom:20px;">
          <p style="font-size:16px; line-height:1.5; margin-top:0;">${greeting}</p>
          <p style="font-size:16px; line-height:1.5;">Your audio diary <strong>"${title}"</strong> that you recorded in the past has just unlocked and is now available for you to listen to!</p>
          <p style="font-size:16px; line-height:1.5;">Listen to your past self and reflect on your journey since then.</p>
        </div>
        
        <div style="text-align:center; margin:30px 0;">
          <a href="${process.env.APP_URL || 'https://echoverse.app'}/timeline" 
             style="background-color:#6366F1; color:white; padding:12px 24px; text-decoration:none; border-radius:4px; font-weight:bold; display:inline-block;">
            Listen Now
          </a>
        </div>
        
        <p style="font-style:italic; color:#666; text-align:center; margin-bottom:20px;">
          "Time captures the most honest parts of ourselves. What will your past self reveal to you today?"
        </p>
        
        <div style="border-top:1px solid #e0e0e0; padding-top:20px; margin-top:20px; font-size:14px; color:#666;">
          <p>Warm regards,<br>The EchoVerse Team</p>
          <p style="font-size:12px; margin-top:20px;">
            If you need assistance, please contact <a href="mailto:support@echoverse.app" style="color:#6366F1;">support@echoverse.app</a>
          </p>
        </div>
      </div>
    `,
    // Add plain text version for email clients that don't support HTML
    text: `
Your Time Capsule Has Unlocked!

${greeting}

Your audio diary "${title}" that you recorded in the past has just unlocked and is now available for you to listen to!

Listen to your past self and reflect on your journey since then.

Time captures the most honest parts of ourselves. What will your past self reveal to you today?

Visit ${process.env.APP_URL || 'https://echoverse.app'}/timeline to listen now.

Warm regards,
The EchoVerse Team
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to} for "${title}" timeline | ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Error sending email to ${to}:`, error);
    throw error; // Re-throw for proper error handling upstream
  }
};