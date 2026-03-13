# PureShare

PureShare is a Next.js App Router application for temporary file sharing and file requests.
It supports browser-to-S3 uploads, expiring share links, optional password protection,
owner analytics, QR/social sharing, and an authenticated dashboard for managing shares
and requests.

## What it does

- Create share links for uploaded files
- Upload files directly from the browser to S3 with presigned URLs
- Protect shares with optional passwords
- Expire links automatically based on configured time windows
- Preview images and video before download
- Download individual files or all files as a ZIP
- Create file request links so other people can upload to you
- View owner analytics and dashboard activity for authenticated shares

## Current security model

PureShare uses practical access controls, not client-side end-to-end encryption.

- TLS protects browser and API traffic
- S3 objects are accessed through time-limited signed URLs
- Shares can require a password before access
- Dashboard and owner APIs are protected with Clerk authentication
- Rate limiting is available when Upstash Redis is configured
- Environment validation fails fast for required runtime secrets

## Default limits

These defaults come from `config/constants.ts` and can be overridden with environment variables.

- Image uploads: `100MB` per file
- Video uploads: `500MB` per file
- Files per share: `50`
- Standard expiration options: `24`, `48`, `72`, `168` hours
- Video expiration options: `24`, `48`, `72`, `168` hours

## Tech stack

- Framework: Next.js 16 App Router
- Language: TypeScript
- Auth: Clerk
- Database: Supabase Postgres
- Storage: AWS S3
- Validation: Zod
- UI: Tailwind CSS v4, Radix UI, shadcn-style components
- Email: Resend
- Rate limiting: Upstash Redis

## Main flows

### Share upload flow

1. Client calls `POST /api/upload/create`
2. Client registers each file through `POST /api/upload/files`
3. Browser uploads file bytes directly to S3 using the returned presigned URL
4. Client finalizes the upload through `PATCH /api/upload/files`
5. Recipients access the share through `/share/[id]`

### File request flow

1. Authenticated user creates a request through `POST /api/request/create`
2. Recipient opens `/request/[id]`
3. Client registers upload metadata through `POST /api/request/[id]/upload`
4. Browser uploads directly to S3
5. Client finalizes the upload through `PATCH /api/request/[id]/upload`

### Download flow

- Individual downloads use `GET /api/share/[id]/download/[fileId]`
- ZIP downloads use `GET /api/share/[id]/download-all`
- Owner analytics are exposed through `GET /api/shares/[id]/analytics`

## Repository structure

```text
app/
  (dashboard)/           Authenticated dashboard pages
  (marketing)/           Public marketing, pricing, help, legal pages
  api/                   Route handlers for upload, share, request, user, analytics
  request/[id]/          Public file request upload page
  share/[id]/            Public share view and download page
  upload/                Share creation page

components/
  dashboard/            Dashboard UI
  marketing/            Marketing sections
  share/                Share actions and modals
  shared/               Shared app components
  ui/                   UI primitives and motion components

lib/
  db/                   Supabase clients and user resolution
  downloads/            Client download helpers
  email/                Notification templates and sending
  middleware/           Rate limiting and security helpers
  security/             Password and share-link helpers
  storage/              S3 client and presigned URL utilities
  validations/          Zod schemas

supabase/migrations/    SQL migrations and RPC helpers
config/constants.ts     Runtime defaults and limits
```

## Prerequisites

- Node.js 20+
- npm
- Supabase project
- AWS S3 bucket
- Clerk application

Optional but recommended:

- Upstash Redis for rate limiting
- Resend for notification emails

## Environment variables

Copy `.env.example` to `.env.local` and fill in the required values.

Required runtime variables:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_BUCKET_NAME`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

Optional runtime variables:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `RESEND_API_KEY`
- `FROM_EMAIL`
- `ALLOWED_ORIGINS`
- `HEALTH_CHECK_TOKEN`

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

### 3. Apply database migrations

Apply the SQL files in `supabase/migrations/` using your normal Supabase workflow.

Important recent migrations:

- `supabase/migrations/20260313_phase1_upload_finalization.sql`
- `supabase/migrations/20260313_phase3_aggregates.sql`

If you use the Supabase CLI, this is typically done with:

```bash
supabase db push
```

### 4. Start the app

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Key routes

Pages:

- `/` - landing page
- `/upload` - create a share
- `/share/[id]` - view/download a share
- `/request/[id]` - upload to a file request
- `/dashboard` - owner dashboard
- `/dashboard/shares` - owner shares
- `/dashboard/requests` - owner file requests
- `/dashboard/settings` - account/settings page

API:

- `POST /api/upload/create`
- `POST /api/upload/files`
- `PATCH /api/upload/files`
- `POST /api/request/create`
- `POST /api/request/[id]/upload`
- `PATCH /api/request/[id]/upload`
- `POST /api/share/[id]/verify`
- `GET /api/share/[id]/files`
- `GET /api/share/[id]/download/[fileId]`
- `GET /api/share/[id]/download-all`
- `GET /api/user/shares`
- `GET /api/user/requests`
- `GET /api/user/stats`
- `GET /api/shares/[id]/analytics`

## Operational notes

- The health endpoint is `GET /api/health`
- In production, health access requires either a valid Clerk session or `HEALTH_CHECK_TOKEN`
- Upload finalization is tracked in the database; failed uploads are marked separately from completed uploads
- ZIP generation is streamed server-side and validated before browser-triggered download

## Development status

Current local validation status:

- `npm run lint` passes
- `npm run build` passes

There is currently no automated test script in `package.json`, so integration and end-to-end coverage are still a recommended next step.

## Notes on docs

- Older project notes may still reference JWT auth, client-side encryption, 5GB or 10GB upload limits, or download caps
- The current source of truth is the codebase, especially `config/constants.ts`, `lib/utils/env-validation.ts`, and the route handlers in `app/api/`
