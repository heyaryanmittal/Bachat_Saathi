const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE || 'gmail',
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true' || false,
  auth: {
    user: process.env.EMAIL_USER || process.env.SMTP_USER,
    pass: process.env.EMAIL_PASS || process.env.SMTP_PASS
  }
});

const FROM_EMAIL = process.env.SMTP_USER || process.env.EMAIL_USER || 'no-reply@bachatsaathi.com';
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'BachatSaathi';

const renderEmailWrapper = ({
  headerBg = 'linear-gradient(135deg, #0f172a 0%, #065f46 100%)',
  headerIcon = '💰',
  title = 'Notification',
  subtitle = '',
  contentHtml = '',
  footerText = 'This is an automated notification from BachatSaathi.',
}) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap');
          body {
            margin: 0;
            padding: 0;
            width: 100% !important;
            background-color: #f8fafc;
            font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
          }
          table {
            border-collapse: collapse;
          }
          @media only screen and (max-width: 600px) {
            .container {
              width: 100% !important;
              padding: 10px !important;
            }
            .content-card {
              padding: 30px 20px !important;
              border-radius: 12px !important;
            }
            .header-bar {
              padding: 30px 20px !important;
              border-radius: 12px 12px 0 0 !important;
            }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 40px 10px;">
          <tr>
            <td align="center">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" class="container" style="max-width: 600px; width: 100%;">
                <!-- Header -->
                <tr>
                  <td align="center" class="header-bar" style="background: ${headerBg}; padding: 40px; border-radius: 16px 16px 0 0; text-align: center; border-bottom: 4px solid #10b981;">
                    <div style="font-size: 36px; margin-bottom: 12px;">${headerIcon}</div>
                    <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px; text-transform: uppercase; font-family: 'Outfit', sans-serif;">BachatSaathi</h1>
                    ${subtitle ? `<p style="margin: 6px 0 0 0; font-size: 14px; color: #a7f3d0; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; font-family: 'Inter', sans-serif;">${subtitle}</p>` : ''}
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td class="content-card" style="background-color: #ffffff; padding: 45px; border-radius: 0 0 16px 16px; box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0; border-top: none;">
                    <div style="font-family: 'Inter', sans-serif; font-size: 15px; line-height: 1.7; color: #334155;">
                      ${contentHtml}
                    </div>
                    
                    <!-- Footer Info -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 40px; border-top: 1px solid #f1f5f9; padding-top: 25px;">
                      <tr>
                        <td style="color: #94a3b8; font-size: 12px; line-height: 1.6; text-align: center; font-family: 'Inter', sans-serif;">
                          <p style="margin: 0 0 8px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #0f172a; font-family: 'Outfit', sans-serif;">BachatSaathi</p>
                          <p style="margin: 0 0 16px 0; color: #64748b;">${footerText}</p>
                          <p style="margin: 0; font-size: 11px; color: #cbd5e1;">&copy; ${new Date().getFullYear()} BachatSaathi. All rights reserved.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};

exports.sendSignupOtpEmail = async (userEmail, { name, otp }) => {
  try {
    const htmlContent = `
      <p style="margin-top: 0; font-size: 16px; font-weight: 600; color: #0f172a;">Hello ${name || 'there'},</p>
      <p style="margin-bottom: 25px; color: #475569;">Thank you for registering with BachatSaathi! To complete your signup and verify your email address, please use the secure passcode below:</p>
      
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
        <p style="margin: 0 0 10px 0; color: #166534; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Your One-Time Passcode</p>
        <div style="font-size: 42px; font-weight: 800; color: #15803d; letter-spacing: 8px; font-family: 'Outfit', monospace; line-height: 1; margin: 15px 0;">${otp}</div>
        <p style="margin: 0; color: #64748b; font-size: 12px; font-weight: 500;">⏱️ This secure code will expire in <strong style="color: #ef4444;">10 minutes</strong>.</p>
      </div>

      <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 6px; margin: 25px 0; font-size: 13px; color: #991b1b; line-height: 1.5;">
        <strong>Security Notice:</strong> Never share this passcode with anyone. BachatSaathi team members will never request your OTP via email, call, or chat support.
      </div>
    `;

    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: userEmail,
      subject: 'BachatSaathi Signup OTP - Verify Your Email',
      html: renderEmailWrapper({
        headerBg: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)',
        headerIcon: '✉️',
        title: 'Verify Your Email',
        subtitle: 'Email Verification',
        contentHtml: htmlContent,
        footerText: 'You received this email because you registered on BachatSaathi.'
      })
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

exports.sendWelcomeEmail = async (userEmail, { name, email }) => {
  try {
    const htmlContent = `
      <p style="margin-top: 0; font-size: 16px; font-weight: 600; color: #0f172a;">Hello ${name},</p>
      <p style="margin-bottom: 25px; color: #475569;">Welcome onboard! Your BachatSaathi account has been successfully created. We are excited to support you on your financial tracking and wealth multiplication journey.</p>
      
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 25px 0;">
        <p style="margin: 0 0 15px 0; color: #0f172a; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Account Information</p>
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #64748b; width: 120px;"><strong>Registered Email:</strong></td>
            <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-family: monospace; font-weight: 600;">${email}</td>
          </tr>
        </table>
      </div>

      <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 25px 0; font-size: 13px; color: #78350f; line-height: 1.5;">
        🔒 <strong>Important Reminder:</strong> For security, we recommend that you immediately update or verify your account password upon your first login. Always use a strong and unique password.
      </div>

      <div style="text-align: center; margin: 35px 0;">
        <a href="http://localhost:3000/dashboard" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2); font-family: 'Outfit', sans-serif;">Go to Dashboard</a>
      </div>
    `;

    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: userEmail,
      subject: 'Welcome to BachatSaathi - Your Personal Finance Manager',
      html: renderEmailWrapper({
        headerBg: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)',
        headerIcon: '🎉',
        title: 'Welcome to BachatSaathi',
        subtitle: 'Account Activated',
        contentHtml: htmlContent,
        footerText: 'You received this email because you created an account on BachatSaathi.'
      })
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

exports.send2FAOtpEmail = async (userEmail, { name, otp }) => {
  try {
    const htmlContent = `
      <p style="margin-top: 0; font-size: 16px; font-weight: 600; color: #0f172a;">Hello ${name || 'there'},</p>
      <p style="margin-bottom: 25px; color: #475569;">A login attempt has been detected on your BachatSaathi account. To complete the login, please confirm your identity using the verification code below:</p>
      
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
        <p style="margin: 0 0 10px 0; color: #166534; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Verification Code</p>
        <div style="font-size: 42px; font-weight: 800; color: #16a34a; letter-spacing: 8px; font-family: 'Outfit', monospace; line-height: 1; margin: 15px 0;">${otp}</div>
        <p style="margin: 0; color: #64748b; font-size: 12px; font-weight: 500;">⏱️ This secure code will expire in <strong style="color: #ef4444;">10 minutes</strong>.</p>
      </div>

      <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 25px 0; font-size: 13px; color: #78350f; line-height: 1.5;">
        ⚠️ <strong>Security Advisory:</strong> Never share this code with anyone. Our support team or security team will never ask for your verification code.
      </div>

      <p style="color: #64748b; font-size: 12px; line-height: 1.6; margin-top: 25px;">
        If you did not perform this login, someone else may be attempting to access your account. We highly recommend that you change your password immediately.
      </p>
    `;

    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: userEmail,
      subject: 'BachatSaathi Two-Factor Authentication Code',
      html: renderEmailWrapper({
        headerBg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        headerIcon: '🔐',
        title: 'Security Verification',
        subtitle: 'Two-Factor Authentication',
        contentHtml: htmlContent,
        footerText: 'If you did not attempt to login, please secure your account immediately.'
      })
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

exports.sendPasswordChanged = async (userEmail, { name }) => {
  try {
    const htmlContent = `
      <p style="margin-top: 0; font-size: 16px; font-weight: 600; color: #0f172a;">Hi ${name || 'there'},</p>
      <p style="margin-bottom: 20px; color: #475569;">This email confirms that your BachatSaathi account password was successfully updated.</p>
      
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; margin: 25px 0; font-size: 14px; color: #334155; line-height: 1.6;">
        🔒 For security reasons, we never send passwords in emails. If you made this change, you are all set! You can log in using your new credentials.
      </div>

      <p style="color: #ef4444; font-size: 13px; line-height: 1.6; font-weight: 600; margin-top: 25px; background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 6px;">
        ⚠️ <strong>Did not request this change?</strong> If you did not update your password, your account may be compromised. Please use the password reset options on the login screen or contact BachatSaathi support immediately.
      </p>
    `;

    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: userEmail,
      subject: 'BachatSaathi: Your password was changed',
      html: renderEmailWrapper({
        headerBg: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
        headerIcon: '🛡️',
        title: 'Password Changed',
        subtitle: 'Security Update',
        contentHtml: htmlContent,
        footerText: 'You received this notification because your password was modified.'
      })
    });
    return { ok: true };
  } catch (error) {
    console.error('Error sending password-changed email:', error);
    return { ok: false, error: error.message };
  }
};

exports.sendBudgetAlert = async (userEmail, { category, budgetAmount, spentAmount, threshold }) => {
  try {
    const percentUsed = Math.round((spentAmount / budgetAmount) * 100);
    const remainingBudget = budgetAmount - spentAmount;
    const alertColorBg = threshold === 100 
      ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' 
      : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
    const alertTitle = threshold === 100 ? '⚠️ Budget Exceeded' : '🔔 Budget Threshold Reached';
    const subject = threshold === 100 
      ? `BachatSaathi: Budget Exceeded for ${category}`
      : `BachatSaathi: Budget Alert for ${category}`;

    const htmlContent = `
      <p style="margin-top: 0; font-size: 16px; font-weight: 600; color: #0f172a;">Hello,</p>
      <p style="margin-bottom: 25px; color: #475569;">This is an automated alert regarding your budget limits. Your spending in the <strong style="color: #0f172a;">${category}</strong> category has crossed a defined threshold.</p>
      
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 25px; border-radius: 12px; margin: 25px 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
          <tr>
            <td style="width: 50%; vertical-align: top;">
              <p style="margin: 0; color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Budgeted Limit</p>
              <p style="margin: 5px 0 0 0; color: #0f172a; font-size: 22px; font-weight: 800;">₹${budgetAmount.toLocaleString('en-IN')}</p>
            </td>
            <td style="width: 50%; vertical-align: top;">
              <p style="margin: 0; color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Amount Spent</p>
              <p style="margin: 5px 0 0 0; color: ${threshold === 100 ? '#ef4444' : '#d97706'}; font-size: 22px; font-weight: 800;">₹${spentAmount.toLocaleString('en-IN')}</p>
            </td>
          </tr>
        </table>
        
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; font-size: 13px; color: #475569; margin-bottom: 8px; font-weight: 600;">
            <span>Usage: ${percentUsed}%</span>
            <span style="color: ${threshold === 100 ? '#ef4444' : '#d97706'};">${threshold === 100 ? 'Limit Exceeded' : '80% Threshold'}</span>
          </div>
          <div style="background-color: #e2e8f0; height: 10px; border-radius: 5px; overflow: hidden;">
            <div style="background: ${threshold === 100 ? 'linear-gradient(90deg, #f97316, #ef4444)' : 'linear-gradient(90deg, #10b981, #f59e0b)'}; height: 100%; width: ${Math.min(percentUsed, 100)}%;"></div>
          </div>
        </div>
        
        <p style="margin: 15px 0 0 0; font-size: 14px; font-weight: 700; color: ${threshold === 100 ? '#ef4444' : '#d97706'};">
          ${threshold === 100 
            ? `You have exceeded your limit by ₹${Math.abs(remainingBudget).toLocaleString('en-IN')}` 
            : `Remaining balance: ₹${remainingBudget.toLocaleString('en-IN')}`}
        </p>
      </div>

      <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; font-size: 13px; color: #78350f; line-height: 1.5;">
        💡 <strong>Budget Tip:</strong> Consider reviewing recent transactions under <strong>${category}</strong> and try to adjust your spending habits to stay on track this month.
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="http://localhost:3000/budgets" style="background: ${threshold === 100 ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}; color: #ffffff; padding: 12px 26px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; display: inline-block; font-family: 'Outfit', sans-serif;">View Budget Details</a>
      </div>
    `;

    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: userEmail,
      subject,
      html: renderEmailWrapper({
        headerBg: alertColorBg,
        headerIcon: threshold === 100 ? '⚠️' : '🔔',
        title: alertTitle,
        subtitle: 'Budget Alert',
        contentHtml,
        footerText: 'You received this notification because your expenses crossed defined limits.'
      })
    });
    return { ok: true };
  } catch (error) {
    console.error('Error sending budget alert email:', error);
    return { ok: false, error: error.message };
  }
};

exports.sendPasswordChangeOtpEmail = async (userEmail, { name, otp }) => {
  try {
    const htmlContent = `
      <p style="margin-top: 0; font-size: 16px; font-weight: 600; color: #0f172a;">Hello ${name || 'there'},</p>
      <p style="margin-bottom: 25px; color: #475569;">A request was made to update your BachatSaathi password. To authorize this change, please enter the confirmation code below:</p>
      
      <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
        <p style="margin: 0 0 10px 0; color: #991b1b; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Verification Code</p>
        <div style="font-size: 42px; font-weight: 800; color: #b91c1c; letter-spacing: 8px; font-family: 'Outfit', monospace; line-height: 1; margin: 15px 0;">${otp}</div>
        <p style="margin: 0; color: #64748b; font-size: 12px; font-weight: 500;">⏱️ This secure code will expire in <strong style="color: #ef4444;">10 minutes</strong>.</p>
      </div>

      <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 25px 0; font-size: 13px; color: #78350f; line-height: 1.5;">
        ⚠️ <strong>Security Advisory:</strong> If you did not make this request, someone else may be attempting to access your account. Please ignore this email and secure your credentials immediately.
      </div>
    `;

    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: userEmail,
      subject: 'BachatSaathi: Confirm Password Change',
      html: renderEmailWrapper({
        headerBg: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
        headerIcon: '🛡️',
        title: 'Security Verification',
        subtitle: 'Confirm Password Change',
        contentHtml,
        footerText: 'This verification code was requested for a password change.'
      })
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

exports.sendOverBudget = async (userEmail, { category, budgetAmount, spentAmount }) => {
  try {
    const percentUsed = Math.round((spentAmount / budgetAmount) * 100);
    const exceededBy = spentAmount - budgetAmount;
    const subject = `BachatSaathi: Budget Exceeded for ${category}`;

    const htmlContent = `
      <p style="margin-top: 0; font-size: 16px; font-weight: 600; color: #0f172a;">Hello,</p>
      <p style="margin-bottom: 25px; color: #475569;">This is an automated alert letting you know that you have exceeded your budget for the <strong style="color: #0f172a;">${category}</strong> category.</p>
      
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 25px; border-radius: 12px; margin: 25px 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
          <tr>
            <td style="width: 50%; vertical-align: top;">
              <p style="margin: 0; color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Budgeted Limit</p>
              <p style="margin: 5px 0 0 0; color: #0f172a; font-size: 22px; font-weight: 800;">₹${budgetAmount.toLocaleString('en-IN')}</p>
            </td>
            <td style="width: 50%; vertical-align: top;">
              <p style="margin: 0; color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Total Spent</p>
              <p style="margin: 5px 0 0 0; color: #ef4444; font-size: 22px; font-weight: 800;">₹${spentAmount.toLocaleString('en-IN')}</p>
            </td>
          </tr>
        </table>
        
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; font-size: 13px; color: #475569; margin-bottom: 8px; font-weight: 600;">
            <span>Usage: ${percentUsed}%</span>
            <span style="color: #ef4444;">Exceeded by ₹${exceededBy.toLocaleString('en-IN')}</span>
          </div>
          <div style="background-color: #e2e8f0; height: 10px; border-radius: 5px; overflow: hidden;">
            <div style="background: linear-gradient(90deg, #f97316, #ef4444); height: 100%; width: 100%;"></div>
          </div>
        </div>
      </div>

      <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 6px; margin: 20px 0; font-size: 13px; color: #991b1b; line-height: 1.5;">
        💡 <strong>Action Recommended:</strong> You have gone over budget by <strong>₹${exceededBy.toLocaleString('en-IN')}</strong>. Consider reviewing recent transactions or shifting budgets from under-spent categories to balance your sheet.
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="http://localhost:3000/budgets" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: #ffffff; padding: 12px 26px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; display: inline-block; font-family: 'Outfit', sans-serif;">View Budget Details</a>
      </div>
    `;

    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: userEmail,
      subject,
      html: renderEmailWrapper({
        headerBg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        headerIcon: '⚠️',
        title: 'Budget Exceeded',
        subtitle: 'Budget Warning',
        contentHtml,
        footerText: 'You received this notification because your expenses crossed defined limits.'
      })
    });
    return { ok: true };
  } catch (error) {
    console.error('Error sending over-budget email:', error);
    return { ok: false, error: error.message };
  }
};
