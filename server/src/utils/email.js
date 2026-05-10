import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

export async function sendPasswordResetEmail(to, code) {
  const html = `
    <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:0 auto;background:#1C1C2E;color:#F0F0F8;padding:40px 32px;border-radius:16px;">
      <div style="text-align:center;margin-bottom:24px;">
        <span style="font-size:40px;">✈️</span>
        <h1 style="margin:8px 0 0;font-size:28px;color:#A78BFA;">Traveloop</h1>
      </div>
      <h2 style="text-align:center;margin-bottom:8px;font-size:20px;">Password Reset</h2>
      <p style="text-align:center;color:#9CA3AF;font-size:14px;margin-bottom:32px;">Use the code below to reset your password. It expires in 15 minutes.</p>
      <div style="background:#2A2A3E;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
        <span style="font-size:36px;letter-spacing:8px;font-weight:700;color:#A78BFA;">${code}</span>
      </div>
      <p style="text-align:center;color:#9CA3AF;font-size:12px;">If you didn't request this, you can safely ignore this email.</p>
    </div>`;

  try {
    await transporter.sendMail({ from: process.env.EMAIL_FROM || 'noreply@traveloop.app', to, subject: 'Traveloop – Password Reset Code', html });
    return true;
  } catch (error) {
    console.error('Email send failed:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n🔑  Password-reset code for ${to}: ${code}\n`);
      return true;
    }
    return false;
  }
}

export async function sendWelcomeEmail(to, firstName) {
  const html = `
    <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:0 auto;background:#1C1C2E;color:#F0F0F8;padding:40px 32px;border-radius:16px;">
      <div style="text-align:center;margin-bottom:24px;">
        <span style="font-size:40px;">✈️</span>
        <h1 style="margin:8px 0 0;font-size:28px;color:#A78BFA;">Welcome to Traveloop!</h1>
      </div>
      <p style="text-align:center;color:#E0E0E8;font-size:16px;margin-bottom:8px;">Hey ${firstName}! 👋</p>
      <p style="text-align:center;color:#9CA3AF;font-size:14px;margin-bottom:32px;">Your account is ready. Start planning your dream trip today!</p>
      <div style="text-align:center;">
        <a href="http://localhost:5173/dashboard" style="display:inline-block;background:#A78BFA;color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;">Start Planning</a>
      </div>
      <p style="text-align:center;color:#9CA3AF;font-size:12px;margin-top:32px;">Dream it. Plan it. Loop it. 🌍</p>
    </div>`;

  try {
    await transporter.sendMail({ from: process.env.EMAIL_FROM || 'noreply@traveloop.app', to, subject: 'Welcome to Traveloop! ✈️', html });
    return true;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n📧  Welcome email would be sent to ${to}\n`);
      return true;
    }
    return false;
  }
}
