# Video Sharing + Mixed-Media Integration Plan (PureShare, 41f5962, 2026-02-11)

## 1) Executive Summary
- **Goal**: Add video sharing with a **500MB per-video limit** and **selectable video expiration options**, while supporting **mixed image+video shares in the same link**.
- **Recommended placement**: Extend existing `/upload` and `/share/[id]` flows; no new top-level route required.
- **Architecture style**: Keep current Next.js App Router + API routes + Supabase + S3 structure, with targeted schema/index hardening.
- **Delivery model**: 2 implementation sprints + 1 hardening/release sprint (Scrum cadence), with measurable acceptance criteria.
- **Top risks to address during implementation**:
  1. Password-protected shares are not enforced in file/download routes (`app/api/share/[id]/verify/route.ts:54` vs `app/api/share/[id]/files/route.ts:48` and `app/api/share/[id]/download/[fileId]/route.ts:31`).
  2. Upload validation currently uses one global size limit (`config/constants.ts:12`, `lib/validations/share.ts:36`), not media-specific limits.
  3. Share page rendering assumes image previews for all files (`app/share/[id]/page.tsx:428`), so video UX is currently broken.

---

## 2) Current-State Evidence (Architect Baseline)

| Area | Evidence | Impact on Mixed-Media Video Feature |
|---|---|---|
| File type allowlist | `config/constants.ts:14`, `.env.example:40` only image MIME types | Videos blocked end-to-end today |
| File size control | Global 100MB via `config/constants.ts:12`, used in `lib/validations/share.ts:36` | Needs per-media limit (500MB for videos) |
| Upload UI intake | Dropzone accepts only image extensions in `components/features/file-upload.tsx:39` | Must accept both image and video MIME/extensions |
| Expiration selector | Static options at `app/upload/page.tsx:333`-`app/upload/page.tsx:336` | Needs video profile options |
| Share creation contract | `app/api/upload/create/route.ts:28` only consumes password + expirationHours | Needs expiration profile persistence |
| Upload registration | `app/api/upload/files/route.ts:30` validates schema + inserts metadata | Must enforce MIME-specific size policy |
| Share rendering | Grid/dialog uses `<img>` (`app/share/[id]/page.tsx:428`, `app/share/[id]/page.tsx:501`) | Must branch rendering for video files |
| Reusable components | `app/share/[id]/_components/FileCard.tsx:24` already has video icon logic | Can accelerate mixed-media rendering refactor |
| Dashboard query patterns | `app/api/user/shares/route.ts:26`, `app/(dashboard)/dashboard/page.tsx:18` | Add media indexes before volume growth |

---

## 3) Product Scope and Decisions (Product-Manager View)

## 3.1 Scope (v1)
- Enable uploads for `video/mp4`, `video/webm`, `video/quicktime`.
- Enforce max **500MB per video file**.
- Keep existing image sharing behavior unchanged.
- Support **mixed shares** (images + videos in one share link).
- Add video expiration option profile on upload.
- Show playable previews on share page for video files.

## 3.2 Non-goals (v1)
- No resumable/multipart upload orchestration UI.
- No transcoding, thumbnails, or adaptive streaming.
- No advanced timeline editing/media management inside dashboard (beyond listing/filtering).

## 3.3 Routing and Navigation
- **Page location**: Reuse `/upload` for all media (`app/upload/page.tsx:21`).
- **Public view**: Reuse `/share/[id]` for mixed-media rendering (`app/share/[id]/page.tsx:21`).
- **Dashboard**: Add optional media filter to `/dashboard/shares` backed by query params on `/api/user/shares` (`app/api/user/shares/route.ts:21`).
- **Header/nav**: No new top-level nav item required; optional CTA copy update only (`components/layout/header.tsx:139`).

## 3.4 Expiration Policy for Mixed Shares
- **One expiration per share** (not per-file).
- If upload selection includes at least one video, UI defaults to **video expiration profile** options.
- Image-only shares keep current default profile options.
- Mixed shares are fully supported; expiration is selected once and applies to all files in the share.

## 3.5 Why Mixed-Media Is In-Scope Now
- Current data model already stores files independently with `mime_type` on each file row (`app/api/upload/files/route.ts:30`), which naturally supports image+video in one share.
- Current upload flow already handles multiple files under one share (`app/upload/page.tsx:56`), so mixed uploads are an extension of existing behavior, not a new architecture.
- Current share page already iterates files from a single share (`app/share/[id]/page.tsx:401`); mixed rendering is mainly a UI branch (`img` vs `video`) plus validation/config hardening.
- Therefore, mixed-media can ship in v1 without introducing separate "image-only" and "video-only" products.

---

## 4) UX Research Plan (UX-Researcher View)

## 4.1 Research Questions
- Do users understand 500MB limit applies to video files specifically?
- Is expiration behavior clear when both image and video are in one share?
- Is playback/download behavior clear for mixed grid items?

## 4.2 Methods
- 6 moderated usability sessions (desktop + mobile):
  1. Upload 3 images + 1 MP4 (300MB), select expiration, create link.
  2. Attempt >500MB video and interpret the rejection.
  3. Open mixed share and play video + download an image.
- Post-task confidence scoring and SUS-lite.

## 4.3 Success Metrics
- Task completion >= 90%.
- Expiration misunderstanding in mixed upload <= 10%.
- Error comprehension for >500MB rejection >= 85%.

---

## 5) UI/Interaction Design Plan (UI-Designer View)

## 5.1 Upload Screen Changes (`/upload`)
- Keep a **single dropzone** (no hard media split); accept image + video.
- Update helper text to show:
  - Images: up to configured image limit.
  - Videos: up to 500MB each.
- Expiration selector behavior:
  - Standard profile options for image-only selection.
  - Video profile options auto-selected when any video present.
- Add inline badge/chip next to each selected file showing `IMAGE` or `VIDEO`.

### Target files
- `app/upload/page.tsx:24`
- `app/upload/page.tsx:300`
- `components/features/file-upload.tsx:37`
- `components/features/file-upload.tsx:133`

## 5.2 Share Page Mixed Rendering (`/share/[id]`)
- Render image cards with current behavior.
- Render video cards using `<video controls preload="metadata">` in card/dialog.
- Maintain existing download UX for both media types.
- Keep fallback icon for unknown/unpreviewable MIME types.

### Target files
- `app/share/[id]/page.tsx:401`
- `app/share/[id]/page.tsx:428`
- `app/share/[id]/page.tsx:501`
- Optional refactor to reusable components:
  - `app/share/[id]/_components/FileCard.tsx:24`
  - `app/share/[id]/_components/FilePreview.tsx:35`

## 5.3 Accessibility Requirements
- Keyboard-operable video controls.
- Clear labels for mixed-media limits and expiration profile.
- `preload="metadata"` to reduce data and avoid unexpected autoplay behavior.

---

## 6) Backend and Server Integration Plan (Architect + Security)

## 6.1 API Contract Updates

### `POST /api/upload/create`
Current: `{ password?, expirationHours? }` (`app/api/upload/create/route.ts:28`)  
Proposed:
```json
{
  "password": "optional",
  "expirationHours": 24,
  "expirationProfile": "standard|video"
}
```

### `POST /api/upload/files`
Current payload already includes `mimeType`, `size` (`app/upload/page.tsx:67`-`app/upload/page.tsx:70`), validated by schema (`lib/validations/share.ts:33`).  
Proposed:
- Enforce MIME allowlist across image + video types.
- Enforce MIME-specific size limits (image vs video).
- Update share metadata flags (`has_image`, `has_video`) after each file registration.

## 6.2 Validation and Config Strategy
- Add media-specific config in `config/constants.ts`:
  - `maxImageFileSize` (existing default 100MB)
  - `maxVideoFileSize` (500MB)
  - `allowedImageTypes`
  - `allowedVideoTypes`
  - `expirationProfiles.standardHours[]`
  - `expirationProfiles.videoHours[]`
- Replace single size check (`lib/validations/share.ts:36`) with MIME-aware validation.

## 6.3 Share Access Security Hardening (release blocker)
- Add short-lived verification token/cookie in `POST /api/share/[id]/verify`.
- Enforce token in:
  - `GET /api/share/[id]/files`
  - `GET /api/share/[id]/download/[fileId]`
  - `GET /api/share/[id]/download-all`
- Rationale: closes current password bypass before enabling higher-value video traffic.

## 6.4 S3 and Transfer Considerations
- Keep current presigned PUT flow for v1 (`lib/storage/s3.ts:21`).
- Add UI timeout/retry guidance for larger video uploads.
- v2 option: multipart upload path for improved reliability >250MB.

---

## 7) Database Modifications and Optimization (Database-Optimizer View)

## 7.1 Required Schema Changes
Create migration file: `supabase/migrations/20260211_add_video_mixed_share_support.sql`

```sql
-- Track media composition at share level for mixed-media filtering
ALTER TABLE shares
  ADD COLUMN IF NOT EXISTS has_image boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_video boolean NOT NULL DEFAULT false;

-- Persist profile/selection for analytics and policy checks
ALTER TABLE shares
  ADD COLUMN IF NOT EXISTS expiration_profile text NOT NULL DEFAULT 'standard'
  CHECK (expiration_profile IN ('standard', 'video')),
  ADD COLUMN IF NOT EXISTS expiration_hours_selected integer;

-- Baseline integrity
ALTER TABLE files
  ADD CONSTRAINT chk_files_size_positive CHECK (size > 0);
```

## 7.2 Index Strategy
```sql
-- Existing query acceleration for dashboard/user listing
CREATE INDEX IF NOT EXISTS idx_shares_user_created_at
  ON shares (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_shares_user_expires_at
  ON shares (user_id, expires_at DESC);

-- Mixed-media filtering support
CREATE INDEX IF NOT EXISTS idx_shares_user_media_created_at
  ON shares (user_id, has_video, has_image, created_at DESC);

-- Share file retrieval
CREATE INDEX IF NOT EXISTS idx_files_share_uploaded_at
  ON files (share_id, uploaded_at DESC);

-- Optional targeted index for video-heavy shares
CREATE INDEX IF NOT EXISTS idx_files_share_video_uploaded_at
  ON files (share_id, uploaded_at DESC)
  WHERE mime_type LIKE 'video/%';
```

## 7.3 Performance Targets
- `GET /api/user/shares` p95 < 120ms for 50k shares/user.
- `GET /api/share/[id]/files` p95 < 150ms for 500 files/share.
- Index scan usage > 95% on these endpoints.

## 7.4 Query Plan Validation
- Run `EXPLAIN (ANALYZE, BUFFERS)` for:
  - user shares listing (`app/api/user/shares/route.ts:26`)
  - recent shares (`app/(dashboard)/dashboard/page.tsx:38`)
  - share files listing (`app/api/share/[id]/files/route.ts:49`)

---

## 8) Implementation Steps (Plan Rule: Actionable Work Plan)

| Step | Scope | Primary Files | Owner | Est. |
|---|---|---|---|---|
| 1 | Config/env additions for image/video MIME split, 500MB video cap, expiration profiles | `config/constants.ts:11`, `.env.example:37` | Backend | 0.5d |
| 2 | Zod schema refactor for MIME-aware size rules + expiration profile validation | `lib/validations/share.ts:8` | Backend | 0.75d |
| 3 | Create-share API updates for `expirationProfile` + selected hours persistence | `app/api/upload/create/route.ts:28`, `types/api.ts:5`, `types/database.ts:5` | Backend | 1d |
| 4 | Upload-files API enforcement for mixed media + share flags (`has_image`, `has_video`) | `app/api/upload/files/route.ts:30` | Backend | 1d |
| 5 | Migration + indexes + query-plan benchmarking | `supabase/migrations/20260211_add_video_mixed_share_support.sql` | DB | 1d |
| 6 | Upload UI mixed-media support + dynamic expiration profile options | `app/upload/page.tsx:24`, `components/features/file-upload.tsx:37` | Frontend | 1.25d |
| 7 | Share page mixed-media rendering (image + video cards/dialog) | `app/share/[id]/page.tsx:401`, `app/share/[id]/page.tsx:483` | Frontend | 1.25d |
| 8 | Dashboard/API media filters (`all`, `images`, `videos`, `mixed`) | `app/api/user/shares/route.ts:21`, `app/(dashboard)/dashboard/shares/page.tsx` | Full-stack | 1d |
| 9 | Password verification token enforcement across read/download endpoints | `app/api/share/[id]/verify/route.ts:54`, `app/api/share/[id]/files/route.ts:48`, `app/api/share/[id]/download/[fileId]/route.ts:31`, `app/api/share/[id]/download-all/route.ts:33` | Backend | 1.25d |
| 10 | QA + load test + rollout checklist | test suite + runbooks | QA/DevOps | 1d |

---

## 9) Acceptance Criteria (Testable)

1. Upload accepts `video/mp4`, `video/webm`, `video/quicktime` and rejects unsupported video MIME with 400.
2. Any video file with `size > 524288000` bytes is rejected server-side with explicit error message.
3. Mixed upload (images + videos in one share) succeeds when all files pass MIME/size limits.
4. Expiration profile switches to video options when any selected file is video.
5. Share row persists `expiration_profile` and `expiration_hours_selected`.
6. Share row correctly tracks `has_image` / `has_video` flags after file registration.
7. Share page renders playable `<video>` for video files and keeps image previews working.
8. Download endpoints work for both image and video files.
9. Password-protected share cannot fetch files/downloads without successful verification token.
10. Dashboard/API can filter by media composition (`images`, `videos`, `mixed`) with expected results.
11. `GET /api/user/shares` and `GET /api/share/[id]/files` meet p95 latency targets under benchmark dataset.
12. Lint/build pass in CI environment after implementation.

---

## 10) Verification Plan

## 10.1 Automated
- Unit tests: MIME x size validation matrix (image/video + edge sizes).
- API integration tests:
  - create mixed-media share
  - upload 499MB video pass / 501MB fail
  - token-gated file listing/download
- UI tests:
  - mixed selection updates expiration profile
  - mixed share renders image and video cards correctly

## 10.2 Manual QA
- Desktop + mobile upload of MP4/WebM/MOV + image combinations.
- Password-protected mixed share access from new browser session.
- Regression for image-only share flow and download-all.

## 10.3 Performance QA
- DB query explain plans after index migration.
- Endpoint load tests at 100 RPS read path for file listing.

---

## 11) Delivery Management (Scrum + Project Manager View)

## 11.1 Sprint Plan
- **Sprint 1 (Backend + DB)**
  - Steps 1-5 and part of 9.
  - Exit criteria: migrations applied, APIs enforce MIME/size/profile policy, benchmark baseline captured.
- **Sprint 2 (Frontend + Security + QA)**
  - Steps 6-10.
  - Exit criteria: mixed-media upload/share demo + acceptance criteria pass.

## 11.2 Ceremony/Tracking Cadence
- Daily standup: blockers, migration status, token-security path.
- Mid-sprint review: API contract freeze.
- End-sprint demo: mixed upload + share + playback + protected access.
- Retro: upload reliability and error clarity outcomes.

## 11.3 Risk Register
| Risk | Severity | Mitigation |
|---|---|---|
| 500MB uploads fail on weak networks | High | Retry guidance + timeout tuning; multipart upload tracked for v2 |
| Storage cost spike | Medium | Video profile defaults short (24h) + max profile guardrails |
| Security bypass persists | Critical | Ship token enforcement before release gate |
| DB migration uncertainty (no in-repo schema) | High | Staging snapshot migration + rollback SQL |
| Browser memory pressure on preview | Medium | `preload="metadata"`, no autoplay, avoid blob buffering |

## 11.4 Stakeholder Communication
- Product update twice weekly: progress vs acceptance criteria.
- Engineering update daily in sprint board with owner + ETA.
- Release readiness review with security + QA signoff.

---

## 12) Open Questions
1. Should video profile max be 7 days or align with global 30-day cap?
2. Is MOV support required across all browsers or accepted as “download-only fallback” on unsupported platforms?
3. Do we need separate quota/limits for total share size in v1, or only per-file limits?

---

## 13) Recommended Next Actions
1. Approve mixed-media v1 scope and share-level expiration semantics.
2. Approve migration/index bundle and security hardening as release blockers.
3. Start Sprint 1 with config/schema/API updates and staging migration.
