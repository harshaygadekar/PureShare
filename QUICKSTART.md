# PureShare - Quick Start Guide

Get your file sharing platform running in minutes!

## 🚀 Quick Setup (5 Steps)

### Step 1: Install Dependencies (2 minutes)

```bash
npm install
```

### Step 2: Set Up AWS S3 (10 minutes)

1. Go to [AWS S3 Console](https://console.aws.amazon.com/s3/)
2. Click **Create bucket**
   - Name: `pureshare-uploads` (or your choice)
   - Region: Select closest to you
   - Block all public access: ✅ Enabled
3. Go to **Permissions** → **CORS** and add:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["http://localhost:3000"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3000
     }
   ]
   ```
4. Go to [IAM Console](https://console.aws.amazon.com/iam/)
   - Create user: `pureshare-app`
   - Attach policy: **AmazonS3FullAccess**
   - Create access key
   - **Save the keys!** ⚠️

### Step 3: Set Up Supabase (10 minutes)

1. Go to [Supabase](https://supabase.com)
2. Create new project
   - Name: `pureshare`
   - Set strong database password
   - Choose region closest to you
3. Go to **SQL Editor** → **New query**
4. Paste this SQL:

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

-- Create indexes
CREATE INDEX idx_shares_share_link ON shares(share_link);
CREATE INDEX idx_shares_expires_at ON shares(expires_at);
CREATE INDEX idx_files_share_id ON files(share_id);

-- Enable RLS
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read shares" ON shares FOR SELECT USING (true);
CREATE POLICY "Anyone can insert shares" ON shares FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read files" ON files FOR SELECT USING (true);
CREATE POLICY "Anyone can insert files" ON files FOR INSERT WITH CHECK (true);
```

5. Run the query
6. Go to **Settings** → **API**
   - Copy **Project URL**
   - Copy **anon public** key
   - Copy **service_role** key (keep secret!)

### Step 4: Configure Environment (3 minutes)

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and fill in your values:
   ```env
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # From Supabase Settings > API
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
   SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

   # From AWS IAM User
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=AKIAxxxx
   AWS_SECRET_ACCESS_KEY=xxxxx
   AWS_S3_BUCKET_NAME=pureshare-uploads
   ```

### Step 5: Run the App (1 minute)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## ✅ Test It Out

1. **Upload Test**
   - Drag and drop an image
   - Click "Create Share Link"
   - Wait for upload to complete

2. **Share Test**
   - Copy the share link
   - Open in new incognito window
   - Verify you can view and download

3. **Password Test**
   - Upload with password set
   - Try accessing without password (should prompt)
   - Enter password and verify access

---

## 🐛 Troubleshooting

### "Failed to create share"
- ✅ Check Supabase credentials in `.env.local`
- ✅ Verify SQL tables were created
- ✅ Check browser console for errors

### "Failed to upload files"
- ✅ Check AWS credentials in `.env.local`
- ✅ Verify S3 bucket name is correct
- ✅ Check CORS configuration in S3

### "Share not found"
- ✅ Ensure share was created successfully
- ✅ Check database for share record
- ✅ Verify share link is correct

### CORS Errors
- ✅ Add `http://localhost:3000` to S3 CORS
- ✅ For production, add your domain
- ✅ Clear browser cache

---

## 🚢 Deploy to Production

### Option 1: Vercel (Recommended)

1. Push to GitHub:
   ```bash
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. Go to [Vercel](https://vercel.com)
   - Import repository
   - Add environment variables (same as `.env.local`)
   - Update `NEXT_PUBLIC_APP_URL` to your domain
   - Deploy

3. Update S3 CORS to include production domain

### Option 2: Other Platforms

Works on any platform that supports Next.js:
- Railway
- Render
- AWS Amplify
- Netlify
- DigitalOcean App Platform

---

## 📊 What's Next?

After basic setup works:

1. **Add S3 Lifecycle Policy** (auto-delete old files)
   - Go to S3 bucket → Management → Lifecycle rules
   - Create rule: Delete objects after 30 days

2. **Set Up Monitoring**
   - Add error tracking (Sentry)
   - Set up AWS CloudWatch billing alerts
   - Monitor Supabase usage

3. **Optimize**
   - Add caching
   - Implement rate limiting
   - Add analytics

4. **Enhance**
   - Add video support
   - Bulk download (ZIP)
   - Share statistics
   - Email notifications

---

## 📝 Environment Variables Checklist

Before running, ensure all these are set in `.env.local`:

- [ ] `NEXT_PUBLIC_APP_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `AWS_REGION`
- [ ] `AWS_ACCESS_KEY_ID`
- [ ] `AWS_SECRET_ACCESS_KEY`
- [ ] `AWS_S3_BUCKET_NAME`

---

## 🎉 Success!

If you can:
- ✅ Upload files
- ✅ Create share link
- ✅ Access share
- ✅ Download files

**Your PureShare MVP is working!** 🚀

Need more help? Check:
- [SETUP.md](./SETUP.md) - Detailed setup guide
- [README.md](./README.md) - Full documentation
- [PROJECT_STATUS.md](./PROJECT_STATUS.md) - What's been built

---

**Total Setup Time: ~25 minutes** ⏱️
