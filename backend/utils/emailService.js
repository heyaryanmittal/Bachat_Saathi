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
exports.sendSignupOtpEmail = async (userEmail, { name, otp }) => {
  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: userEmail,
      subject: 'BachatSaathi Signup OTP - Verify Your Email',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f5; padding: 20px;">
          <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; color: white;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 600;">Verify Your Email</h1>
          </div>
          <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <p style="color: #333; font-size: 16px; margin-bottom: 20px;">Hello <strong>${name || 'there'}</strong>,</p>
            <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 25px;">Thank you for registering with BachatSaathi! To complete your signup, please use the OTP below:</p>
            <div style="background-color: #f0f4ff; border-left: 4px solid #4f46e5; padding: 20px; border-radius: 5px; margin: 25px 0; text-align: center;">
              <p style="margin: 0; color: #666; font-size: 14px; margin-bottom: 10px;">Your One-Time Password:</p>
              <p style="margin: 0; font-size: 36px; font-weight: 700; color: #4f46e5; letter-spacing: 5px;">${otp}</p>
            </div>
            <p style="color: #f44336; font-size: 14px; text-align: center; margin: 20px 0;">⏱️ This code will expire in <strong>10 minutes</strong>.</p>
            <p style="color: #999; font-size: 13px; line-height: 1.6; margin-top: 25px; padding-top: 20px; border-top: 1px solid #eee;">
              If you didn't request this, please ignore this email. Do not share this OTP with anyone.
            </p>
            <p style="color: #999; font-size: 13px; margin-top: 15px;">Best regards,<br><strong>The BachatSaathi Team</strong></p>
          </div>
        </div>
      `
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};
exports.sendWelcomeEmail = async (userEmail, { name, email, password }) => {
  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: userEmail,
      subject: 'Welcome to BachatSaathi - Your Personal Finance Manager',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f5; padding: 20px;">
          <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; color: white;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 600;">🎉 Welcome to BachatSaathi!</h1>
          </div>
          <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <p style="color: #333; font-size: 16px; margin-bottom: 10px;">Hello <strong>${name}</strong>,</p>
            <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 25px;">Welcome aboard! Your BachatSaathi account has been successfully created. We're excited to help you manage your finances better.</p>
            <div style="background-color: #f0f4ff; border-left: 4px solid #4f46e5; padding: 20px; border-radius: 5px; margin: 25px 0;">
              <p style="margin: 0; color: #666; font-size: 14px; margin-bottom: 12px;"><strong>Your Login Credentials:</strong></p>
              <p style="margin: 8px 0; color: #333; font-size: 14px;"><strong>Email:</strong> <code style="background-color: #f5f5f5; padding: 2px 6px; border-radius: 3px;">${email}</code></p>
              <p style="margin: 8px 0; color: #333; font-size: 14px;"><strong>Password:</strong> <code style="background-color: #f5f5f5; padding: 2px 6px; border-radius: 3px;">${password}</code></p>
            </div>
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #856404; font-size: 13px;">🔒 <strong>For security:</strong> We recommend changing your password after your first login.</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000/dashboard" style="background-color: #4f46e5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: 600; display: inline-block;">Go to Dashboard</a>
            </div>
            <p style="color: #999; font-size: 13px; line-height: 1.6; margin-top: 25px; padding-top: 20px; border-top: 1px solid #eee;">
              If you didn't create this account, please contact our support team immediately.
            </p>
            <p style="color: #999; font-size: 13px; margin-top: 15px;">Best regards,<br><strong>The BachatSaathi Team</strong></p>
          </div>
        </div>
      `
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};
exports.send2FAOtpEmail = async (userEmail, { name, otp }) => {
  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: userEmail,
      subject: 'BachatSaathi Two-Factor Authentication Code',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f5; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; color: white;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 600;">🔐 BachatSaathi-Your personal financial manager</h1>
          </div>
          <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <p style="color: #333; font-size: 16px; margin-bottom: 20px;">Hello <strong>${name || 'there'}</strong>,</p>
            <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 25px;">A login attempt has been detected on your BachatSaathi account. Please use the code below to verify it's you:</p>
            <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; border-radius: 5px; margin: 25px 0; text-align: center;">
              <p style="margin: 0; color: #666; font-size: 14px; margin-bottom: 10px;">Your Verification Code:</p>
              <p style="margin: 0; font-size: 36px; font-weight: 700; color: #10b981; letter-spacing: 5px;">${otp}</p>
            </div>
            <p style="color: #f44336; font-size: 14px; text-align: center; margin: 20px 0;">⏱️ This code will expire in <strong>10 minutes</strong>.</p>
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #856404; font-size: 13px;">⚠️ <strong>Never share this code with anyone.</strong> BachatSaathi will never ask for it via email or chat.</p>
            </div>
            <p style="color: #999; font-size: 13px; line-height: 1.6; margin-top: 25px; padding-top: 20px; border-top: 1px solid #eee;">
              If you didn't attempt to log in, please change your password immediately.
            </p>
            <p style="color: #999; font-size: 13px; margin-top: 15px;">Best regards,<br><strong>The BachatSaathi Security Team</strong></p>
          </div>
        </div>
      `
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};
exports.sendPasswordChanged = async (userEmail, { name, newPassword }) => {
  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: userEmail,
      subject: 'BachatSaathi: Your password was changed',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f5; padding: 20px;">
          <div style="background: linear-gradient(135deg, #111827, #374151); padding: 20px; text-align: center; border-radius: 10px 10px 0 0; color: white;">
            <h1 style="margin: 0; font-size: 20px; font-weight: 600;">Password Changed</h1>
          </div>
          <div style="background-color: white; padding: 20px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
            <p style="color: #333; font-size: 15px;">Hi <strong>${name || 'there'}</strong>,</p>
            <p style="color: #555; font-size: 15px; line-height: 1.6;">This is to confirm that your BachatSaathi account password was successfully changed.</p>
            <p style="color: #555; font-size: 15px; line-height: 1.6;">If you requested this change, no further action is required. If you did not request this change, please reset your password immediately or contact support.</p>
            ${newPassword ? `
              <div style="margin-top:12px; padding:12px; background:#f8fafc; border-radius:6px; border:1px solid #e6eef8;">
                <p style="margin:0 0 8px 0; font-size:14px; color:#111827;">Your new password:</p>
                <div style="background:#111827;color:#fff;padding:10px;border-radius:6px;display:inline-block;font-family:monospace;">${newPassword}</div>
              </div>
            ` : ''}
            <div style="background:#f0f4ff; border-left:4px solid #2563eb; padding:12px; border-radius:6px; margin-top:16px;">
              <p style="margin:0; font-size:13px; color:#374151;">We do not recommend sharing your password. If you want to view the new password, please check the app or use the password reset flow.</p>
            </div>
            <p style="color:#999; font-size:12px; margin-top:18px;">If you didn't change your password, please secure your account immediately.</p>
            <p style="color:#999; font-size:12px;">Best regards,<br/><strong>The BachatSaathi Team</strong></p>
          </div>
        </div>
      `
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
    const alertColor = threshold === 100 ? '#f44336' : '#ff9800';
    const alertTitle = threshold === 100 ? '⚠️ Budget Exceeded!' : '🔔 Budget Alert (80%)';
    const subject = threshold === 100 
      ? `BachatSaathi: Budget Exceeded for ${category}`
      : `BachatSaathi: Budget Alert for ${category}`;
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: userEmail,
      subject,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f5; padding: 20px;">
          <div style="background: linear-gradient(135deg, ${alertColor}, #d32f2f); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; color: white;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 600;">${alertTitle}</h1>
          </div>
          <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <p style="color: #333; font-size: 16px; margin-bottom: 20px;">Your <strong>${category}</strong> budget ${threshold === 100 ? 'has been exceeded' : 'is running low'}.</p>
            <div style="background-color: #f5f5f5; border-left: 4px solid ${alertColor}; padding: 20px; border-radius: 5px; margin: 25px 0;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px;">
                <div>
                  <p style="margin: 0; color: #999; font-size: 13px; text-transform: uppercase;">Budget Amount</p>
                  <p style="margin: 5px 0 0 0; color: #333; font-size: 20px; font-weight: 700;">₹${budgetAmount.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p style="margin: 0; color: #999; font-size: 13px; text-transform: uppercase;">Amount Spent</p>
                  <p style="margin: 5px 0 0 0; color: ${threshold === 100 ? '#f44336' : '#ff9800'}; font-size: 20px; font-weight: 700;">₹${spentAmount.toLocaleString('en-IN')}</p>
                </div>
              </div>
              <div style="background-color: white; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                  <span style="font-size: 14px; color: #666;">Usage: <strong>${percentUsed}%</strong></span>
                  <span style="font-size: 12px; color: #999;">${threshold === 100 ? 'Over Budget' : '80% Threshold'}</span>
                </div>
                <div style="background-color: #e0e0e0; height: 8px; border-radius: 4px; overflow: hidden;">
                  <div style="background-color: ${alertColor}; height: 100%; width: ${Math.min(percentUsed, 100)}%; border-radius: 4px;"></div>
                </div>
              </div>
              ${threshold === 100 
                ? `<p style="margin: 0; color: #f44336; font-size: 14px; font-weight: 600;">You have exceeded your budget by ₹${Math.abs(remainingBudget).toLocaleString('en-IN')}</p>` 
                : `<p style="margin: 0; color: #ff9800; font-size: 14px; font-weight: 600;">Remaining Budget: ₹${remainingBudget.toLocaleString('en-IN')}</p>`}
            </div>
            <div style="background-color: #fef3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #856404; font-size: 13px;">💡 <strong>Tip:</strong> Review your spending in the ${category} category and adjust if needed.</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000/budgets" style="background-color: ${alertColor}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: 600; display: inline-block;">View Budget Details</a>
            </div>
            <p style="color: #999; font-size: 13px; line-height: 1.6; margin-top: 25px; padding-top: 20px; border-top: 1px solid #eee;">
              You can manage your budget alerts in your profile settings. This is an automated message, please do not reply.
            </p>
            <p style="color: #999; font-size: 13px; margin-top: 15px;">Best regards,<br><strong>The BachatSaathi Team</strong></p>
          </div>
        </div>
      `
    });
    return { ok: true };
  } catch (error) {
    console.error('Error sending budget alert email:', error);
    return { ok: false, error: error.message };
  }
};
exports.sendPasswordChangeOtpEmail = async (userEmail, { name, otp }) => {
  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: userEmail,
      subject: 'BachatSaathi: Confirm Password Change',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f5; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ef4444, #b91c1c); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; color: white;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 600;">Security Verification</h1>
          </div>
          <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <p style="color: #333; font-size: 16px; margin-bottom: 20px;">Hello <strong>${name || 'there'}</strong>,</p>
            <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 25px;">You requested to change your BachatSaathi password. Please enter the following code to verify your request:</p>
            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 5px; margin: 25px 0; text-align: center;">
              <p style="margin: 0; color: #666; font-size: 14px; margin-bottom: 10px;">Verification Code:</p>
              <p style="margin: 0; font-size: 36px; font-weight: 700; color: #b91c1c; letter-spacing: 5px;">${otp}</p>
            </div>
            <p style="color: #f44336; font-size: 14px; text-align: center; margin: 20px 0;">⏱️ This code will expire in <strong>10 minutes</strong>.</p>
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #856404; font-size: 13px;">⚠️ <strong>Security Notice:</strong> If you did not request this change, please contact support and secure your account immediately.</p>
            </div>
            <p style="color: #999; font-size: 13px; margin-top: 15px;">Best regards,<br><strong>The BachatSaathi Security Team</strong></p>
          </div>
        </div>
      `
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
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: userEmail,
      subject,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background:#f4f6f8; padding:24px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:680px; margin:0 auto;">
            <tr>
              <td style="background:linear-gradient(90deg,#ef4444,#dc2626); padding:28px 36px; border-radius:8px 8px 0 0; color:#fff; text-align:left;">
                <h2 style="margin:0; font-size:20px; font-weight:700;">⚠️ Budget Exceeded</h2>
                <p style="margin:6px 0 0 0; opacity:0.95; font-size:14px;">Your ${category} budget has been exceeded</p>
              </td>
            </tr>
            <tr>
              <td style="background:#ffffff; padding:24px 28px; border-radius:0 0 8px 8px; box-shadow:0 6px 18px rgba(15,23,42,0.06);">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:50%; vertical-align:top; padding-right:12px;">
                      <div style="font-size:12px; color:#6b7280; text-transform:uppercase; letter-spacing:0.6px;">Budgeted</div>
                      <div style="font-size:20px; font-weight:700; color:#111827; margin-top:6px;">₹${budgetAmount.toLocaleString('en-IN')}</div>
                    </td>
                    <td style="width:50%; vertical-align:top; padding-left:12px;">
                      <div style="font-size:12px; color:#6b7280; text-transform:uppercase; letter-spacing:0.6px;">Amount Spent</div>
                      <div style="font-size:20px; font-weight:700; color:#b91c1c; margin-top:6px;">₹${spentAmount.toLocaleString('en-IN')}</div>
                    </td>
                  </tr>
                </table>
                <div style="margin-top:18px;">
                  <div style="height:12px; background:#e6eef8; border-radius:8px; overflow:hidden;">
                    <div style="width:${Math.min(percentUsed, 200)}%; background:linear-gradient(90deg,#f97316,#ef4444); height:100%;"></div>
                  </div>
                  <div style="margin-top:8px; font-size:13px; color:#374151;">Usage: <strong>${percentUsed}%</strong> — Exceeded by <strong>₹${exceededBy.toLocaleString('en-IN')}</strong></div>
                </div>
                <div style="margin-top:20px; padding:14px; background:#fff7ed; border-left:4px solid #f59e0b; border-radius:6px;">
                  <div style="font-size:13px; color:#92400e;"><strong>Tip:</strong> Review recent transactions in this category and consider transferring funds or adjusting upcoming expenses.</div>
                </div>
                <div style="text-align:center; margin-top:22px;">
                  <a href="http://localhost:3000/budgets" style="background:#ef4444; color:#fff; display:inline-block; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:700; font-size:14px;">Review My Budget</a>
                </div>
                <hr style="border:none; border-top:1px solid #f1f5f9; margin:22px 0;" />
                <div style="font-size:12px; color:#6b7280;">You can manage your budget alerts in your <a href="http://localhost:3000/profile" style="color:#2563eb; text-decoration:none;">Profile Settings</a>.</div>
                <div style="margin-top:14px; font-size:12px; color:#9ca3af;">© ${new Date().getFullYear()} BachatSaathi</div>
              </td>
            </tr>
          </table>
        </div>
      `
    });
    return { ok: true };
  } catch (error) {
    console.error('Error sending over-budget email:', error);
    return { ok: false, error: error.message };
  }
};
