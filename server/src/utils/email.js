import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send a password-reset email containing a 6-digit OTP code.
 */
export async function sendPasswordResetEmail(to, code) {
  const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; background: #1C1C2E; color: #F0F0F8; padding: 40px 32px; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 40px;">✈️</span>
        <h1 style="margin: 8px 0 0; font-size: 28px; color: #A78BFA;">Traveloop</h1>
      </div>
      <h2 style="text-align: center; margin-bottom: 8px; font-size: 20px;">Password Reset</h2>
      <p style="text-align: center; color: #9CA3AF; font-size: 14px; margin-bottom: 32px;">
        Use the code below to reset your password. It expires in 15 minutes.
      </p>
      <div style="background: #2A2A3E; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <span style="font-size: 36px; letter-spacing: 8px; font-weight: 700; color: #A78BFA;">${code}</span>
      </div>
      <p style="text-align: center; color: #9CA3AF; font-size: 12px;">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@traveloop.app',
      to,
      subject: 'Traveloop – Password Reset Code',
      html,
    });
    return true;
  } catch (error) {
    console.error('Email send failed:', error.message);
    // In development, log the code to the console instead
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n🔑  Password-reset code for ${to}: ${code}\n`);
      return true;
    }
    return false;
  }
}
