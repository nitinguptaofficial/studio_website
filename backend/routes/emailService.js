const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send notification email to admin when a new contact form is submitted
 */
async function sendAdminNotification(contactData) {
  const { name, email, phone, service, message } = contactData;

  const mailOptions = {
    from: `"Varma Studios Website" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
    to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
    subject: `New Contact Form Submission from ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #0a0a0a; padding: 24px; text-align: center;">
          <h1 style="color: #c9a96e; margin: 0; font-size: 22px;">New Contact Submission</h1>
        </div>
        <div style="padding: 24px; background: #f9f9f9; border: 1px solid #e5e5e5;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #333; width: 120px;">Name:</td>
              <td style="padding: 10px; color: #555;">${name}</td>
            </tr>
            <tr style="background: #fff;">
              <td style="padding: 10px; font-weight: bold; color: #333;">Email:</td>
              <td style="padding: 10px; color: #555;"><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #333;">Phone:</td>
              <td style="padding: 10px; color: #555;">${phone || 'Not provided'}</td>
            </tr>
            <tr style="background: #fff;">
              <td style="padding: 10px; font-weight: bold; color: #333;">Service:</td>
              <td style="padding: 10px; color: #555;">${service || 'Not specified'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #333; vertical-align: top;">Message:</td>
              <td style="padding: 10px; color: #555;">${message}</td>
            </tr>
          </table>
        </div>
        <div style="padding: 16px; text-align: center; color: #999; font-size: 12px;">
          Submitted on ${new Date().toLocaleString()}
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

/**
 * Send confirmation email to the user who submitted the contact form
 */
async function sendUserConfirmation(contactData) {
  const { name, email } = contactData;

  const mailOptions = {
    from: `"Varma Studios" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
    to: email,
    subject: `Thank you for contacting Varma Studios, ${name}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #0a0a0a; padding: 32px; text-align: center;">
          <h1 style="color: #c9a96e; margin: 0; font-size: 24px; letter-spacing: 0.05em;">VARMA STUDIOS</h1>
        </div>
        <div style="padding: 32px; background: #ffffff; border: 1px solid #e5e5e5;">
          <h2 style="color: #333; margin-top: 0;">Hello ${name},</h2>
          <p style="color: #555; line-height: 1.7; font-size: 15px;">
            Thank you for reaching out to Varma Studios! We have received your message and our team will review it shortly.
          </p>
          <p style="color: #555; line-height: 1.7; font-size: 15px;">
            We typically respond within <strong>24 hours</strong>. If your inquiry is urgent, feel free to call us directly.
          </p>
          <div style="margin: 32px 0; padding: 20px; background: #f9f6f0; border-left: 4px solid #c9a96e;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              <strong>What happens next?</strong><br/>
              Our team will review your requirements and get back to you with a customized plan that fits your vision and budget.
            </p>
          </div>
          <p style="color: #555; line-height: 1.7; font-size: 15px;">
            Meanwhile, feel free to browse our <a href="${process.env.CORS_ORIGIN || 'http://localhost:3000'}/work" style="color: #c9a96e;">portfolio</a> for inspiration.
          </p>
          <p style="color: #555; font-size: 15px; margin-bottom: 0;">
            Warm regards,<br/>
            <strong style="color: #333;">The Varma Studios Team</strong>
          </p>
        </div>
        <div style="padding: 16px; text-align: center; color: #999; font-size: 12px;">
          © ${new Date().getFullYear()} Varma Studios. All rights reserved.
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendAdminNotification, sendUserConfirmation };
