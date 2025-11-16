const { Resend } = require('resend');

// اگر از Resend استفاده می‌کنی
const resend = new Resend(process.env.RESEND_API_KEY);

const sendVerificationEmail = async (email, verificationToken) => {
  try {
    console.log('📧 در حال ارسال ایمیل تأیید به:', email);
    
    const verificationUrl = `http://localhost:4000/verify-success?token=${verificationToken}`;
    
    console.log('🔗 لینک تأیید:', verificationUrl);
    
    // استفاده از Resend واقعی
    const { data, error } = await resend.emails.send({
      from: 'Raad Health <onboarding@resend.dev>',
      to: [email],
      subject: 'Verify Your Email - Raad Health',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1D9EBD; color: #ffffff; padding: 20px; text-align: center; }
            .button { background: #1D9EBD; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Raad Health</h1>
            </div>
            <h2>Verify Your Email Address</h2>
            <p>Click the button below to verify your email:</p>
            <p>
              <a href="${verificationUrl}" class="button">Verify Email</a>
            </p>
            <p>Or copy this link: ${verificationUrl}</p>
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('❌ Error sending email:', error);
      return false;
    }

    console.log('✅ Verification email sent:', data);
    return true;

  } catch (error) {
    console.error('❌ خطا در سرویس ایمیل:', error);
    return false;
  }
};

module.exports = { sendVerificationEmail };