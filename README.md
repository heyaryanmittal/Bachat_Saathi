# 💰 BachatSaathi - Advanced Personal Finance Manager

BachatSaathi is a premium, full-stack personal finance management application designed to help users take control of their financial life. Built with the **MERN stack**, it combines enterprise-grade security, comprehensive debt management, and stunning data visualizations into a seamless, **mobile-responsive** user experience.

![BachatSaathi Banner](https://img.shields.io/badge/Bachat-Saathi-blue?style=for-the-badge&logo=google-cloud&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![MERN Stack](https://img.shields.io/badge/MERN-Stack-orange?style=for-the-badge)

---

## 🚀 Key Features

### 🤖 Intelligent AI Assistant
- **Gemini Powered Insights**: Integrated AI companion for real-time financial advice and transaction analysis.
- **Automated Financial Guidance**: Personalized suggestions for budget optimization based on spending patterns.
- **Floating Matrix Interface**: Accessible from anywhere in the app with a premium, animated UI.

### 🌓 Premium Responsive UI
- **Mobile-First Excellence**: Fully optimized for smartphones, tablets, and desktops with zero layout overflow.
- **Adaptive Navigation**: Dynamic sidebar/hamburger menu system designed for professional-grade navigation.
- **Ultra-Modern Aesthetics**: Glassmorphism effects, 3D animations, and smooth Framer Motion transitions.
- **Dynamic Dark/Light Mode**: Seamless theme switching with persistent user preferences.

### 🔐 Advanced Security
- **Secure Authentication**: JWT-based login and registration with case-insensitive email normalization.
- **Two-Factor Authentication (2FA)**: Mandatory/Optional email-based OTP system for account vault protection.
- **Signup Verification**: Multi-step OTP email verification to ensure genuine user registration.
- **Secure Sessions**: Protected routes with automatic session expiry and local storage synchronization.

### 💳 Core Financial Management
- **Multiple Wallet System**: Manage different accounts (Cash, Bank, Credit Card) separately with unique identifiers.
- **Smart Wallet Protection**: 24-hour protection buffer for newly created wallets to prevent accidental deletion.
- **Transaction Tracking**: Comprehensive income/expense logging with instant balance recalculations.
- **Wallet-to-Wallet Transfers**: Move funds between internal accounts with full history tracking.

### 📊 Professional Analytics
- **Dynamic Dashboard**: Interactive Recharts-driven visualizers (Donut, Bar, Line) for cashflow analysis.
- **Financial Exports**: One-click professional exports in **CSV** and **PDF** formats.
- **Monthly Tier System**: Gain ranks and badges based on your monthly financial discipline.

---

## 🛠️ Tech Stack

**Frontend:**
- **Core**: React.js 18 (Vite)
- **Styling**: Tailwind CSS, Framer Motion
- **Icons**: Lucide React
- **Visuals**: Recharts (Custom Gradient Visuals)

**Backend:**
- **Platform**: Node.js & Express.js
- **Database**: MongoDB (Atlas) with Mongoose
- **AI Engine**: Google Gemini API
- **Security**: JWT, BcryptJS, Email-OTP
- **Automation**: Node-cron (Recurring interest & points calculation)

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Vercel account (for production deployment)
- Google AI (Gemini) API Key

### Step-by-Step Setup

1. **Clone & Explore**
   ```bash
   git clone https://github.com/heyaryanmittal/bachatSaathi.git
   cd BachatSaathi
   ```

2. **Environment Configuration**
   The project uses standardized `.env.example` templates. 
   - **Frontend**: `cd frontend && cp .env.example .env`
   - **Backend**: `cd backend && cp .env.example .env`

3. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Configure MONGODB_URI and JWT_SECRET in .env
   npm run dev
   ```

4. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   # Set VITE_API_URL to your backend (default: http://localhost:5001/api)
   npm run dev
   ```

---

## 🚀 Deployment

The project is architected for seamless deployment on **Vercel**:
- **Backend**: Deployed as Serverless Functions using `vercel.json` configurations.
- **Frontend**: Optimized Vite build with SPA routing support.

---

## 📄 License

This project is licensed under the [MIT License](../LICENSE).

---

Built with ❤️ for better financial futures.
