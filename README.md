# Fraud Sentinel

## Overview
Fraud Sentinel is a real-time credit card fraud detection and monitoring system designed to identify suspicious transactions, alert administrators, and manage fraud cases — all from a sleek, modern dashboard.

## Features
- User Authentication (Login, Register, Forgot/Reset Password)
- Fraud Risk Scoring Engine
- Real-time Transaction Monitoring with Live Feed
- Card Management (Add, Block, Unblock)
- Virtual Card Generation (one-time / limited-use)
- Fraud Case Management
- Email Alerts for Fraud Detection
- Dashboard Analytics (Risk Breakdown, Fraud Trends)
- Notification System
- Audit Logs
- Security Center (Login History, Trusted Devices)
- Admin Panel (User Management, Fraud Logs, System Stats)
- Command Center (Live Stats, Threat Level)

## Technologies Used

### Frontend
- React + TypeScript
- Vite
- Tailwind CSS (Dark Theme)
- shadcn/ui Components
- React Query (TanStack Query)
- Wouter (Routing)
- React Hook Form + Zod
- Lucide React Icons
- date-fns

### Backend
- Node.js + Express.js
- TypeScript
- MongoDB (via Mongoose)
- JWT Authentication
- Nodemailer (Email Alerts)
- WebSocket (Live Feed)
- Zod (Request Validation)

### Infrastructure
- Monorepo with pnpm workspaces
- OpenAPI Spec (orval codegen)
- Render (Backend Deployment)
- Vercel (Frontend Deployment)

## How It Works
1. User logs into the system via JWT-based authentication.
2. Transactions are submitted and analyzed in real time by the fraud engine.
3. Risk scores (0–100) and risk levels (low/medium/high/critical) are calculated.
4. Suspicious transactions are flagged or declined automatically.
5. Email alerts and in-app notifications are sent to the user.
6. Fraud cases are automatically created for critical transactions.
7. Cards are auto-blocked on fraud detection.
8. Administrators can review, approve, or decline flagged transactions.
9. Virtual cards can be generated for safe one-time online payments.

## Project Structure
```
Fraud-Sentinel/
├── artifacts/
│   ├── fraud-dashboard/     # React frontend (Vite)
│   └── api-server/          # Express backend
├── lib/
│   ├── api-client-react/    # Generated API hooks
│   ├── api-spec/            # OpenAPI spec + orval codegen
│   ├── api-zod/             # Zod validation schemas
│   └── db/                  # MongoDB models (Mongoose)
└── scripts/
```

## Deployment

### Backend (Render)
- **API URL**: https://fraud-9lts.onrender.com/api

### Frontend (Vercel)
- **Root Directory**: `artifacts/fraud-dashboard`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variable**:
  ```
  VITE_API_URL=https://fraud-9lts.onrender.com/api
  ```

**Quick Deploy to Vercel:**
```bash
npm i -g vercel
cd artifacts/fraud-dashboard
vercel --prod
```

## Recent Fixes & Updates
- Fixed MongoDB ObjectId handling — all IDs now use string types across the full stack
- Fixed card selection in transaction form (cardId string support)
- Fixed virtual card deactivation
- Added refresh buttons with spinner animations to all data pages (Transactions, Cards, Alerts, Notifications, Fraud Cases, Audit Logs, Security, Virtual Cards)
- Added DOM type support to API client library
- Fixed TypeScript compilation errors for Render/Vercel deployment
- Added Vercel deployment configuration (`vercel.json`)

## Author
Harshitha R
