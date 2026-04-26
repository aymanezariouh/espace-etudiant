/**
 * Email Service — Nodemailer
 * Sends emails to the AHAMMAR team when a contact form is submitted.
 * Supports Gmail / any SMTP provider via .env config.
 */

import nodemailer from 'nodemailer';

// Create transporter from environment variables
function createTransporter() {
  // Gmail (set MAIL_SERVICE=gmail in .env)
  if (process.env.MAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS, // use App Password for Gmail
      },
    });
  }

  // Generic SMTP (Outlook, Yahoo, custom, etc.)
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
}

// ─────────────────────────────────────────
// Send notification email to AHAMMAR team
// ─────────────────────────────────────────
export async function sendContactNotification(contactData) {
  const { name, email, eventType, message, submittedAt } = contactData;

  const transporter = createTransporter();

  const eventLabels = {
    wedding: '💍 Wedding',
    birthday: '🎂 Birthday Party',
    engagement: '💎 Engagement',
    corporate: '💼 Corporate Event',
    other: '✨ Other',
  };

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #8B0000, #C0392B); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; letter-spacing: 3px; }
    .header p { margin: 5px 0 0; opacity: 0.85; font-size: 14px; }
    .body { padding: 30px; }
    .field { margin-bottom: 20px; border-left: 3px solid #C0392B; padding-left: 15px; }
    .field label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888; display: block; margin-bottom: 4px; }
    .field p { margin: 0; font-size: 16px; color: #333; font-weight: 500; }
    .message-box { background: #f9f9f9; border-radius: 6px; padding: 15px; margin-top: 5px; color: #444; font-size: 15px; line-height: 1.6; white-space: pre-wrap; }
    .footer { background: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #999; }
    .badge { display: inline-block; background: #C0392B; color: white; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>AHAMMAR</h1>
      <p>New Contact Form Submission</p>
    </div>
    <div class="body">
      <div class="field">
        <label>Client Name</label>
        <p>${name}</p>
      </div>
      <div class="field">
        <label>Email Address</label>
        <p><a href="mailto:${email}" style="color:#C0392B;">${email}</a></p>
      </div>
      <div class="field">
        <label>Event Type</label>
        <p><span class="badge">${eventLabels[eventType] || '✨ Not specified'}</span></p>
      </div>
      <div class="field">
        <label>Message</label>
        <div class="message-box">${message}</div>
      </div>
      <div class="field">
        <label>Submitted At</label>
        <p>${new Date(submittedAt).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</p>
      </div>
    </div>
    <div class="footer">
      AHAMMAR Event Planning — Reply directly to this email to respond to the client.
    </div>
  </div>
</body>
</html>
  `;

  const mailOptions = {
    from: `"AHAMMAR Website" <${process.env.MAIL_USER}>`,
    to: process.env.MAIL_TO || process.env.MAIL_USER,
    replyTo: email,
    subject: `[AHAMMAR] New inquiry from ${name} — ${eventLabels[eventType] || 'General'}`,
    html,
    text: `New contact from ${name} (${email})\nEvent: ${eventType || 'Not specified'}\n\n${message}`,
  };

  return transporter.sendMail(mailOptions);
}

// ─────────────────────────────────────────
// Send auto-reply to client
// ─────────────────────────────────────────
export async function sendClientAutoReply(contactData) {
  const { name, email, eventType } = contactData;

  const transporter = createTransporter();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #8B0000, #C0392B); color: white; padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 32px; letter-spacing: 4px; }
    .header p { margin: 8px 0 0; opacity: 0.85; font-size: 16px; }
    .body { padding: 40px 30px; color: #444; line-height: 1.7; }
    .body h2 { color: #8B0000; margin-top: 0; }
    .highlight { background: #fff8f8; border-left: 4px solid #C0392B; padding: 15px 20px; border-radius: 4px; margin: 20px 0; }
    .footer { background: #1a1a1a; color: #888; padding: 25px; text-align: center; font-size: 13px; }
    .footer a { color: #C0392B; text-decoration: none; }
    .social { margin-top: 10px; }
    .social a { margin: 0 6px; color: #C0392B; font-size: 18px; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>AHAMMAR</h1>
      <p>Luxury Event Planning</p>
    </div>
    <div class="body">
      <h2>Dear ${name},</h2>
      <p>Thank you for reaching out to us! We've received your message and are excited to hear about your upcoming <strong>${eventType || 'special event'}</strong>.</p>
      <div class="highlight">
        <strong>What happens next?</strong><br>
        Our team will review your inquiry and get back to you within <strong>24 hours</strong> to discuss your vision and how we can bring it to life.
      </div>
      <p>In the meantime, feel free to explore our gallery and services on our website for inspiration.</p>
      <p>We look forward to creating something truly unforgettable together.</p>
      <p>Warm regards,<br><strong>The AHAMMAR Team</strong></p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} AHAMMAR Event Planning · <a href="mailto:info@ahammar-events.com">info@ahammar-events.com</a></p>
    </div>
  </div>
</body>
</html>
  `;

  const mailOptions = {
    from: `"AHAMMAR Event Planning" <${process.env.MAIL_USER}>`,
    to: email,
    subject: `Thank you for contacting AHAMMAR, ${name}!`,
    html,
    text: `Dear ${name},\n\nThank you for your inquiry. We'll get back to you within 24 hours.\n\nWarm regards,\nThe AHAMMAR Team`,
  };

  return transporter.sendMail(mailOptions);
}
