# SkillSwap — Freelance Micro-Task Platform

A full-stack freelance marketplace where clients post small tasks, freelancers apply with proposals, and payments are handled securely via Stripe.

## 🌐 Live Website

👉 [https://taskhive-eight-phi.vercel.app](https://taskhive-eight-phi.vercel.app)

---

## 🎯 Purpose

SkillSwap connects clients who need quick help with small online tasks to skilled freelancers. It is a simpler, faster version of Fiverr or Freelancer.com — built for one-time micro-jobs like logo design, article writing, or bug fixing.

---

## ✨ Key Features

### 👤 Authentication
- Email & Password login and registration via **BetterAuth**
- Google OAuth sign-in (auto-assigned as Client role)
- Role-based access: **Client**, **Freelancer**, **Admin**
- JWT session stored in secure HTTPOnly cookies

### 🧑‍💼 Client Dashboard
- Post new tasks with title, category, budget, deadline
- View and manage all posted tasks (edit/delete)
- Review freelancer proposals and accept or reject them
- Stripe Checkout payment flow on proposal acceptance

### 👨‍💻 Freelancer Dashboard
- Browse all open tasks with search and category filter
- Submit proposals with budget, timeline, and cover note
- Track proposal status (Pending / Accepted / Rejected)
- Submit deliverable URLs for completed tasks
- View earnings history
- Edit public profile (name, photo, skills, bio, hourly rate)

### 🛡️ Admin Dashboard
- View and manage all platform users (block/unblock)
- Manage all tasks (delete policy-violating posts)
- View complete Stripe transaction history

### 🔍 Browse & Discovery
- Browse Tasks with **real-time search** and **category filtering**
- Server-side **pagination** (9 tasks per page)
- Browse Freelancers with search by name, skill, or bio
- Public freelancer profile pages

### 💳 Payments
- Stripe Checkout integration
- Payment confirmation via `/confirm-session` endpoint
- Payment Success page with transaction details

---

## 🗂️ Pages

| Page | Route |
|------|-------|
| Home | `/` |
| Browse Tasks | `/tasks` |
| Task Details | `/tasks/[id]` |
| Browse Freelancers | `/freelancers` |
| Freelancer Profile | `/freelancers/[id]` |
| Login | `/login` |
| Register | `/register` |
| Client Dashboard | `/dashboard/client` |
| Freelancer Dashboard | `/dashboard/freelancer` |
| Admin Dashboard | `/dashboard/admin` |
| Payment Success | `/payment/success` |
| 404 Not Found | (custom) |

---

## 📦 NPM Packages Used

| Package | Purpose |
|---------|---------|
| `next` | React framework (App Router) |
| `react` | UI library |
| `better-auth` | Authentication (email + Google OAuth) |
| `axios` | HTTP requests to backend API |
| `stripe` | Stripe payment integration |

---

## 🗃️ Database Collections (MongoDB)

- **users** — name, email, image, role, skills, bio, isBlocked
- **tasks** — title, category, description, budget, deadline, client_email, status
- **proposals** — task_id, freelancer_email, proposed_budget, estimated_days, cover_note, status
- **payments** — client_email, freelancer_email, task_id, amount, transaction_id, payment_status
- **reviews** — task_id, reviewer_email, reviewee_email, rating, comment

---

## 🔐 Environment Variables

Create a `.env.local` file in the root:

```
NEXT_PUBLIC_API_URL=your_backend_url
BETTER_AUTH_SECRET=your_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

---

## 🚀 Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🧪 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin1@taskhive.com | admin1@taskhive.com |
| Freelancer | freelanceruser3@gmail.com | freelanceruser3@gmail.com |