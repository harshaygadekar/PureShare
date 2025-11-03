# PureShare Setup Guide

This guide will walk you through setting up AWS S3 and Supabase for PureShare.

## Prerequisites

- Node.js 22.21.1
- npm or yarn
- AWS Account
- Supabase Account

---

## 1. AWS S3 Setup

### Step 1: Create S3 Bucket

1. Go to [AWS Console](https://console.aws.amazon.com/s3/)
2. Click **Create bucket**
3. Configure bucket:
   - **Bucket name**: `pureshare-uploads` (or your preferred name)
   - **Region**: Choose closest to your users (e.g., `us-east-1`)
   - **Block Public Access**: Keep all public access blocked ✅
   - **Versioning**: Disabled (to save costs)
   - **Encryption**: Enable (SSE-S3)
4. Click **Create bucket**

### Step 2: Configure CORS

1. Open your bucket
2. Go to **Permissions** tab
3. Scroll to **Cross-origin resource sharing (CORS)**
4. Click **Edit** and paste:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

5. Click **Save changes**

### Step 3: Create IAM User

1. Go to [IAM Console](https://console.aws.amazon.com/iam/)
2. Click **Users** → **Create user**
3. Username: `pureshare-app`
4. Click **Next**
5. Select **Attach policies directly**
6. Search and select **AmazonS3FullAccess** (or create custom policy for specific bucket)
7. Click **Next** → **Create user**

### Step 4: Create Access Keys

1. Click on the user you just created
2. Go to **Security credentials** tab
3. Scroll to **Access keys** → **Create access key**
4. Select **Application running outside AWS**
5. Click **Next** → **Create access key**
6. **IMPORTANT**: Copy both:
   - Access key ID
   - Secret access key
7. Store these securely!

### Step 5: Set up Lifecycle Policy (Auto-cleanup)

1. Go to your S3 bucket
2. Go to **Management** tab
3. Click **Create lifecycle rule**
4. Rule name: `auto-delete-old-files`
5. Choose **Apply to all objects in the bucket**
6. Under **Lifecycle rule actions**, select:
   - ✅ Expire current versions of objects
7. Set **Days after object creation**: 30
8. Click **Create rule**

---

## 2. Supabase Setup

### Step 1: Create Project

1. Go to [Supabase](https://supabase.com)
2. Click **New project**
3. Fill in:
   - **Project name**: `pureshare`
   - **Database password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine for MVP
4. Click **Create new project**
5. Wait 2-3 minutes for project setup

### Step 2: Create Database Tables

1. Go to **SQL Editor** in Supabase dashboard
2. Click **New query**
3. Paste the following SQL:

```sql
-- Create shares table
CREATE TABLE shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_link VARCHAR(12) UNIQUE NOT NULL,
  password_hash TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  file_count INTEGER DEFAULT 0
);

-- Create files table
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID REFERENCES shares(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  s3_key TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_shares_share_link ON shares(share_link);
CREATE INDEX idx_shares_expires_at ON shares(expires_at);
CREATE INDEX idx_files_share_id ON files(share_id);

-- Enable Row Level Security (RLS)
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Create policies for shares table
CREATE POLICY "Anyone can read shares"
  ON shares FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert shares"
  ON shares FOR INSERT
  WITH CHECK (true);

-- Create policies for files table
CREATE POLICY "Anyone can read files"
  ON files FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert files"
  ON files FOR INSERT
  WITH CHECK (true);
```

4. Click **Run**
5. Verify tables are created by going to **Table Editor**

### Step 3: Get API Keys

1. Go to **Settings** → **API**
2. Copy the following:
   - **Project URL**
   - **anon public key**
   - **service_role key** (keep this secret!)

---

## 3. Configure Environment Variables

1. Open `.env.local` in your project
2. Fill in the values:

```env
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_S3_BUCKET_NAME=pureshare-uploads

# Security
PASSWORD_HASH_ROUNDS=10

# File Upload Configuration
MAX_FILE_SIZE=104857600
MAX_FILES_PER_SHARE=50
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp

# Share Configuration
DEFAULT_EXPIRATION_HOURS=48
MAX_EXPIRATION_DAYS=30
```

3. Save the file

---

## 4. Test the Setup

Run the development server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Troubleshooting

### S3 Upload Fails

- Check AWS credentials are correct
- Verify CORS configuration includes your domain
- Ensure IAM user has S3 permissions

### Database Connection Fails

- Verify Supabase URL and keys are correct
- Check if tables were created successfully
- Ensure RLS policies are enabled

### CORS Errors

- Update S3 CORS configuration with your frontend URL
- Clear browser cache and try again

---

## Next Steps

Once setup is complete, you can:

1. Start building the upload UI
2. Implement file upload flow
3. Create share viewing pages
4. Add password protection
5. Implement cleanup cron jobs

## Security Checklist

- ✅ S3 bucket is not publicly accessible
- ✅ Environment variables are in `.gitignore`
- ✅ AWS IAM user has minimal required permissions
- ✅ Supabase RLS is enabled
- ✅ Strong password hashing (bcrypt)
- ✅ Lifecycle policy set up for auto-deletion

---

**You're all set!** 🚀
