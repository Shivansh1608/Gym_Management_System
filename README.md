# Gym_Management_System
🏋️ FitTrack Pro

A full-stack, role-based gym management and fitness tracking web application for gym owners, personal trainers, and members. Members log workouts and track progress, trainers manage clients and build plans, and admins monitor the business through KPIs and revenue analytics.

Show Image Show Image Show Image Show Image Show Image Show Image

📑 Table of Contents
Features
Tech Stack
Architecture
Getting Started
Environment Variables
Demo Accounts
Database Models
Authentication Flow
API Overview
Roadmap
Contributing
License
✨ Features
🏋️ Member
Feature	Description
Home Dashboard	Active days, total workouts, streak counter, calories burned
Workout Logger	Log exercises with sets, reps, and weights
Progress Tracker	Log weight and body measurements, view progress charts
Session Booking	Browse group classes and trainer sessions, book and cancel slots
QR Check-In	Generate a check-in code with location verification for the front desk
Profile	Membership details and activity history
📋 Trainer
Feature	Description
Dashboard	Active clients, today's sessions, attendance stats
Schedule Management	View upcoming sessions, create training slots, manage capacity
Client Management	Assigned members, contact info, workout completion rates
Workout Plan Builder	Build multi-week plans (strength, cardio, HIIT) and assign to clients
⚙️ Admin
Feature	Description
Executive Dashboard	Total/active members, trainer count, monthly revenue
Member Management	Search, filter by status, view join dates, manage members
Staff Management	Track trainers and admins, role assignments, client loads
Revenue Analytics	Revenue trends and breakdown by membership tier
🧰 Tech Stack

Frontend

React 18 + TypeScript
Vite 6 (dev server on port 3000)
Tailwind CSS with a custom dark-mode aesthetic
Recharts for revenue, body weight, and workout charts
Lucide React icons and Radix UI accessible primitives

Backend

Node.js + Express 5 (port 5000)
MongoDB with Mongoose ODM
JWT authentication, passwords hashed with bcryptjs
cors and body-parser
🏗 Architecture
React 18 + TypeScript +Tailwind CSS
Proxy /api
JWT Auth Middleware
Mongoose ODM
Browser / Client
Vite Dev Server :3000
Express.js Server :5000
API Controllers & Routes
MongoDB Database

The Vite dev server proxies every /api request to the Express backend, so the frontend never needs to hard-code the backend URL during development.

🚀 Getting Started
Prerequisites
Node.js 18 or newer
MongoDB running locally, or a MongoDB Atlas connection string
npm
1. Clone the repository
bash
git clone <your-repo-url>
cd fittrack-pro
2. Start the backend
bash
cd backend
npm install
npm start

The API runs on http://localhost:5000.

3. Start the frontend

In a second terminal:

bash
cd frontend
npm install
npm run dev

The app runs on http://localhost:3000.

🔐 Environment Variables

Create a .env file inside backend/. Adjust the names to match your existing config.

env
PORT=5000
MONGO_URI=mongodb://localhost:27017/fittrack
JWT_SECRET=replace_with_a_long_random_string

⚠️ Never commit .env files. Add .env to your .gitignore and keep a .env.example with placeholder values instead.

👤 Demo Accounts

The database is seeded with demo accounts so you can explore each role immediately:

Role	Email	Password	What you'll see
Member	member@example.com	password	Workout tracker, check-in, bookings, fitness stats
Trainer	trainer@example.com	password	Client management, schedule, workout plan builder
Admin	admin@example.com	password	Business dashboard, revenue analytics, member and staff lists

These credentials are for local development only. Change or remove them before any real deployment.

🗄 Database Models

Located in backend/models/.

Model	File	Fields	Purpose
User	User.js	name, email, password, role (member | trainer | admin), createdAt	Authentication and role-based access control
WorkoutLog	WorkoutLog.js	user (ref), date, exercises: [{ name, sets, reps, weight }]	Member workout session logs
Subscription	Subscription.js	user (ref), plan, startDate, endDate, status	Membership plans and validity periods
Equipment	Equipment.js	name, quantity, status	Gym equipment inventory
Attendance / Booking / DietPlan	—	—	Structured for check-in logs, session bookings, and nutrition plans
🔑 Authentication Flow
Registration: passwords are hashed with bcryptjs (salted) before being saved to MongoDB.
Login: on success the server issues a signed JWT.
Session persistence: the token is stored in the browser's localStorage and managed globally by AuthContext.tsx.
Protected requests: the frontend API client injects Authorization: Bearer <token> into every request.
Verification: the backend middleware auth.js validates the signature and attaches req.user.
📡 API Overview

All endpoints are served under /api. Protected routes require the Authorization: Bearer <token> header.

Area	Purpose
/api/auth	Register, login, current user
/api/workouts	Create and fetch workout logs
/api/progress	Weight and body-measurement entries
/api/sessions	Sessions, bookings, and cancellations
/api/members, /api/staff	Admin member and staff management
/api/analytics	Revenue and KPI data

The route names above are indicative. Update this table to match the actual route files in backend/routes/.

🗺 Roadmap

Planned improvements:

 Persistent MongoDB collections for sessions and bookings (replace the in-memory sessions array)
 Camera-based QR scanning with html5-qrcode or @zxing/library
 Payment gateway integration (Stripe or Razorpay) for online memberships
 PDF/CSV export for revenue and attendance reports
 Short-lived access tokens with refresh-token rotation (httpOnly cookies)
 Automated tests (unit, API, and end-to-end)
 Docker Compose setup and CI pipeline
🤝 Contributing
Fork the repository
Create a feature branch: git checkout -b feature/your-feature
Commit your changes: git commit -m "Add your feature"
Push the branch: git push origin feature/your-feature
Open a Pull Request
