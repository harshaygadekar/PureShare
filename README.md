# PureShare 🚀

**Temporary file sharing with ephemeral storage** - A secure, time-limited file sharing platform built with Next.js, AWS S3, and Supabase.

## ✨ Features

- **Drag & Drop Upload** - Intuitive file upload interface
- 🔗 **Share Links** - Generate unique, short share links
- 🔒 **Password Protection** - Optional password protection for shares
- ⏰ **Auto-Expiration** - Files automatically deleted after expiration
- 🖼️ **Image Gallery** - Beautiful grid view for shared images
- 📱 **Responsive Design** - Works on desktop and mobile
- 🎨 **Modern UI** - Built with shadcn/ui and Tailwind CSS
- ⚡ **Fast & Secure** - Server-side rendered with Next.js 16.0.1

## 🛠️ Tech Stack

- **Framework**: Next.js 16.0.1 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Storage**: AWS S3
- **File Uploads**: react-dropzone
- **Icons**: react-icons
- **Validation**: Zod
- **Authentication**: bcryptjs

## Prerequisites

- Node.js 22.21.1 or higher
- npm or yarn
- AWS Account (for S3)
- Supabase Account

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd pureshare
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up external services

Follow the detailed setup guide in [SETUP.md](./SETUP.md) to configure:
- AWS S3 bucket
- Supabase database
- Environment variables

### 4. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your credentials:

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

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
pureshare/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── upload/        # Upload endpoints
│   │   └── share/         # Share endpoints
│   ├── share/[id]/        # Share viewing page
│   └── page.tsx           # Home page (upload)
├── components/
│   ├── ui/                # shadcn/ui primitives
│   ├── features/          # Feature components
│   └── layouts/           # Layout components
├── lib/
│   ├── db/                # Database clients
│   ├── storage/           # S3 utilities
│   ├── auth/              # Authentication
│   ├── validations/       # Zod schemas
│   └── utils/             # Helper functions
├── types/
│   ├── api.ts             # API types
│   └── database.ts        # Database types
├── config/
│   └── constants.ts       # App configuration
└── docs_implementation_plan.txt  # 30-day roadmap
```

## Key Features Explained

### File Upload Flow
1. User selects files via drag-and-drop or file picker
2. Creates a share with optional password and expiration time
3. Files are uploaded directly to AWS S3 using presigned URLs
4. Metadata stored in Supabase database
5. Unique share link generated and displayed

### Share Viewing Flow
1. User accesses share link
2. Password verification if required
3. Files displayed in responsive grid
4. Click to preview in modal
5. Download individual files

### Auto-Expiration
- Shares expire based on user-selected time (24h, 48h, 7 days, etc.)
- S3 lifecycle policy automatically deletes old files
- Database cleanup job (future: implement cron)

## API Endpoints

- `POST /api/upload/create` - Create new share
- `POST /api/upload/files` - Upload file metadata
- `POST /api/share/[id]/verify` - Verify share access
- `GET /api/share/[id]/files` - Get all files in share
- `GET /api/share/[id]/download/[fileId]` - Download file

## ecurity Features

- ✅ Password hashing with bcrypt
- ✅ Presigned S3 URLs (time-limited)
- ✅ Input validation with Zod
- ✅ Private S3 bucket (no public access)
- ✅ Row Level Security in Supabase
- ✅ Environment variables for secrets

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

Update `NEXT_PUBLIC_APP_URL` to your production domain:
```
NEXT_PUBLIC_APP_URL=https://your-domain.com
```


### Next Steps 🔜
- Implement cleanup cron job
- Add bulk download (ZIP)
- Share statistics and analytics
- Video file support
- Mobile app

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments

- Built with [Next.js](https://nextjs.org)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [react-icons](https://react-icons.github.io/react-icons/)

---

**Note**: This is an MVP built as part of a 30-day implementation plan. See [SETUP.md](./SETUP.md) for detailed setup instructions.
