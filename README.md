# 💰 BachatSaathi - The Ultimate Financial Management Ecosystem

BachatSaathi is a sophisticated, full-stack personal finance ecosystem designed to transform the way you interact with your money. Merging enterprise-grade financial tracking with an addictive gamified experience, BachatSaathi turns the mundane task of budgeting into an engaging journey towards financial freedom.

Built with the modern **MERN stack** (MongoDB, Express, React, Node.js), it features a premium glassmorphic UI, real-time AI-powered insights, and a competitive edge that keeps you motivated.

---

## 🌟 The BachatSaathi Experience

### 🚀 Centralized Dashboard
Your financial nerve center. Get an instantaneous snapshot of your total net worth, monthly income vs. expenses, and upcoming financial commitments through beautiful, interactive data visualizations.
- **Real-time Analytics**: Dynamic Recharts and Chart.js integration for visual cashflow trends.
- **Quick Actions**: One-click access to add transactions or transfer funds.
- **Financial Pulse**: Monitoring your savings rate and budget adherence in real-time.

### 🏦 Multi-Wallet Architecture
Manage your entire portfolio across multiple virtual containers.
- **Account Segregation**: Separate wallets for Cash, Bank Accounts, Credit Cards, and Savings.
- **Smart Protection**: Industry-inspired 24-hour protection buffer for new wallets to ensure data integrity.
- **Inter-Wallet Transfers**: Seamlessly move funds between wallets with automated history tracking and zero data loss.

### 💸 Transaction & Transfer Engine
A robust system designed for precision and speed.
- **Granular Categorization**: Tag every penny with custom categories (Food, Rent, Investment, etc.).
- **Search & Filter**: Find any transaction across history using advanced metadata filtering.
- **Full History**: Audit logs for every movement of money, ensuring total transparency.

### 📉 Smart Budgeting & Goal Tracking
Stop guessing where your money goes; tell it where to go.
- **Dynamic Budgets**: Set monthly limits per category and receive alerts as you approach thresholds.
- **Aspirational Goals**: Visualize your dreams—from a new car to retirement. Track progress with percentage-based visualizers.
- **Automated Calculations**: Dynamic interest and progress updates powered by backend cron jobs.

### 📑 Debt Management Vault
Take control of your liabilities before they control you.
- **Comprehensive Tracking**: Log loans, credit card debt, and personal IOUs.
- **Repayment Planner**: Visual indicators showing how close you are to being debt-free.
- **Interest Monitoring**: Keep track of growing liabilities in real-time.

---

## 🎮 Gamification: Finance Made Fun

BachatSaathi revolutionizes financial discipline by borrowing mechanics from the gaming world.

- **Bachat Points (BP)**: Earn points for every "positive" financial action—like staying under budget or hitting a goal.
- **Achievements System**: Unlock badges and titles for milestones:
    - *The Saver*: For consistently hitting saving goals.
    - *Debt Crusher*: For clearing major liabilities.
    - *Budget Master*: For 3 months of perfect budget adherence.
- **Global Leaderboard**: Compete with other BachatSaathi users. Climb the ranks by being the most disciplined saver.
- **Leveling System**: Transform from a "Financial Novice" to a "Wealth Whisperer" based on your activity and discipline.

---

## 🤖 Bachat Saathi AI (Powered by Google Gemini)

Meet your personal financial advisor, available 24/7.
- **Natural Language Interaction**: Chat with your data. Ask "How much did I spend on coffee last month?" or "Can I afford a new laptop?"
- **Intelligent Insights**: AI analyzes your spending patterns to suggest where you can cut costs.
- **Financial Education**: Ask the AI for advice on investing, saving, or understanding complex financial terms.
- **Floating Matrix UI**: A sleek, animated AI assistant window that follows you throughout the app.

---

## 📊 Analytics & Professional Reporting

Data is power. BachatSaathi provides the tools to harness it.
- **Monthly Roundups**: Automated summaries of your financial performance.
- **Professional Exports**: Generate high-quality **PDF** and **CSV** reports for your records or tax purposes.
- **Category Deep-Dives**: View donut charts and bar graphs that break down your spending habits.

---

## 🛠️ Advanced Tech Stack

### Frontend
- **Framework**: React 18 with Vite for lightning-fast performance.
- **State Management**: **Zustand** for lightweight, blazing-fast globally shared state.
- **Styling**: **Tailwind CSS** with custom glassmorphism components.
- **Animations**: **Framer Motion** & **React Spring** for a premium "Apple-like" feel.
- **Visuals**: Recharts & Chart.js for enterprise-grade data visualization.

### Backend
- **Core**: Node.js & Express.js.
- **Database**: MongoDB (Atlas) with Mongoose for structured yet flexible data modeling.
- **Security**: 
    - **JWT (JSON Web Tokens)** for stateless, secure session management.
    - **BcryptJS** for military-grade password hashing.
    - **Email OTP**: Multi-round verification for registration and sensitive actions.
- **Automation**: **Node-cron** for background processing (Interest, Points, Stats).
- **Communication**: **Nodemailer** for automated financial alerts and OTPs.

---

## ⚙️ Installation & Developer Guide

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas Account
- Google Gemini API Key
- SMTP Credentials (for OTP/Emails)

### Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone https://github.com/heyaryanmittal/bachatSaathi.git
   cd BachatSaathi
   ```

2. **Backend Configuration**
   - Navigate to `backend/`
   - Create a `.env` file from `.env.example`
   - Mandatory fields:
     ```env
     PORT=5001
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_signing_key
     GEMINI_API_KEY=your_google_ai_key
     EMAIL_USER=your_smtp_user
     EMAIL_PASS=your_smtp_password
     ```
   - Install and Start:
     ```bash
     npm install
     npm run dev
     ```

3. **Frontend Configuration**
   - Navigate to `frontend/`
   - Create a `.env` file from `.env.example`
   - Fields:
     ```env
     VITE_API_BASE_URL=http://localhost:5001/api
     ```
   - Install and Start:
     ```bash
     npm install
     npm run dev
     ```

---

## 🛡️ Security & Privacy
- **End-to-End Encryption**: All sensitive data is hashed before being stored.
- **Route Guards**: Sophisticated middleware determines access to sensitive financial endpoints.
- **Sanitization**: Input validation via `express-validator` to prevent XSS and Injection attacks.

---

## 🚀 Future Roadmap
- [ ] **Bank Sync**: Integration with Plaid for real-time automated bank imports.
- [ ] **Mobile App**: Native iOS and Android versions via React Native.
- [ ] **Investment Tracking**: Real-time stock and crypto portfolio monitoring.
- [ ] **Community Forums**: Share budgeting tips and saving strategies.

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <p>Built with ❤️ by the BachatSaathi Team</p>
  <p><i>Empowering your financial journey, one rupee at a time.</i></p>
</div>
