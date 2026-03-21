const cron = require('node-cron');
const Debt = require('../models/Debt');
const User = require('../models/User');
const emailService = require('../utils/emailService');
const sendDebtReminders = async () => {
  try {
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);
    const upcomingDebts = await Debt.find({
      dueDate: {
        $gte: now,
        $lte: threeDaysFromNow
      },
      status: 'active'
    }).populate('userId', 'email name emailNotificationsEnabled');
    if (upcomingDebts.length === 0) {
      console.log('No debt reminders to send');
      return;
    }
    const debtsByUser = {};
    upcomingDebts.forEach(debt => {
      if (!debtsByUser[debt.userId._id]) {
        debtsByUser[debt.userId._id] = {
          user: debt.userId,
          debts: []
        };
      }
      debtsByUser[debt.userId._id].debts.push(debt);
    });
    for (const userId in debtsByUser) {
      const { user, debts } = debtsByUser[userId];
        if (user.emailNotificationsEnabled === false) {
          console.log(`Skipping debt reminders for ${user.email} (email notifications disabled)`);
          continue;
        }
      const debtDetails = debts.map(debt => `
        <tr>
          <td>${debt.title}</td>
          <td>${debt.type}</td>
          <td>₹${debt.remainingAmount.toLocaleString()}</td>
          <td>${debt.dueDate.toLocaleDateString()}</td>
        </tr>
      `).join('');
      const emailContent = {
        from: '"BachatSaathi" <notifications@bachatsaathi.com>',
        to: user.email,
        subject: `Debt Reminder: ${debts.length} payment${debts.length > 1 ? 's' : ''} due in 3 days`,
        html: `
          <h2>Debt Payment Reminder</h2>
          <p>Hi ${user.name},</p>
          <p>This is a reminder that you have ${debts.length} debt payment${debts.length > 1 ? 's' : ''} due within the next 3 days.</p>
          <table border="1" style="border-collapse: collapse; width: 100%; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="padding: 8px;">Title</th>
                <th style="padding: 8px;">Type</th>
                <th style="padding: 8px;">Amount Due</th>
                <th style="padding: 8px;">Due Date</th>
              </tr>
            </thead>
            <tbody>
              ${debtDetails}
            </tbody>
          </table>
          <p>Please ensure you have sufficient funds in your account to make these payments on time.</p>
          <p>You can view and manage your debts in the BachatSaathi app.</p>
          <p>Best regards,<br>BachatSaathi Team</p>
        `
      };
      const emailSent = await emailService.sendBudgetAlert(user.email, emailContent);
      if (emailSent) {
        console.log(`Debt reminder sent to ${user.email}`);
      } else {
        console.error(`Failed to send debt reminder to ${user.email}`);
      }
    }
    console.log(`Sent ${Object.keys(debtsByUser).length} debt reminder emails`);
  } catch (error) {
    console.error('Error sending debt reminders:', error);
  }
};
cron.schedule('0 9 * * *', sendDebtReminders);
setTimeout(sendDebtReminders, 5000); 
module.exports = {
  sendDebtReminders
};
