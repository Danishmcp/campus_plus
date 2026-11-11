# CampusPulse: College Event and Club Management Portal

A full-stack, enterprise-grade college event and club management web platform built in pure TypeScript (Node.js Express + React Vite + PostgreSQL + Prisma).

---

## 🚀 Key Features

- **Authentication & RBAC**: Multi-role governance (`ADMIN`, `ORGANIZER`, `STUDENT`) with JWT access & refresh tokens, bcrypt password hashing, and role-guarded routes.
- **Clubs & Communities**: Club creation, assigning club leaders/organizers, membership tracking, and showcase pages.
- **Event Lifecycle**: Propose events, administrative approval workflows (`DRAFT` → `PENDING_APPROVAL` → `APPROVED` / `REJECTED`), capacity limits, and banner uploads.
- **Discovery & Search**: Full-text event search, category/club/date filters, upcoming vs. past tabs, and pagination.
- **Intelligent Registration**: One-click registration, automated waitlisting with queue numbers, and schedule overlap conflict warnings.
- **Signed QR Code Attendance**: Each registered student gets a cryptographically signed QR ticket token. Organizers scan QR codes directly in their web browser via `html5-qrcode` with live validation and duplicate check-in protection, plus manual roll-number fallback.
- **Automated Verifiable Certificates**: PDF generation using `pdfkit` complete with student details, club signature, and a verifiable QR code leading to the public verification endpoint `/verify/:certificateId`.
- **In-App & Email Notifications**: Bell badge with unread counters, transactional emails via Nodemailer, and scheduled reminders via `node-cron`.
- **Role-Tailored Dashboards**:
  - **Admin**: Overall analytics, active clubs, registrations, attendance rates, and Recharts trends.
  - **Organizer**: Event metrics, attendee rosters, one-click certificate issuing, and CSV exports.
  - **Student**: Registered events, waitlist status, personal QR tickets, and certificate gallery.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, Zod, JWT, bcryptjs, Multer, PDFKit, QRCode, Nodemailer, node-cron
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, React Router v7, TanStack Query, Axios, Lucide React, Recharts, html5-qrcode
- **Testing**: Vitest, Supertest
- **DevOps**: Docker, Docker Compose, Multi-stage Dockerfiles

---

## 📦 Running Locally

### 1. Prerequisites
- Node.js 20+ (Node 22 / 26 supported)
- PostgreSQL database (or Docker Desktop)

### 2. Start PostgreSQL via Docker (Recommended)
```bash
docker compose up -d db
```

### 3. Backend Setup
```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```
Backend API will start on: `http://localhost:5000`

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend will be available on: `http://localhost:5173`

---

## 🔑 Pre-seeded Accounts (Password: `Password@123`)

| Role | Email | Name | Details |
|---|---|---|---|
| **Admin** | `admin@college.edu` | Dr. Sarah Connor | Dean of Student Affairs |
| **Organizer** | `lead.robotics@college.edu` | Ethan Hunt | Lead, Robotics & AI Society |
| **Organizer** | `lead.acm@college.edu` | Maya Lin | Lead, ACM Student Chapter |
| **Student** | `student1@college.edu` | Alex Johnson | CS Dept, CS2024001 |
| **Student** | `student2@college.edu` | Samantha Ray | EE Dept, EE2024012 |
| **Student** | `student3@college.edu` | David Kim | ME Dept, ME2024033 |
