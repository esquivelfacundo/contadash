# 🎨 ContaDash Frontend

Frontend web application built with Next.js 14, TypeScript, and Material-UI.

## 🚀 Quick Start

### Prerequisites
- Node.js 20 LTS
- Backend running on http://localhost:4000

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Home (redirect)
│   │   ├── login/             # Login page
│   │   ├── register/          # Register page
│   │   └── dashboard/         # Dashboard page
│   ├── components/            # Shared components
│   │   └── DashboardLayout.tsx
│   └── lib/
│       ├── api/               # API clients
│       │   ├── client.ts      # Axios instance
│       │   ├── auth.ts        # Auth API
│       │   ├── analytics.ts   # Analytics API
│       │   ├── transactions.ts
│       │   └── categories.ts
│       ├── store/             # State management
│       │   └── auth.store.ts  # Zustand auth store
│       └── theme.ts           # MUI theme
├── public/                    # Static assets
├── .env.local                 # Environment variables
├── next.config.js            # Next.js config
├── tsconfig.json             # TypeScript config
└── package.json              # Dependencies
```

## 🔧 Configuration

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## 🎨 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **UI Library:** Material-UI (MUI)
- **HTTP Client:** Axios
- **State Management:** Zustand
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Date Utils:** date-fns

## 📱 Features

### ✅ Implemented

- **Authentication**
  - Login page with validation
  - Register page with validation
  - Session persistence
  - Auto redirect
  - Logout

- **Dashboard**
  - KPI cards (Income, Expense, Balance, Transactions)
  - Growth indicators
  - Recent transactions
  - Top categories
  - Year summary
  - Real-time data from API

- **Layout**
  - Responsive navbar
  - Collapsible sidebar
  - User menu
  - Mobile drawer

### ⏳ Pending

- Transactions CRUD page
- Categories CRUD page
- Clients CRUD page
- Analytics page with charts
- Profile page

## 🎯 Pages

### Public Routes
- `/` - Home (redirects to login or dashboard)
- `/login` - Login page
- `/register` - Register page

### Protected Routes
- `/dashboard` - Main dashboard
- `/transactions` - Transactions list (pending)
- `/categories` - Categories list (pending)
- `/clients` - Clients list (pending)
- `/analytics` - Analytics charts (pending)
- `/profile` - User profile (pending)

## 🔐 Authentication

The app uses JWT authentication with the backend API.

**Demo Credentials:**
- Email: `demo@contadash.com`
- Password: `demo123456`

## 🎨 Theme

Custom MUI theme with:
- **Primary:** Blue (#3b82f6)
- **Secondary:** Purple (#8b5cf6)
- **Success:** Green (#10b981)
- **Error:** Red (#ef4444)
- **Font:** Inter

## 📝 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Manual Build

```bash
# Build
npm run build

# Start
npm start
```

## 📚 API Integration

All API calls go through `src/lib/api/client.ts` which:
- Adds JWT token automatically
- Handles 401 errors (logout)
- Provides typed responses

Example:
```typescript
import { authApi } from '@/lib/api/auth'

const response = await authApi.login({
  email: 'user@example.com',
  password: 'password'
})
```

## 🎓 Development Guide

### Adding a New Page

1. Create file in `src/app/[page]/page.tsx`
2. Wrap with `DashboardLayout` if protected
3. Add route to sidebar in `DashboardLayout.tsx`

### Adding a New API Endpoint

1. Create/update file in `src/lib/api/`
2. Define TypeScript interfaces
3. Use `apiClient` for requests

### State Management

Use Zustand for global state:

```typescript
import { create } from 'zustand'

const useStore = create((set) => ({
  data: null,
  setData: (data) => set({ data }),
}))
```

## 🐛 Troubleshooting

### Port 3000 already in use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### API connection error

1. Check backend is running on port 4000
2. Verify `NEXT_PUBLIC_API_URL` in `.env.local`
3. Check CORS settings in backend

### TypeScript errors

```bash
# Regenerate types
rm -rf .next
npm run dev
```

## 📄 License

Proprietary - All rights reserved © 2025 ContaDash

---

**Last Updated:** November 29, 2025
