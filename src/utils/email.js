const nodemailer = require('nodemailer');
const config = require('../config');

/**
 * Create a reusable transporter using Brevo SMTP.
 * See https://help.brevo.com/hc/en-us/articles/360010425260-How-to-configure-Brevo-SMTP
 */
const transporter = nodemailer.createTransport({
  host: config.brevo.smtpHost,
  port: config.brevo.smtpPort,
  secure: false, // true for 465, false for other ports
  auth: {
    user: config.brevo.smtpUser,
    pass: config.brevo.smtpPass,
  },
});

/**
 * Send a 6-digit OTP email.
 * @param {string} to - Recipient email address
 * @param {string} otp - The 6-digit OTP code
 */
async function sendOtpEmail(to, otp) {
  const mailOptions = {
    from: `"StaffSync" <${config.brevo.fromEmail}>`,
    to,
    subject: 'Your StaffSync Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1e293b;">Email Verification</h2>
        <p style="color: #475569; font-size: 15px;">
          Use the code below to verify your email address for StaffSync.
        </p>
        <div style="
          background: #f1f5f9;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          color: #0f172a;
          margin: 20px 0;
        ">
          ${otp}
        </div>
        <p style="color: #94a3b8; font-size: 13px;">
          This code expires in <strong>5 minutes</strong>.
          If you did not request this, please ignore this email.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendOtpEmail };
