# Getting Started - Zero-Knowledge Password Vault

## Quick Start (5 Minutes)

### 1. Install Dependencies

```bash
npm install
```

This will install all dependencies for the monorepo (backend, frontend, and shared packages).

### 2. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:password@localhost:5432/vault

# Redis (Upstash or local)
REDIS_URL=redis://localhost:6379

# JWT Secrets (generate with: openssl rand -base64 64)
JWT_SECRET=your-jwt-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here

# CORS Origins
CORS_ORIGINS=http://localhost:3000

# Server Port
PORT=3001
```

### 3. Set Up Database

Run the database migrations:

```bash
# If using Supabase, paste the SQL from supabase/migrations/001_initial_schema.sql
# into the Supabase SQL Editor

# Or if using local PostgreSQL:
psql $DATABASE_URL < supabase/migrations/001_initial_schema.sql
```

### 4. Start Development Servers

```bash
npm run dev
```

This starts:
- Backend API: http://localhost:3001
- Frontend: http://localhost:3000

### 5. Open Your Vault

Visit http://localhost:3000 and create your account!

## Detailed Setup

### Prerequisites

- Node.js 20+ and npm 10+
- PostgreSQL database (Supabase recommended)
- Redis (Upstash recommended, or local)

### Backend Setup

```bash
cd apps/backend
npm install
npm run dev
```

The backend will start on port 3001.

### Frontend Setup

```bash
cd apps/frontend
npm install
npm run dev
```

The frontend will start on port 3000.

### Database Setup Options

#### Option 1: Supabase (Recommended)

1. Create account at https://supabase.com
2. Create new project
3. Go to SQL Editor
4. Paste contents of `supabase/migrations/001_initial_schema.sql`
5. Run the migration
6. Copy connection string to `.env.local`

#### Option 2: Local PostgreSQL

```bash
# Create database
createdb vault

# Run migrations
psql vault < supabase/migrations/001_initial_schema.sql
```

### Redis Setup Options

#### Option 1: Upstash (Recommended)

1. Create account at https://upstash.com
2. Create new Redis database
3. Copy Redis URL to `.env.local`

#### Option 2: Local Redis

```bash
# Install Redis
brew install redis  # macOS
# or
sudo apt-get install redis  # Linux

# Start Redis
redis-server

# Use in .env.local
REDIS_URL=redis://localhost:6379
```

## Project Structure

```
zero-knowledge-vault/
├── apps/
│   ├── backend/          # NestJS API
│   │   ├── src/
│   │   │   ├── auth/     # Authentication
│   │   │   ├── vault/    # Vault management
│   │   │   ├── database/ # Database service
│   │   │   └── redis/    # Redis service
│   │   └── Dockerfile
│   └── frontend/         # Next.js app
│       ├── app/          # Pages
│       └── lib/          # Client-side crypto
├── packages/
│   └── shared/           # Shared types
├── supabase/
│   └── migrations/       # Database schema
└── docs/                 # Documentation
```

## Next Steps

1. Read [USER_GUIDE.md](docs/USER_GUIDE.md) for usage instructions
2. Read [SECURITY.md](docs/SECURITY.md) for security architecture
3. Read [DEPLOYMENT.md](docs/DEPLOYMENT.md) for production deployment
4. Read [FLY_DEPLOYMENT.md](docs/FLY_DEPLOYMENT.md) for Fly.io deployment

## Troubleshooting

### Backend won't start

- Check DATABASE_URL is correct
- Check REDIS_URL is correct
- Check ports 3001 is available
- Run `npm install` in apps/backend

### Frontend won't start

- Check port 3000 is available
- Run `npm install` in apps/frontend
- Check backend is running

### Database connection failed

- Verify PostgreSQL is running
- Check DATABASE_URL format
- Test connection: `psql $DATABASE_URL`

### Redis connection failed

- Verify Redis is running
- Check REDIS_URL format
- Test connection: `redis-cli ping`

## Development Commands

```bash
# Install all dependencies
npm install

# Start both backend and frontend
npm run dev

# Start backend only
npm run dev:backend

# Start frontend only
npm run dev:frontend

# Build all packages
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## Support

- Documentation: See docs/ folder
- Issues: GitHub Issues
- Email: support@example.com
