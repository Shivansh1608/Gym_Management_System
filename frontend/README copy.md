# GymF Frontend

A modern, responsive gym management frontend built with React, TypeScript, and Tailwind CSS.

## Features

- 🎨 Modern, responsive UI
- 👥 Multi-role support (Member, Admin, Trainer)
- 💪 Workout logging
- 📊 Progress tracking with charts
- 📅 Session booking
- ✅ QR code check-in
- 📈 Analytics dashboard
- 🔐 Secure authentication

## Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Charts**: Recharts
- **Icons**: Lucide React

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file (optional)**
   Create `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```

The app will start on `http://localhost:5173`

### Production Build
```bash
npm run build
```

## Project Structure

```
frontend/
├── src/
│   ├── components/     # React components
│   │   ├── admin/      # Admin components
│   │   ├── member/     # Member components
│   │   ├── trainer/    # Trainer components
│   │   └── ui/         # UI components
│   ├── contexts/       # React contexts
│   ├── services/       # API services
│   └── App.tsx         # Main app component
└── package.json
```

## Features by Role

### Member
- View dashboard with stats
- Log workouts
- Track progress
- Book sessions
- QR code check-in
- View profile

### Admin
- Dashboard overview
- Member management
- Staff management
- Revenue analytics
- View all data

### Trainer
- Client management
- Create workout plans
- View schedule
- Track client progress

## API Integration

The frontend connects to the backend API. Make sure the backend is running and the API URL is correctly configured.

## License

ISC
