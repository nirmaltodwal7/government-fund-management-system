# 🏛️ Gover

> **NIDHI-SETU** – *A Secure Bridge Between Citizens and Government Funds*

---

## 📖 Table of Contents

1. Introduction
2. Problem Statement
3. Objectives
4. System Overview
5. User Roles
6. Functional Features
7. Non-Functional Requirements
8. Technology Stack
9. System Architecture
10. Security & AI Integration
11. Installation & Setup
12. Project Workflow
13. Screenshots
14. Future Enhancements
15. Learning Outcomes
16. Conclusion
17. Author & Credits

---

## 1️⃣ Introduction

The **Government Fund Management System (NIDHI-SETU)** is a full-stack, AI-enabled web application designed to ensure **transparent, secure, and accurate disbursement of government welfare and pension funds**.

In many welfare schemes, large amounts of public money are lost due to:

* Payments made to deceased beneficiaries
* Duplicate or fake identities
* Manual verification delays
* Poor coordination between government departments

NIDHI-SETU solves these issues by acting as a **digital verification bridge** between citizens and government systems using **modern web technologies, AI-based liveness detection, and real-time cloud services**.

---

## 2️⃣ Problem Statement

Traditional fund management systems suffer from:

* ❌ Manual document verification
* ❌ Delayed updates in beneficiary records
* ❌ High chances of fraud and misuse
* ❌ Lack of real-time monitoring
* ❌ Low transparency and accountability

As a result, welfare benefits often fail to reach the rightful recipients.

---

## 3️⃣ Objectives

The main objectives of NIDHI-SETU are:

* ✅ Ensure **only eligible and living beneficiaries** receive government funds
* ✅ Automate beneficiary verification using **AI & cloud services**
* ✅ Eliminate duplicate, fake, and fraudulent records
* ✅ Provide a **centralized admin dashboard** for monitoring
* ✅ Improve transparency, trust, and efficiency in fund distribution
* ✅ Reduce manual workload and human errors

---

## 4️⃣ System Overview

NIDHI-SETU is a **role-based, web-based platform** consisting of:

* A **Beneficiary Portal** for citizens
* An **Admin Portal** for government authorities

The system integrates:

* Real-time authentication
* AI-powered face & voice verification
* Secure cloud database
* RESTful backend APIs

---

## 5️⃣ User Roles

### 👤 Beneficiary (Citizen)

* Secure login & authentication
* AI-based face verification (liveness check)
* Voice verification via AI call
* View fund status and verification results
* Secure access to personal records

### 🛠️ Administrator (Government Authority)

* Secure admin login
* View and manage beneficiary records
* Monitor verification activities
* Identify suspicious or duplicate cases
* Approve or block fund disbursement
* View analytics and system logs

---

## 6️⃣ Functional Features

### 🔐 Authentication & Authorization

* Firebase Authentication
* Email / OTP based login
* Role-based access control (User / Admin)

### 🧠 AI-Based Verification

* **3D Face Verification** using Supabase
* **Voice Verification** using Twilio AI
* Liveness detection to prevent spoofing

### 📊 Fund & Verification Management

* Real-time beneficiary verification status
* Automated fraud detection
* Secure fund approval workflow
* Centralized admin dashboard

### ☁️ Cloud & Database

* Firebase Realtime Database
* Secure cloud hosting
* Instant data synchronization

---

## 7️⃣ Non-Functional Requirements

* 🔒 High security & data privacy
* ⚡ Fast response time
* 📈 Scalable architecture
* 📱 Responsive design (mobile-friendly)
* ♻️ High availability & reliability

---

## 8️⃣ Technology Stack

### Frontend

* HTML5
* CSS3
* JavaScript
* React.js
* Tailwind CSS

### Backend

* Node.js
* Express.js
* RESTful APIs

### Database & Auth

* Firebase Authentication
* Firebase Realtime Database

### AI & Integrations

* Supabase (3D Face Verification)
* Twilio AI (Voice Authentication)

---

## 9️⃣ System Architecture

```
Beneficiary / Admin
        ↓
   React.js UI
        ↓
 Node.js + Express APIs
        ↓
 Firebase Authentication
 Firebase Realtime Database
        ↓
 AI Services (Supabase, Twilio)
```

---

## 🔐 Security & AI Integration

* AES data encryption
* Image hashing for face data
* Secure API endpoints
* Role-based authorization
* Cloud-secured database access
* AI-based fraud detection logic

---

## ⚙️ Installation & Setup

```bash
# Clone the repository
git clone https://github.com/your-username/government-fund-management-system.git

# Navigate to project directory
cd government-fund-management-system

# Install dependencies
npm install

# Run backend server
npm start

# Run frontend
npm run dev
```

### 🔑 Environment Variables

Create a `.env` file and configure:

* Firebase keys
* Supabase credentials
* Twilio API keys

---

## 🔄 Project Workflow

1. User/Admin logs in securely
2. Beneficiary undergoes face verification
3. Voice verification is performed
4. Data is verified in real-time
5. Admin reviews verification results
6. Funds are approved or blocked
7. Logs and analytics are updated

---

## 📸 Screenshots

* Home Page
* Login Page
* Beneficiary Dashboard
* Face Verification
* Admin Dashboard

*(Add images here)*

---

## 🚀 Future Enhancements

* Blockchain-based fund tracking
* Mobile apps (Android & iOS)
* Multilingual support
* Offline/SMS-based verification
* Advanced AI fraud prediction
* National-level scalability

---

## 🎓 Learning Outcomes

* Full Stack Web Development
* Cloud authentication & deployment
* AI integration in real systems
* Secure system design
* REST API development
* Scalable architecture planning

---

## 🏁 Conclusion

NIDHI-SETU is a **secure, intelligent, and citizen-centric e-Governance solution** that demonstrates the effective use of **AI, cloud computing, and full-stack development**.
The system ensures transparency, prevents fraud, and strengthens trust between **citizens and government institutions**.

---

## 👨‍💻 Author

**Nirmal Todwal**
B.Tech – Information Technology
Poornima College of Engineering, Jaipur

