# PureShare

Secure, temporary file sharing platform with ephemeral storage. Built with Next.js, AWS S3, and Supabase.

## Features

- Drag & drop file upload interface
- Generate unique, time-limited share links
- Optional password protection
- Automatic file expiration and deletion
- Image gallery with preview
- Responsive design for all devices
- Modern UI with Tailwind CSS
- Real-time password strength validation
- User authentication system

## Tech Stack

- **Framework**: Next.js 16.0.1 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Storage**: AWS S3
- **Cache/Rate Limiting**: Upstash Redis
- **Authentication**: JWT with bcrypt
- **Validation**: Zod

## Prerequisites

- Node.js 22.21.1 or higher
- AWS Account (S3)
- Supabase Account
- Upstash Redis Account

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd pureshare
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_BUCKET_NAME`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `JWT_SECRET`
- `NEXT_PUBLIC_APP_URL`

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
pureshare/
├── app/
│   ├── (auth)/              # Authentication pages
│   ├── (marketing)/         # Landing & marketing pages
│   ├── api/                 # API routes
│   │   ├── auth/           # Auth endpoints
│   │   ├── upload/         # Upload endpoints
│   │   └── share/          # Share endpoints
│   └── share/[id]/         # Share viewing page
├── components/
│   ├── auth/               # Auth forms
│   ├── marketing/          # Marketing sections
│   ├── layout/             # Layout components
│   ├── features/           # Feature components
│   ├── shared/             # Shared utilities
│   └── ui/                 # UI primitives
├── lib/
│   ├── auth/               # Authentication logic
│   ├── middleware/         # Rate limiting & security
│   ├── security/           # Sanitization utilities
│   ├── db/                 # Database clients
│   └── storage/            # S3 utilities
└── config/
    ├── constants.ts        # App configuration
    └── design-tokens.ts    # Design system
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/verify-email` - Email verification
- `GET /api/health` - Health check

### File Sharing
- `POST /api/upload/create` - Create new share
- `POST /api/upload/files` - Upload file metadata
- `POST /api/share/[id]/verify` - Verify share access
- `GET /api/share/[id]/files` - Get all files in share
- `GET /api/share/[id]/download/[fileId]` - Download file

## Security Features

- Password hashing with bcrypt (10 rounds)
- JWT-based session management
- Rate limiting with Redis (7 different limiters)
- Content Security Policy headers
- XSS protection and input sanitization
- CORS configuration
- Private S3 bucket with presigned URLs
- Row Level Security in Supabase
- Strong password requirements (12+ chars, complexity)

## Deployment

### Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Production Environment

Update `NEXT_PUBLIC_APP_URL` to your production domain.

## Development Status

See [PRODUCTION-PLAN.md](./PRODUCTION-PLAN.md) for detailed progress tracking.

### Completed (71%)
- Phase 1: Foundation & Security
- Phase 2: Design System & Components
- Phase 3: Landing Page
- Phase 4: Authentication UI

### In Progress
- Phase 5: User Dashboard
- Phase 6: Enhanced Features
- Phase 7: Email System
- Phase 8: Monitoring & Cleanup
- Phase 9: Production Deployment

## License

MIT License

---

Built with Next.js and shadcn/ui
