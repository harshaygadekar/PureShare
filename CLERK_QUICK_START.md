# Clerk Quick Start Guide

## 🚀 You're Ready to Go!

Clerk authentication is already configured and working. Here's everything you need to know:

---

## Current Setup

### ✅ What's Working

- **Sign In/Sign Up:** Click "Get Started" or "Sign in" in the header
- **User Menu:** Authenticated users see a profile button with dropdown
- **Protected Routes:** `/dashboard` and `/api/user/*` require auth
- **Anonymous Sharing:** File uploads work without authentication
- **Build:** No errors, production-ready

### 🔑 Your Clerk Keys (Already Configured)

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZmxlZXQtZm93bC0yNS5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_kOwva7nSEx9G0xPm7SdpTC993ZTrWeoZlcTu7G6x4r
```

These are in your `.env.local` and working.

---

## Common Tasks

### 1. Check if User is Authenticated

**Server Component:**
```typescript
import { auth } from '@clerk/nextjs/server';

export default async function MyPage() {
  const { userId } = await auth();

  if (!userId) {
    return <div>Please sign in</div>;
  }

  return <div>Welcome, user {userId}!</div>;
}
```

**Client Component:**
```typescript
'use client';
import { useAuth } from '@clerk/nextjs';

export function MyComponent() {
  const { userId, isLoaded } = useAuth();

  if (!isLoaded) return <div>Loading...</div>;
  if (!userId) return <div>Not signed in</div>;

  return <div>Signed in as {userId}</div>;
}
```

### 2. Get User Information

```typescript
'use client';
import { useUser } from '@clerk/nextjs';

export function UserProfile() {
  const { user } = useUser();

  return (
    <div>
      <p>Name: {user?.firstName} {user?.lastName}</p>
      <p>Email: {user?.primaryEmailAddress?.emailAddress}</p>
      <img src={user?.imageUrl} alt="Avatar" />
    </div>
  );
}
```

### 3. Protect an API Route

```typescript
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Protected logic here
  return NextResponse.json({ data: 'secret' });
}
```

### 4. Create a Protected Page

```typescript
// app/dashboard/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/');
  }

  return <div>Your Dashboard</div>;
}
```

### 5. Sign Out Programmatically

```typescript
'use client';
import { useClerk } from '@clerk/nextjs';

export function SignOutButton() {
  const { signOut } = useClerk();

  return (
    <button onClick={() => signOut()}>
      Sign Out
    </button>
  );
}
```

---

## Clerk Dashboard

Access your Clerk dashboard at: https://dashboard.clerk.com

### What You Can Do:

1. **View Users** - See all registered users
2. **Manage Sessions** - View active sessions
3. **Configure OAuth** - Add Google, GitHub, etc.
4. **Customize UI** - Change colors, logos, text
5. **Add Webhooks** - Sync user data to your database
6. **View Analytics** - Track sign-ups, logins

---

## Adding Features

### Enable Google Sign-In

1. Go to Clerk Dashboard
2. Navigate to "User & Authentication" → "Social Connections"
3. Enable "Google"
4. Follow setup instructions
5. **No code changes needed!**

### Customize Sign-In Modal

Update Header component:

```typescript
<SignInButton mode="modal">
  <Button
    size="sm"
    appearance={{
      elements: {
        rootBox: 'custom-class',
        card: 'custom-card-class'
      }
    }}
  >
    Get Started
  </Button>
</SignInButton>
```

### Link Users to Uploads

When creating a share:

```typescript
import { auth } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  const { userId } = await auth();

  // Create share with optional user_id
  const { data } = await supabase
    .from('shares')
    .insert({
      share_link: shareLink,
      user_id: userId || null, // null for anonymous
      // ... other fields
    });
}
```

---

## File Structure

### Clerk-Related Files

```
/home/hrsh/MEGA_PROJECTS/pureshare/
├── middleware.ts                    # Clerk authentication middleware
├── app/
│   └── layout.tsx                  # ClerkProvider wrapper
├── components/
│   └── layout/
│       └── header.tsx              # Sign in/out buttons
└── .env.local                      # Clerk keys
```

### Security Utilities (Share Passwords)

```
/home/hrsh/MEGA_PROJECTS/pureshare/lib/security/
├── share-link.ts                   # Generate share links
└── password.ts                     # Hash share passwords
```

**Note:** These are for share password protection, NOT user authentication.

---

## Testing

### Local Development

```bash
npm run dev
```

1. Go to http://localhost:3000
2. Click "Get Started"
3. Sign up with a test email
4. Verify it works!

### Production Build

```bash
npm run build
npm start
```

Everything should work in production mode.

---

## Troubleshooting

### Issue: "Clerk keys not found"

**Solution:**
Ensure `.env.local` has the Clerk keys:
```bash
cat .env.local | grep CLERK
```

### Issue: Sign-in modal not opening

**Solution:**
Check browser console for errors. Ensure ClerkProvider is in layout.tsx.

### Issue: Protected routes not working

**Solution:**
Verify middleware.ts has the correct route matchers:
```typescript
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/user(.*)',
]);
```

### Issue: Build failing

**Solution:**
Clear Next.js cache:
```bash
rm -rf .next
npm run build
```

---

## Key Differences from Old System

| Old System | Clerk |
|-----------|-------|
| Custom JWT tokens | Clerk-managed sessions |
| Manual password hashing | Clerk handles passwords |
| Custom login pages | Modal or hosted pages |
| Email verification code | Built-in |
| Password reset flows | Built-in |
| Session refresh logic | Automatic |
| Security updates | Handled by Clerk |

---

## Need Help?

- **Clerk Docs:** https://clerk.com/docs/nextjs
- **Clerk Support:** https://clerk.com/support
- **Community:** https://clerk.com/discord

---

## Summary

✅ Clerk is configured
✅ Authentication works
✅ Anonymous sharing works
✅ Build passes
✅ Ready for production

**You're all set!** Start building amazing features without worrying about auth.
