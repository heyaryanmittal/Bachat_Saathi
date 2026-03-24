# 💰 BachatSaathi - Advanced Personal Finance Manager

BachatSaathi is a premium, full-stack personal finance management application designed to help users take control of their financial life. Built with the **MERN stack**, it combines enterprise-grade security, comprehensive debt management, and stunning data visualizations into a seamless user experience.

![BachatSaathi Banner](https://img.shields.io/badge/Bachat-Saathi-blue?style=for-the-badge&logo=google-cloud&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![MERN Stack](https://img.shields.io/badge/MERN-Stack-orange?style=for-the-badge)

---

## 🚀 Key Features

### 🏢 Landing Page & Branding
- **Premium Marketing Presence**: A modern, 3D-animated landing page with a clear conversion funnel.
- **Showcase Sections**: Comprehensive feature highlights, testimonials, and "About Us" statistics.
- **Functional Contact System**: Integrated contact form with backend storage and admin management for user inquiries.
- **Animated Experience**: Dynamic blob animations, floating 3D icons, and smooth staggered transitions.

### 🔐 Advanced Security
- **Secure Authentication**: JWT-based login and registration system.
- **Two-Factor Authentication (2FA)**: Email-based OTP system for extra account protection during login and setup.
- **Signup Verification**: OTP-based email verification for new account creation.
- **Secure Sessions**: Protected routes and automatic token management.

### 💳 Core Financial Management
- **Multiple Wallet System**: Manage different accounts (Cash, Bank, Credit Card) separately.
- **Smart Wallet Protection**: 24-hour creation/transaction protection to prevent accidental wallet deletion.
- **Transaction Tracking**: Daily income and expense logging with automatic balance updates.
- **Wallet-to-Wallet Transfers**: Seamlessly move funds between wallets with real-time balance adjustment.
- **Partial Payment Settlement**: Record payments with numerical and word-format amount displays for clarity.

### 📊 Professional Analytics
- **Dynamic Dashboard**: Glassmorphism-based UI with interactive charts (Donut, Bar, Line).
- **Spending Reports**: Detailed category-wise breakdowns and trend analysis.
- **Budget Performance**: Contrast planned vs. actual spending with color-coded health indicators.
- **Cash Flow Analysis**: Monitor daily money movement and net flow automatically.
- **Financial Exports**: Download professional reports in **CSV** and **PDF** formats.

### 📉 Debt & Goal Tracker
- **Comprehensive Debt Manager**: Track personal, credit, and business loans.
- **Interest Calculation Engine**: Automated monthly compound interest calculations with preview mode.
- **Savings Goals**: Set financial targets with real-time progress bars and achievement tracking.

### 🏆 Gamification & Rewards
- **Points System**: Earn points for financial discipline (staying under budget, debt payments, savings).
- **Leaderboard**: Compare financial milestones with other users (Global Ranking).
- **Achievements**: Unlock badges for milestones like "Budget Master," "Goal Crusher," and "Debt Destroyer."

---

## 🛠️ Tech Stack

**Frontend:**
- **Core**: React.js with React Router
- **Styling**: Tailwind CSS, Vanilla CSS (3D Animations, Glassmorphism)
- **State Management**: React Hooks & Context API
- **Charts**: Recharts (Custom Gradient Visuals)
- **Forms**: React Hook Form with validation

**Backend:**
- **Platform**: Node.js & Express.js
- **Database**: MongoDB with Mongoose
- **Auth**: JWT, BcryptJS
- **Communication**: Nodemailer (OTP & Alert Emails)
- **Automation**: Node-cron (Interest calculations & Recurring tasks)

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas)
- SMTP Server (e.g., Mailtrap, Gmail) for OTP emails

### Step-by-Step Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/heyaryanmittal/bachatSaathi.git
   cd BachatSaathi
   ```

2. **Backend Configuration**
   ```bash
   cd backend
   npm install
   # Create .env file based on .env.example
   ```
   *Required Environment Variables:*
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_secret_key
   SMTP_HOST=your_smtp_host
   SMTP_USER=your_email
   SMTP_PASS=your_password
   ```

3. **Frontend Configuration**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Running the App**
   - **Start Backend:** `cd backend && npm run dev`
   - **Start Frontend:** `cd frontend && npm run dev`

---

## 📄 License

This project is licensed under the [MIT License](../LICENSE).

---

Built with ❤️ for better financial futures.
