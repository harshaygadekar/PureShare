# PureShare Feature Integration Plan

**Date:** February 15, 2026  
**Version:** 1.0  
**Status:** Ready for Review

---

## Executive Summary

This document outlines the integration plan for implementing 7 features across PureShare's file-sharing platform. The plan prioritizes security fixes first, followed by quick UI enhancements, then backend-intensive features.

### Features to Implement (Excluding Custom Branding)

| # | Feature | Priority | Effort | Type |
|---|---------|----------|--------|------|
| 1 | Fix Password Protection Enforcement | P0 | 1 day | Security |
| 2 | QR Code Generation | P1 | 0.5 days | UI/Frontend |
| 3 | Download Counter Display | P1 | 0.5 days | UI/Frontend |
| 4 | Social Share Buttons | P1 | 0.5 days | UI/Frontend |
| 5 | Download Notifications (Email) | P2 | 1 day | Backend |
| 6 | Share Analytics Dashboard | P2 | 3-5 days | Backend + UI |
| 7 | File Request / Upload Links | P2 | 3-5 days | Full Stack |

---

## Phase 1: Security Fix (P0)

### 1.1 Password Protection Enforcement

**Problem:** Password verification exists at `/api/share/[id]/verify` but downstream file endpoints don't enforce post-verification state. Anyone with the share link can access files without password.

**Solution:** Implement session-based verification using cookies.

#### Technical Changes

**Database:**
- No changes required (existing structure supports this)

**API Routes to Modify:**

1. `/api/share/[id]/verify/route.ts`
   - Set HTTP-only cookie on successful password verification
   - Cookie name: `share_access_{shareId}`
   - Cookie options: `httpOnly, secure, sameSite=strict, maxAge=3600` (1 hour)

2. `/api/share/[id]/files/route.ts`
   - Add cookie verification check
   - If share has password_hash, require valid cookie
   - Return 401 if no valid cookie and password required

3. `/api/share/[id]/download/[fileId]/route.ts`
   - Add same cookie verification check
   - Block download if password required but not verified

4. `/api/share/[id]/download-all/route.ts`
   - Add same cookie verification check

**Client Changes:**

- `/app/share/[id]/page.tsx`
  - After successful password verification, store verification state
  - Include credentials (cookies) in API requests
  - Auto-refresh files after verification success

#### Implementation Order

1. Modify verify route to set cookie
2. Modify files route to check cookie
3. Modify download routes to check cookie
4. Update client to include credentials
5. Test password flow end-to-end

---

## Phase 2: Quick UI Features (P1)

### 2.1 QR Code Generation

**Description:** Generate scannable QR codes for share links displayed on the share page.

**Dependencies:** `qrcode` npm package

#### Technical Implementation

**New File:** `lib/utils/qrcode.ts`
```typescript
import QRCode from 'qrcode';

export async function generateQRCode(data: string): Promise<string> {
  return QRCode.toDataURL(data, {
    width: 256,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });
}
```

**UI Placement:** 
- Share page (`/app/share/[id]/page.tsx`)
- Add QR code button in header area next to share link
- Modal/popover to display larger QR code

**Components to Create:**
- `components/share/qr-code-button.tsx` - Button with icon
- `components/share/qr-code-modal.tsx` - Modal showing QR code with share link

#### Files to Modify
- `package.json` - Add `qrcode` dependency
- `app/share/[id]/page.tsx` - Add QR code button and modal

---

### 2.2 Download Counter Display

**Description:** Show how many times each file has been downloaded on the share page.

#### Database Changes

**New Column:** `files` table
```sql
ALTER TABLE files ADD COLUMN download_count INTEGER DEFAULT 0;
```

**API Changes:**

1. `GET /api/share/[id]/files`
   - Return `downloadCount` in file metadata

2. `GET /api/share/[id]/download/[fileId]`
   - Increment `download_count` on each download
   - Use atomic increment: `download_count = download_count + 1`

#### UI Changes

- `/app/share/[id]/page.tsx`
  - Display download count below download button
  - Format: "⬇️ 12 downloads" or "⬇️ Download"

---

### 2.3 Social Share Buttons

**Description:** One-click sharing to social platforms from share page.

**Implementation:**

**New Component:** `components/share/social-share.tsx`

```typescript
interface ShareUrl {
  url: string;
  title?: string;
}

const platforms = [
  { name: 'Twitter', icon: 'twitter', getUrl: (s: ShareUrl) => 
    `https://twitter.com/intent/tweet?url=${encodeURIComponent(s.url)}` },
  { name: 'LinkedIn', icon: 'linkedin', getUrl: (s: ShareUrl) => 
    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(s.url)}` },
  { name: 'Facebook', icon: 'facebook', getUrl: (s: ShareUrl) => 
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(s.url)}` },
  { name: 'Email', icon: 'mail', getUrl: (s: ShareUrl) => 
    `mailto:?subject=Shared files&body=Check out these files: ${encodeURIComponent(s.url)}` },
];
```

**UI Placement:**
- Share page header, next to QR code button
- Share dropdown/menu with platform options

**Files to Modify:**
- `app/share/[id]/page.tsx` - Add social share component

---

## Phase 3: Backend Features (P2)

### 3.1 Download Notifications (Email Alerts)

**Description:** Send email to share creator when files are downloaded.

**Dependencies:** Already installed (`resend`, `@react-email/components`)

#### Database Changes

**New Table:** `share_notifications`

```sql
CREATE TABLE share_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID REFERENCES shares(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  notify_on_download BOOLEAN DEFAULT true,
  notify_on_view BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**API Changes:**

1. Create `lib/email/download-notification.ts`
   - Email template for download notification
   - Include: share link, file name, download time, download count

2. Modify `GET /api/share/[id]/download/[fileId]`
   - After successful download URL generation
   - Query notifications for this share
   - If `notify_on_download` is true, send email via Resend

3. New API endpoint: `PATCH /api/shares/[id]/notifications`
   - Enable/disable download notifications for a share

#### Dashboard UI Changes

- `/app/(dashboard)/dashboard/settings/page.tsx` or new section
- Toggle for "Email me when files are downloaded"

#### Email Template

```html
<Html>
  <Body>
    <p>Someone downloaded a file from your share!</p>
    <ul>
      <li><strong>File:</strong> {filename}</li>
      <li><strong>Time:</strong> {downloadTime}</li>
      <li><strong>Share:</strong> {shareUrl}</li>
    </ul>
  </Body>
</Html>
```

---

### 3.2 Share Analytics Dashboard

**Description:** Track and display view/download analytics for shares.

#### Database Changes

**New Table:** `share_analytics`

```sql
CREATE TABLE share_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID REFERENCES shares(id) ON DELETE CASCADE,
  event_type VARCHAR(20) NOT NULL, -- 'view', 'download', 'download_file'
  file_id UUID REFERENCES files(id) ON DELETE SET NULL,
  ip_hash VARCHAR(64), -- Hashed IP for unique visitor tracking
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_share_analytics_share_id ON share_analytics(share_id);
CREATE INDEX idx_share_analytics_created_at ON share_analytics(created_at);
```

**API Changes:**

1. New endpoint: `GET /api/shares/[id]/analytics`
   - Returns: total views, unique visitors, downloads per file, timeline data
   - Query params: `?from=2026-01-01&to=2026-02-15`

2. Modify `/api/share/[id]/verify` - Track view event
3. Modify `/api/share/[id]/download/[fileId]` - Track download event

#### Dashboard UI Changes

**New Page:** `/app/(dashboard)/dashboard/analytics/page.tsx`

Components:
- `components/dashboard/analytics/overview-cards.tsx` - Summary stats
- `components/dashboard/analytics/chart.tsx` - Timeline chart
- `components/dashboard/analytics/file-table.tsx` - Per-file breakdown

**Stats to Display:**
- Total views
- Unique visitors (by IP hash)
- Total downloads
- Downloads per file
- Timeline (views/downloads over time)

---

### 3.3 File Request / Upload Links

**Description:** Allow users to create links where others can upload files TO them (inverse of current share flow).

#### Database Changes

**New Table:** `file_requests`

```sql
CREATE TABLE file_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_link VARCHAR(12) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  description TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  max_file_size BIGINT DEFAULT 104857600, -- 100MB default
  max_files INTEGER DEFAULT 10,
  require_email BOOLEAN DEFAULT false,
  allow_multiple_uploaders BOOLEAN DEFAULT true,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'paused', 'completed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Files uploaded via request
CREATE TABLE request_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES file_requests(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  size BIGINT NOT NULL,
  mime_type VARCHAR(100),
  s3_key VARCHAR(500) NOT NULL,
  uploaded_by_email VARCHAR(255),
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### New API Routes

1. `POST /api/request/create` - Create file request
2. `GET /api/request/[id]` - Get request details
3. `POST /api/request/[id]/upload` - Upload file to request
4. `GET /api/request/[id]/files` - List uploaded files
5. `GET /api/user/requests` - List user's file requests (dashboard)
6. `PATCH /api/request/[id]` - Update request (pause, extend expiry)
7. `DELETE /api/request/[id]` - Delete request

#### New Pages

1. `/request/[id]` - Public upload page for file requests
2. `/dashboard/requests` - Dashboard page to manage requests

#### UI Components

- `app/(dashboard)/dashboard/requests/page.tsx` - Request management
- `app/request/[id]/page.tsx` - Public upload interface
- `components/request/upload-zone.tsx` - Dropzone for uploads

---

## Implementation Sequence

### Sprint 1: Security (Day 1)

```
✓ Fix Password Protection
  - Modify verify route
  - Modify files route  
  - Modify download routes
  - Update client
```

### Sprint 2: Quick UI (Days 2-4)

```
✓ QR Code Generation
  - Install qrcode package
  - Create QR component
  - Integrate into share page

✓ Download Counter
  - Add database column
  - Modify download API
  - Update UI display

✓ Social Share Buttons
  - Create social share component
  - Add to share page
```

### Sprint 3: Email Notifications (Day 5)

```
✓ Download Notifications
  - Create notifications table
  - Build email template
  - Wire up to download API
  - Add dashboard toggle
```

### Sprint 4-5: Analytics (Days 6-10)

```
✓ Share Analytics
  - Create analytics table
  - Add tracking to existing routes
  - Build analytics API
  - Create dashboard page
```

### Sprint 6-7: File Requests (Days 11-15)

```
✓ File Request Feature
  - Create database tables
  - Build upload flow APIs
  - Create upload page
  - Create dashboard management
```

---

## Risk Assessment

| Feature | Risk Level | Mitigation |
|---------|------------|------------|
| Password Fix | High | Thorough testing of all access paths |
| QR Code | Low | Simple library integration |
| Download Counter | Low | Atomic DB increment |
| Social Share | Low | Client-side URL generation |
| Email Notifications | Medium | Rate limiting, Resend reliability |
| Analytics | Medium | Index optimization, data retention policy |
| File Requests | High | Security review, file validation |

---

## Testing Checklist

### Password Protection
- [ ] Access share without password (should fail)
- [ ] Access share with correct password (should succeed)
- [ ] Access files after password verification (should succeed)
- [ ] Download file after password verification (should succeed)
- [ ] Access share after cookie expires (should re-prompt)

### QR Code
- [ ] QR code generates correctly
- [ ] QR code scans to correct URL
- [ ] QR code displays in modal
- [ ] Works on mobile devices

### Download Counter
- [ ] Counter increments on download
- [ ] Counter displays correctly on UI
- [ ] Multiple downloads increment correctly

### Social Share
- [ ] Twitter share opens correctly
- [ ] LinkedIn share opens correctly
- [ ] Facebook share opens correctly
- [ ] Email opens mail client

### Email Notifications
- [ ] Email sends on download
- [ ] Email contains correct information
- [ ] Toggle works in dashboard
- [ ] Resend handles failures gracefully

### Analytics
- [ ] Views tracked on verify
- [ ] Downloads tracked per file
- [ ] Dashboard displays correct data
- [ ] Date filtering works

### File Requests
- [ ] Can create request
- [ ] Public page loads
- [ ] File upload works
- [ ] Uploader sees confirmation
- [ ] Owner can view/download files

---

## Dependencies Summary

**New NPM Packages:**
- `qrcode` - QR code generation

**Existing (to use):**
- `resend` - Email sending
- `@react-email/components` - Email templates
- `@supabase/supabase-js` - Database

**No new services required.**

---

## Success Metrics

1. Password protection fully enforced across all access paths
2. Users can generate QR codes for any share
3. Download counts visible on share page
4. Social sharing functional
5. Email notifications sent reliably
6. Analytics dashboard provides actionable insights
7. File requests work end-to-end

---

*This plan is ready for implementation upon approval.*
