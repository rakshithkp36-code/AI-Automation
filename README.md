# FlowPilot AI — Intelligent Enterprise Workflow Automation Platform

> **Hackathon Theme: SMART AUTOMATION**  
> Transform manual operational friction into automated, AI-assisted self-driving processes.

---

## 1. Overview & Core Mission

Organizations spend thousands of hours on repetitive manual workflows: expense reimbursements, purchase orders, compliance verification, client onboarding, and IT equipment requests. These workflows lead to days of delay, human error, and massive operational costs.

**FlowPilot AI** solves this with an end-to-end intelligent automation platform:
$$\text{Manual Problem} \longrightarrow \text{AI Process Analysis} \longrightarrow \text{Automated Workflow} \longrightarrow \text{Autonomous Execution} \longrightarrow \text{Monitoring} \longrightarrow \text{Optimization}$$

---

## 2. Hackathon Showcase Scenario: Automated Employee Expense Approval

FlowPilot AI comes pre-loaded with the **Automated Employee Expense Approval** scenario:

| Metric | Before FlowPilot (Manual) | After FlowPilot AI (Automated) |
|---|---|---|
| **Average Processing Time** | **2.5 Days** | **4.2 Hours** |
| **Manual Handoffs** | **8 Steps** (Spreadsheets, Emails) | **3 Steps** (Fulfillment & Approval) |
| **Automation Rate** | **0%** | **85% Hands-off Autonomous** |
| **Estimated Operational Time Saved** | Baseline | **68% Capacity Reclaimed** |

### What happens in the Automated Pipeline:
1. **Employee Submission Intake (Trigger)**: Captures claim data and receipts.
2. **AI Policy & Threshold Evaluation (AI Decision)**: Gemini AI evaluates amount, line items, and risk score.
3. **Dynamic Multi-Tier Approval (Approval)**:
   - `< $1,000` $\rightarrow$ Standard Manager Review
   - `$1,000 – $10,000` $\rightarrow$ Department Head + Manager
   - `> $10,000` $\rightarrow$ Finance Director + Executive Sign-Off
4. **Finance Verification Task (Task)**: Automatically creates an actionable task in the finance queue.
5. **ERP General Ledger Sync (Data Update)**: Automatically posts the voucher to the accounting ledger.
6. **Real-Time Submitter Dispatch (Notification)**: Sends email and in-app confirmation with payout date.
7. **AI Audit & Metric Report (Report)**: Generates execution telemetry and logs SLA compliance.

---

## 3. Technology Stack

- **Frontend**:
  - **React 18** with **TypeScript**
  - **Tailwind CSS** with a custom dark enterprise SaaS aesthetic (glassmorphism, subtle glowing accents)
  - **React Router v7** with protected routing and organization context
  - **@xyflow/react (React Flow)** for the visual graph workflow builder
  - **Recharts** for interactive throughput, latency comparison, and ROI charts
  - **Canvas Confetti** for interactive user feedback
  - **Lucide Icons**
- **Backend**:
  - **Node.js** & **Express.js** with **TypeScript**
  - **@google/genai** connecting server-side to **Gemini 2.5 Flash**
  - **Zod** schema validation for all inputs, database records, and AI outputs
  - **bcryptjs** password hashing & **jsonwebtoken** (JWT) authentication
- **Database**:
  - **PostgreSQL**
  - Out-of-the-box persistent embedded PostgreSQL engine (**PGlite**) saved to disk snapshots (`./data/flowpilot_snapshot.tar.gz`)
  - Full support for remote PostgreSQL / Supabase via `DATABASE_URL`

---

## 4. Key Features & Modules

### 4.1 Authentication & Multi-Tenant Organization Isolation
- User sign-up, sign-in, session persistence, and role-based access control:
  - **Admin**: Full workspace configuration and analytics
  - **Manager**: Approval lead and operational manager
  - **Employee**: Task specialist and request submitter
  - **Automation Operator**: AI pipeline supervisor
- Strict organization isolation enforced server-side on every API endpoint.

### 4.2 Problem Discovery & AI Process Analyzer
- 11-field problem intake capturing processing time, frequency, tools, cost, and pain points.
- **AI Process Analyzer** powered by Gemini:
  - Identifies operational bottlenecks with severity ranking (Low, Medium, High)
  - Flags repetitive manual tasks with automation potential
  - Recommends automation opportunities with quantitative impact
  - Estimates percentage of operational time saved
- 1-click **"Generate Automated Workflow"** button.

### 4.3 Visual Workflow Builder
- Interactive drag-and-drop node graph canvas powered by React Flow.
- Supported node types:
  - `Trigger`: Form, schedule, event, or webhook
  - `AI Decision`: Autonomous policy and routing decisions
  - `Approval`: Financial threshold reviews
  - `Task`: Human fulfillment action items
  - `Data Update`: ERP/CRM ledger and database synchronization
  - `Notification`: Push dispatch to stakeholders
  - `Report`: Audit log generation
  - `End`: Concluded pipeline
- Slide-out Node Inspector to configure properties, assignee roles, and conditions.

### 4.4 Workflow Execution Engine
- Moves execution through explicit states:
  - `PENDING` $\rightarrow$ `RUNNING` $\rightarrow$ `WAITING_APPROVAL` $\rightarrow$ `WAITING_TASK` $\rightarrow$ `COMPLETED` / `FAILED` / `CANCELLED`
- Auto-generates actionable approvals and tasks in real-time.
- Logs AI decisions with confidence score, latency (ms), and model reasoning.
- Live telemetry stepper with interactive Approve/Reject and Mark Complete actions.

### 4.5 Approvals Authorization Hub
- Dedicated dashboard for reviewing pending approval requests.
- Tiered financial threshold rules.
- Comment rationale modal with instant workflow continuation upon sign-off.

### 4.6 Analytics & AI Reports
- Processing time comparison bar charts (Before vs After FlowPilot).
- Execution volume and success rate area charts.
- AI Bottleneck diagnosis breakdown.
- Interactive Operational ROI Calculator.
- AI Executive Report generator with printable/exportable layout.

---

## 5. Getting Started & Installation

### Prerequisites
- Node.js v18+ (tested on Node v24)
- npm v10+

### Quick Start (Development)
```bash
# 1. Install root & server dependencies
npm install

# 2. Install client dependencies
npm --prefix client install

# 3. Seed database with hackathon demo data
npm run seed

# 4. Start full stack (Server on :5000 + Client on :5173)
npm run dev
```

### Production Build & Run
```bash
# Build frontend and server
npm run build

# Start production server
npm start
```
Open **`http://localhost:5000`** in your browser.

---

## 6. Pre-Configured Demo Credentials

For instant hackathon demonstration, click any **1-Click Demo Credentials** button on the Login page or use:

| Role | Email | Password | Persona |
|---|---|---|---|
| **Admin** | `admin@flowpilot.ai` | `password123` | Elena Rostova (Executive Lead) |
| **Manager** | `sarah.manager@flowpilot.ai` | `password123` | Sarah Jenkins (Finance Approver) |
| **Employee** | `alex.employee@flowpilot.ai` | `password123` | Alex Rivera (Product & Submitter) |
| **Automation Operator** | `marcus.ops@flowpilot.ai` | `password123` | Marcus Vance (IT & AI Supervisor) |

---

## 7. Environment Variables (`.env`)

```env
PORT=5000
NODE_ENV=development

# Optional remote database (embedded persistent PostgreSQL used if blank)
DATABASE_URL=

# Google Gemini API Key for live AI generation
GEMINI_API_KEY=

# Session Secret for JWT
SESSION_SECRET=flowpilot-ai-hackathon-secure-session-key-2026
```

---

## 8. Verification & Integration Testing

Run the full end-to-end integration test suite verifying authentication, problem analysis, workflow generation, execution engine, approvals, tasks, analytics, and audit logs:
```bash
npx tsx server/test_integration.ts
```
Expected output:
```text
=== ALL FLOWPILOT AI INTEGRATION TESTS PASSED WITH 100% SUCCESS! ===
```
