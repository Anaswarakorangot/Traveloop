# Traveloop

**Dream it. Plan it. Loop it.**

A full-stack travel planning platform for managing trips, itineraries, expenses, and sharing travel experiences.

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Zustand
- **Backend:** Node.js, Express, Prisma
- **Database:** PostgreSQL (Supabase)
- **Auth:** JWT

## Features

- User authentication (login/register)
- Trip creation and management
- Multi-city itinerary builder
- Expense tracking with budget management
- Packing checklist
- Trip notes/journal
- Community posts and sharing
- Admin dashboard

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account (or PostgreSQL)
- Redis (optional, for caching)

### Installation

```bash
# Clone repo
git clone https://github.com/avkbsurya119/Traveloop.git
cd Traveloop

# Install dependencies
cd server && npm install
cd ../client && npm install
```

### Environment Setup

**Server** (`server/.env`):
```env
PORT=5000
DATABASE_URL=postgresql://[USER]:[PASSWORD]@[HOST]:5432/postgres
JWT_SECRET=your_secret_key_min_32_chars
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=another_secret_key
REFRESH_TOKEN_EXPIRES_IN=30d
REDIS_URL=redis://localhost:6379
```

**Client** (`client/.env.local`):
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Database Setup

```bash
cd server

# Push schema to database
npx prisma db push

# Seed with demo data
npm run db:seed
```

### Run Development

```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

Open http://localhost:5173

## Demo Accounts

| Role  | Email              | Password   |
|-------|-------------------|------------|
| Admin | admin@traveloop.app | Admin123!  |
| User  | john@example.com   | User123!   |
| User  | sarah@example.com  | User123!   |

## Project Structure

```
traveloop/
├── client/           # React frontend
│   ├── src/
│   │   ├── api/      # API client
│   │   ├── components/
│   │   ├── pages/
│   │   └── store/    # Zustand stores
│   └── ...
├── server/           # Express backend
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── config/
│   └── prisma/
│       ├── schema.prisma
│       └── seed.js
└── docker-compose.yml
```

## API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Trips
- `GET /api/trips`
- `POST /api/trips`
- `GET /api/trips/:id`
- `PUT /api/trips/:id`
- `DELETE /api/trips/:id`

### Cities & Activities
- `GET /api/cities`
- `GET /api/cities/popular`
- `GET /api/activities`

### Community
- `GET /api/community/posts`
- `POST /api/community/posts`
- `POST /api/community/posts/:id/like`

## License

MIT
