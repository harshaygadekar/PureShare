# Audit Fixes Checklist

This checklist turns the repository audit into an implementation plan, ordered by priority.

## Critical - Fix First

- [ ] Make share uploads transactional or stateful
  - Problem: `app/api/upload/files/route.ts` inserts file metadata and increments `shares.file_count` before the S3 upload finishes, while `app/upload/page.tsx` performs the actual browser upload afterward.
  - Risk: failed uploads leave broken file records, incorrect counts, and unusable share pages.
  - Fix:
    - add a `pending` or `upload_status` field for uploaded files, or
    - split the flow into `presign -> upload -> finalize`, and only mark files active after successful S3 upload.
  - Files:
    - `app/api/upload/files/route.ts`
    - `app/upload/page.tsx`

- [ ] Prevent S3 key collisions for duplicate filenames
  - Problem: `lib/storage/s3.ts` uses `uploads/${shareId}/${sanitizedFilename}`.
  - Risk: duplicate filenames in the same share overwrite each other in S3.
  - Fix: generate unique object keys using a UUID, nanoid, or timestamp suffix while preserving the original filename in metadata.
  - Files:
    - `lib/storage/s3.ts`
    - `app/api/upload/files/route.ts`

- [ ] Fix request upload architecture to avoid proxying files through Next.js
  - Problem: `app/request/[id]/page.tsx` sends the full file to `app/api/request/[id]/upload/route.ts`, which parses `formData()` only to issue a presigned URL.
  - Risk: wasted bandwidth, higher latency, and body-size/serverless failures.
  - Fix: send file metadata only, then upload bytes directly to S3 from the browser.
  - Files:
    - `app/request/[id]/page.tsx`
    - `app/api/request/[id]/upload/route.ts`

- [ ] Prevent orphaned request file records
  - Problem: `request_files` rows are created before the S3 upload succeeds.
  - Risk: request owners see files that do not exist in storage.
  - Fix: reuse the same finalize or `pending` pattern as share uploads.
  - Files:
    - `app/api/request/[id]/upload/route.ts`
    - `app/request/[id]/page.tsx`

- [ ] Correct misleading security and privacy claims immediately
  - Problem: the product claims end-to-end encryption, client-side encryption, zero-knowledge architecture, military-grade encryption, and automatic deletion guarantees that are not implemented in the reviewed code.
  - Risk: trust, legal, compliance, and reputational exposure.
  - Fix: either implement real client-side encryption and verified deletion workflows, or change the copy to match the real system behavior.
  - Files:
    - `app/page.tsx`
    - `app/upload/page.tsx`
    - `components/marketing/features.tsx`
    - `components/marketing/security.tsx`
    - `components/marketing/hero.tsx`
    - `app/(marketing)/privacy/page.tsx`
    - `app/(dashboard)/dashboard/settings/page.tsx`
    - `app/(marketing)/about/page.tsx`

## High Priority - Production Hardening

- [ ] Enable real rate limiting on sensitive endpoints
  - Problem: `lib/middleware/rate-limit.ts` exists but is not used by the share, upload, download, or verify routes.
  - Risk: brute force on passwords, abuse of upload routes, and expensive download abuse.
  - Fix: wrap route handlers with `withRateLimit` and apply route-specific limiters for password verification, anonymous uploads, and downloads.
  - Files:
    - `lib/middleware/rate-limit.ts`
    - `app/api/share/[id]/verify/route.ts`
    - `app/api/upload/create/route.ts`
    - `app/api/upload/files/route.ts`
    - `app/api/request/[id]/upload/route.ts`
    - `app/api/share/[id]/download/[fileId]/route.ts`
    - `app/api/share/[id]/download-all/route.ts`

- [ ] Enforce environment validation at startup
  - Problem: `lib/utils/env-validation.ts` is implemented but never called, while `lib/db/supabase.ts` and config files silently fall back to empty or placeholder values.
  - Risk: broken production deploys fail at runtime instead of failing fast.
  - Fix: call `validateEnv()` during startup and remove placeholder defaults for Supabase and S3 configuration.
  - Files:
    - `lib/utils/env-validation.ts`
    - `lib/db/supabase.ts`
    - `config/constants.ts`
    - `lib/storage/s3.ts`

- [ ] Lock down the health endpoint
  - Problem: `app/api/health/route.ts` exposes environment information plus raw database and storage failure messages to any caller.
  - Risk: infrastructure disclosure and recon value for attackers.
  - Fix:
    - restrict access to admins or authenticated users,
    - redact detailed errors in production,
    - replace `ListBucketsCommand` with a bucket-specific lightweight check.
  - Files:
    - `app/api/health/route.ts`

- [ ] Make download counting atomic
  - Problem: `app/api/share/[id]/download/[fileId]/route.ts` reads `download_count` and writes back `+1` non-atomically.
  - Risk: concurrent downloads lose increments.
  - Fix: use a DB-side atomic increment through SQL, RPC, or a single update expression.
  - Files:
    - `app/api/share/[id]/download/[fileId]/route.ts`

- [ ] Fix notification lookup to use file ID, not filename
  - Problem: the notification helper re-queries the downloaded file by `share_id + filename`.
  - Risk: duplicate filenames can return the wrong row or fail.
  - Fix: pass `fileId` and the new download count directly to the notification function.
  - Files:
    - `app/api/share/[id]/download/[fileId]/route.ts`

- [ ] Enforce expiration policy consistently on share updates
  - Problem: `PATCH /api/shares/[id]` accepts any positive `extendHours`, bypassing the limits enforced during share creation.
  - Risk: direct callers can create longer-lived shares than intended.
  - Fix: validate patch input with Zod and reuse the expiration policy from `lib/validations/share.ts`.
  - Files:
    - `app/api/shares/[id]/route.ts`
    - `lib/validations/share.ts`

## High Priority - Reliability and Correctness

- [ ] Fix request page loading state bug
  - Problem: `loadRequestDetails()` returns early on non-OK responses without calling `setIsLoading(false)`.
  - Risk: users can get stuck on a loading spinner for missing or expired requests.
  - Fix: move loading cleanup into `finally` or set loading false before each early return.
  - Files:
    - `app/request/[id]/page.tsx`

- [ ] Stop masking API failures as empty success states
  - Problem: `app/api/user/requests/route.ts` returns `{ requests: [] }` even when DB access fails.
  - Risk: operational failures appear as "no data" in the dashboard.
  - Fix: return a real error response and let the client show retry or error UI.
  - Files:
    - `app/api/user/requests/route.ts`
    - `app/(dashboard)/dashboard/requests/page.tsx`

- [ ] Fix analytics date filtering
  - Problem: `from` and `to` are parsed in `app/api/shares/[id]/analytics/route.ts`, but the resulting filter is never applied.
  - Risk: analytics results are incorrect for filtered queries.
  - Fix: apply the date filters to all analytics queries or centralize filtering in a shared query helper.
  - Files:
    - `app/api/shares/[id]/analytics/route.ts`

- [ ] Use the current browser origin when constructing share URLs
  - Problem: `app/upload/page.tsx` uses `APP_CONFIG.url` to build the final share link.
  - Risk: preview, staging, LAN, or alternate-domain usage can generate the wrong URL.
  - Fix: use `window.location.origin` on the client or a shared base URL helper.
  - Files:
    - `app/upload/page.tsx`
    - `lib/utils/base-url.ts`

## Medium Priority - Performance

- [ ] Stream ZIP creation instead of buffering files in memory
  - Problem: `app/api/share/[id]/download-all/route.ts` reads every S3 object fully into memory using `transformToByteArray()`.
  - Risk: large archives can exhaust server memory.
  - Fix: append S3 streams directly to `archiver`.
  - Files:
    - `app/api/share/[id]/download-all/route.ts`

- [ ] Fail clearly when ZIP archives are incomplete
  - Problem: the ZIP route logs per-file errors and still returns success.
  - Risk: users receive partial archives with no clear warning.
  - Fix: abort the archive on missing files, or include a manifest or explicit partial-failure notice.
  - Files:
    - `app/api/share/[id]/download-all/route.ts`

- [ ] Avoid buffering full downloads in the browser
  - Problem: `lib/downloads/client-download.ts` builds full Blob objects in memory for single-file and ZIP downloads.
  - Risk: large downloads can freeze or crash the tab.
  - Fix: prefer direct download navigation for presigned URLs, or adopt a streaming-to-disk pattern where supported.
  - Files:
    - `lib/downloads/client-download.ts`
    - `app/share/[id]/page.tsx`

- [ ] Replace N+1 request count queries with aggregation
  - Problem: `app/api/user/requests/route.ts` fetches each request and then runs a separate count query per request.
  - Risk: owner dashboards slow down as request counts grow.
  - Fix: use SQL aggregation, a view, or an RPC to return requests with counts in one call.
  - Files:
    - `app/api/user/requests/route.ts`

- [ ] Replace analytics row-scanning with aggregated queries
  - Problem: `app/api/shares/[id]/analytics/route.ts` pulls raw analytics rows into memory and aggregates in application code.
  - Risk: expensive response times on large datasets.
  - Fix: move counts, timelines, and unique-visitor calculations into SQL aggregation or RPCs.
  - Files:
    - `app/api/shares/[id]/analytics/route.ts`

## Medium Priority - UI, UX, and Accessibility

- [ ] Fix invalid interactive nesting on the home page CTA
  - Problem: `app/page.tsx` nests a `button` inside a `Link`.
  - Risk: invalid HTML and accessibility issues.
  - Fix: use a styled `Link` directly, or `Button asChild`.
  - Files:
    - `app/page.tsx`

- [ ] Make file preview cards keyboard-accessible
  - Problem: `app/share/[id]/page.tsx` uses clickable `div` elements with `onClick` for previews.
  - Risk: keyboard and assistive-technology users cannot access previews reliably.
  - Fix: replace preview wrappers with `button` elements or add proper role, tab index, and keyboard handlers.
  - Files:
    - `app/share/[id]/page.tsx`

- [ ] Require valid email before request upload begins
  - Problem: email is only enforced server-side, but the upload is triggered by file selection.
  - Risk: users hit avoidable errors after choosing a file.
  - Fix: disable the file input until required fields are valid.
  - Files:
    - `app/request/[id]/page.tsx`

- [ ] Remove or implement the footer newsletter form
  - Problem: the form prevents default submission and has no backend or feedback path.
  - Risk: users interact with a dead-end form.
  - Fix: connect it to a real endpoint or remove it until it is supported.
  - Files:
    - `components/layout/footer.tsx`

- [ ] Align public limits and product messaging
  - Problem: pricing, terms, and runtime config disagree on file size limits, retention, and tracking behavior.
  - Risk: user confusion and trust erosion.
  - Fix: define one source of truth for public-facing limits and claims.
  - Files:
    - `app/(marketing)/pricing/page.tsx`
    - `app/(marketing)/terms/page.tsx`
    - `config/constants.ts`

## Medium Priority - Code Quality and Maintainability

- [ ] Fix type contract drift between API types and actual responses
  - Problem: some DTO names and shapes no longer match route behavior, such as `previewUrl` being used as an upload URL.
  - Risk: misleading types and fragile client code.
  - Fix: rename DTOs to match behavior and generate DB types from the Supabase schema where possible.
  - Files:
    - `types/api.ts`
    - `types/database.ts`
    - `app/api/upload/files/route.ts`

- [ ] Remove duplicated or conflicting global styling definitions
  - Problem: `app/globals.css` contains duplicate base and root sections that can override the design token system.
  - Risk: difficult-to-debug styling behavior.
  - Fix: keep a single source of truth for theme variables and base styles.
  - Files:
    - `app/globals.css`
    - `styles/design-tokens.css`

- [ ] Consolidate duplicate landing-page implementations
  - Problem: both `app/page.tsx` and `app/(marketing)/page.tsx` represent home-page level experiences.
  - Risk: content and product messaging drift.
  - Fix: merge them into a single home-page strategy or remove the unused one.
  - Files:
    - `app/page.tsx`
    - `app/(marketing)/page.tsx`
    - `app/(marketing)/layout.tsx`

- [ ] Extract route business logic into domain services
  - Problem: route handlers currently mix validation, persistence, authorization, and side effects.
  - Risk: duplication across endpoints and harder testing.
  - Fix: create shared services for share creation, upload finalization, verification, analytics, and notifications.
  - Files:
    - `app/api/upload/create/route.ts`
    - `app/api/upload/files/route.ts`
    - `app/api/share/[id]/verify/route.ts`
    - `app/api/share/[id]/files/route.ts`
    - `app/api/share/[id]/download/[fileId]/route.ts`
    - `app/api/request/create/route.ts`
    - `app/api/request/[id]/upload/route.ts`

## Cleanup and Lint Debt

- [ ] Fix current ESLint errors and warnings
  - High-signal issues from the current lint run:
    - `components/ui/scroll-morph-hero.tsx`: impure `Math.random()` use during render-time memoization.
    - `components/share/qr-code-modal.tsx`: synchronous state changes inside an effect.
    - marketing pages contain unescaped entities and stale copy problems.
    - multiple files contain unused imports, unused variables, and hook dependency issues.
  - Files:
    - `components/ui/scroll-morph-hero.tsx`
    - `components/share/qr-code-modal.tsx`
    - `app/(marketing)/about/page.tsx`
    - `app/(marketing)/privacy/page.tsx`
    - `app/(marketing)/terms/page.tsx`
    - plus other files surfaced by `npm run lint`

- [ ] Review use of raw `<img>` tags
  - Problem: several files use raw `<img>` and trigger Next lint warnings.
  - Risk: slower image delivery and lower-quality loading behavior.
  - Fix: use `next/image` where practical, or document why raw image tags are required for presigned media URLs and previews.
  - Files:
    - `app/share/[id]/page.tsx`
    - `components/features/file-upload.tsx`
    - `components/share/qr-code-modal.tsx`
    - `components/ui/scroll-morph-hero.tsx`

## Documentation and Testing

- [ ] Update README to match the real architecture and feature set
  - Problem: the README still describes outdated authentication assumptions, outdated limits, and planned features that now exist or differ.
  - Fix: document Clerk auth, file requests, analytics, actual size limits, and the real security model.
  - Files:
    - `README.md`

- [ ] Add automated tests for core flows
  - Missing coverage areas:
    - share creation
    - file registration and upload finalization
    - password-protected share access
    - individual download and ZIP download
    - file request creation and public upload
    - dashboard data APIs
  - Fix: add test tooling and scripts in `package.json`, then cover the highest-risk flows first.
  - Files:
    - `package.json`
    - test files to be added

## Suggested Execution Order

- [ ] Phase 1: data integrity
  - upload finalization for shares
  - upload finalization for requests
  - unique S3 keys
  - atomic download counts

- [ ] Phase 2: production hardening
  - rate limiting
  - env validation
  - health endpoint lockdown
  - share update validation

- [ ] Phase 3: performance
  - stream ZIP creation
  - avoid browser-side full buffering
  - remove N+1 queries and row-scanning analytics

- [ ] Phase 4: product truth and UX
  - correct security and privacy claims
  - fix accessibility issues
  - align limits and public messaging
  - remove dead-end UI elements

- [ ] Phase 5: cleanup
  - fix lint errors and warnings
  - consolidate duplicate pages and styling sources
  - update docs and add tests
