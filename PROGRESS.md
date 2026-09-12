# HIVE Civic — Project Progress

> **Last updated:** 10 September 2026
> **Current phase:** Supabase/auth security hardening + end-to-end verification

## 1. Current Status

HIVE is a functional civic suggestion-platform prototype with a React/TypeScript frontend, Supabase backend, citizen/admin flows, and a route-aware Three.js/React Three Fiber visual system.

The project has moved beyond the initial prototype architecture. The current priority is to make the existing implementation secure and verifiable before spending the next major effort on visual polish.

**Important:** A committed Supabase migration is not proof that the live Supabase project has executed it. Live database execution still needs verification in AI Studio/Supabase.

---

# 2. Completed

## Project foundation

- [x] React + TypeScript + Vite application
- [x] React Router
- [x] Supabase client
- [x] Supabase environment-variable configuration
- [x] PostgreSQL schema baseline
- [x] Dedicated service layer
- [x] Dedicated 3D subsystem
- [x] Architecture documentation
- [x] Progress tracking documentation

## Citizen product flow

- [x] About/Welcome root route
- [x] Citizen login page
- [x] Citizen registration page
- [x] Password recovery page
- [x] Protected citizen application routes
- [x] Submit suggestion page
- [x] Submission success page
- [x] Track suggestion page
- [x] My Suggestions page
- [x] Citizen suggestion details page
- [x] Anonymous-public-identity option

## Admin product flow

- [x] Separate admin login
- [x] Protected admin dashboard
- [x] Admin suggestion list
- [x] Admin suggestion details/workspace
- [x] Status management UI
- [x] Admin notes support

## Domain model

- [x] Canonical ten categories
- [x] Canonical six statuses
- [x] DSB-YYYY-XXXXXX reference format
- [x] PostgreSQL UUID as internal suggestion identity
- [x] Suggestion status history model
- [x] Suggestion ownership via `user_id`

## 3D system

- [x] Three.js
- [x] React Three Fiber
- [x] Drei
- [x] GSAP
- [x] Motion
- [x] Shared SceneCanvas
- [x] Route-specific scenes
- [x] Reusable 3D objects
- [x] Camera rig
- [x] Particle/effects layer

---

# 3. Supabase / Security Hardening Completed in Repository

## Authentication

- [x] Removed HIVE's localStorage-backed authentication/profile cache from `authService.ts`
- [x] Supabase Auth is now the authentication source
- [x] `getCurrentUserSync()` no longer trusts browser-cached identity
- [x] Citizen sign-in uses Supabase Auth
- [x] Citizen sign-up uses Supabase Auth
- [x] Password reset uses Supabase Auth
- [x] Sign-out uses Supabase Auth
- [x] Admin sign-in uses Supabase Auth + profile role verification
- [x] Browser-provided role metadata is not used to grant admin privileges

## Route protection

- [x] `/app` protected
- [x] `/app/submit` protected
- [x] `/app/submitted` protected
- [x] `/app/track` protected
- [x] `/app/suggestions` protected
- [x] `/app/suggestions/:id` protected
- [x] `/admin/*` protected with admin role requirement
- [x] Citizen login/register use public-only route behavior

## Suggestion persistence

- [x] Suggestion service no longer uses localStorage as the database
- [x] Suggestion creation requires an authenticated Supabase user
- [x] Database UUID is returned and treated as authoritative
- [x] DSB reference ID remains the human-facing identifier

## Public-data protection

- [x] Added `public.public_suggestions` safe projection
- [x] Public suggestion queries use the projection instead of `select *` on the base table
- [x] Projection excludes `user_id`, contact information, admin notes, and storage internals
- [x] Added `public.public_suggestion_status_history` projection

## Status-history integrity

- [x] Client-side status-history writes removed from suggestion service
- [x] Database trigger records initial submission history
- [x] Database trigger records status changes
- [x] Administrative actor is derived from `auth.uid()` for status-change history
- [x] Citizen cannot arbitrarily claim another actor in history

## Photo attachment

- [x] Suggestion is created before photo upload so its UUID is known
- [x] Photo path is UUID-associated
- [x] Added `attach_suggestion_photo` ownership-checked RPC
- [x] Ordinary citizen UPDATE permission is not required merely to attach a photo

## Community support

- [x] Removed localStorage support-state mechanism
- [x] Added `suggestion_supports` table
- [x] Added one-support-per-user/suggestion primary-key constraint
- [x] Added authenticated `add_support` RPC
- [x] Added authenticated `remove_support` RPC
- [x] Frontend support toggling now uses authenticated database state

## RLS hardening migration

- [x] Added `supabase/migrations/001_security_hardening.sql`
- [x] Removed broad public base-table suggestion read policy
- [x] Added citizen ownership-aware suggestion SELECT policy
- [x] Kept admin update/delete authorization behind `is_admin()`
- [x] Hardened profile role constraint to `citizen | admin`
- [x] Hardened `is_admin()` function search path and execution privileges
- [x] Removed arbitrary client status-history insert policies

---

# 4. Important Problems Found and Solved

### Problem: localStorage authentication

**Old:** cached profile/role in localStorage.  
**Fixed:** Supabase Auth session + database profile are authoritative.

### Problem: fake admin/demo authentication risk

**Old:** broad prototype fallback behavior could substitute for genuine authentication.  
**Fixed:** admin login now depends on Supabase Auth and `profiles.role`.

### Problem: public `select *`

**Old:** public suggestion reads could return private fields before React hid them.  
**Fixed:** public service queries use safe projections.

### Problem: status-history actor spoofing

**Old:** browser supplied `changed_by`.  
**Fixed:** database trigger derives status-change actor from `auth.uid()`.

### Problem: frontend support counter manipulation

**Old:** localStorage tracked support and direct-update fallbacks existed.  
**Fixed:** authenticated support table + RPC model.

### Problem: citizen photo update permissions

**Old:** attaching a photo could require broad row UPDATE permissions.  
**Fixed:** ownership-checked attachment RPC.

### Problem: UUID/reference-ID confusion

**Old:** frontend-generated suggestion IDs conflicted with PostgreSQL UUID relationships.  
**Fixed:** PostgreSQL UUID is authoritative; DSB reference is human-facing.

### Problem: `/app` could be reached without authentication

**Old:** main citizen route was not protected even though deeper routes were.  
**Fixed:** `/app` is now behind `ProtectedRoute`.

---

# 5. Current Repository Changes Awaiting AI Studio Pull

The current GitHub revision includes:

```text
src/services/authService.ts
src/services/suggestionService.ts
src/App.tsx
supabase/migrations/001_security_hardening.sql
ARCHITECTURE.md
PROGRESS.md
```

These changes should be pulled into AI Studio before continuing development.

---

# 6. Still Required — Live Supabase Verification

- [ ] Execute/apply `supabase/migrations/001_security_hardening.sql` against the actual Supabase project
- [ ] Verify migration succeeds without SQL errors
- [ ] Verify `profiles` role constraint
- [ ] Verify `handle_new_user()` creates citizens
- [ ] Verify `is_admin()` works for admin accounts
- [ ] Verify RLS policies on `suggestions`
- [ ] Verify RLS policies on `suggestion_status_history`
- [ ] Verify `suggestion_supports` RLS
- [ ] Verify public projections are queryable
- [ ] Verify public base-table access is restricted
- [ ] Verify storage policies
- [ ] Verify `attach_suggestion_photo()`
- [ ] Verify support RPCs
- [ ] Verify triggers create history entries

---

# 7. End-to-End Testing Required

## Citizen

- [ ] Register a new citizen account
- [ ] Verify profile is created
- [ ] Verify role is `citizen`
- [ ] Verify login
- [ ] Verify logout
- [ ] Verify session persistence
- [ ] Verify password reset
- [ ] Verify `/app` cannot be accessed while logged out
- [ ] Submit a suggestion
- [ ] Verify real PostgreSQL UUID
- [ ] Verify DSB reference ID
- [ ] Verify initial status history
- [ ] Upload a photo
- [ ] Verify photo association
- [ ] Verify My Suggestions
- [ ] Verify citizen details
- [ ] Verify citizen cannot access another citizen's private suggestion

## Anonymous-public identity

- [ ] Submit with anonymity enabled
- [ ] Verify contact information is not exposed through public tracking
- [ ] Verify internal ownership remains available

## Tracking

- [ ] Search valid DSB reference
- [ ] Search invalid reference
- [ ] Verify public-safe fields only
- [ ] Verify status history

## Community support

- [ ] Authenticate as citizen
- [ ] Support a suggestion
- [ ] Verify count changes
- [ ] Support again
- [ ] Verify duplicate support is prevented
- [ ] Remove support
- [ ] Verify count/state returns correctly

## Admin

- [ ] Admin login
- [ ] Non-admin admin-login rejection
- [ ] Admin dashboard statistics
- [ ] Admin suggestion list
- [ ] Admin details
- [ ] Status update
- [ ] Admin note
- [ ] Automatic status-history entry
- [ ] Verify actor is the authenticated admin UUID
- [ ] Verify citizen cannot perform admin update

---

# 8. UI / 3D Work Remaining

The product requirement remains a **fully 3D animated website**. Current 3D infrastructure exists, but visual QA/polish is not complete.

- [ ] Give About/Welcome scene a fully developed 3D narrative
- [ ] Develop dedicated authentication visual experience
- [ ] Improve About → Auth → App transitions
- [ ] Refine main HIVE scene
- [ ] Refine submission scene
- [ ] Refine success scene
- [ ] Refine tracking scene
- [ ] Refine My Suggestions scene
- [ ] Refine admin scene
- [ ] Refine workspace scene
- [ ] Improve lighting/material quality
- [ ] Improve camera choreography
- [ ] Improve meaningful object interactions
- [ ] Add polished loading states
- [ ] Add polished empty states
- [ ] Add polished error states
- [ ] Add reduced-motion behavior
- [ ] Test mobile 3D performance
- [ ] Test tablet performance
- [ ] Test desktop performance

Do not replace the existing 3D architecture with generic decorative backgrounds.

---

# 9. Architecture Cleanup Remaining

- [ ] Reconcile baseline `supabase/schema.sql` with the hardened migration so fresh installation is self-consistent
- [ ] Decide whether demo seed records should be isolated into an explicit demo dataset
- [ ] Reconcile seeded support counts with `suggestion_supports`
- [ ] Verify final storage privacy/public-read decision
- [ ] Remove obsolete legacy type fields after all consumers are migrated
- [ ] Consolidate duplicate page/component responsibilities where useful
- [ ] Remove dead/unused code
- [ ] Remove unnecessary dependencies if confirmed unused
- [ ] Consider route-folder organization only if it materially improves maintainability

---

# 10. Community / Academic Work Remaining

- [ ] Identify local community/problem area
- [ ] Conduct required observations/interviews/feedback collection
- [ ] Document actual community findings
- [ ] Compare findings with HIVE problem statement
- [ ] Document limitations
- [ ] Prepare screenshots
- [ ] Prepare final project report
- [ ] Prepare presentation
- [ ] Prepare final demonstration
- [ ] Document team contributions

---

# 11. Current Recommended Sequence

```text
1. Pull current GitHub changes into AI Studio
        ↓
2. Apply 001_security_hardening.sql to the real Supabase project
        ↓
3. Run TypeScript/lint/build
        ↓
4. Test citizen registration/login/session
        ↓
5. Test RLS using citizen/admin accounts
        ↓
6. Test suggestion creation + UUID/reference ID
        ↓
7. Test status-history triggers
        ↓
8. Test photo attachment
        ↓
9. Test community support
        ↓
10. Fix every failed test
        ↓
11. Update ARCHITECTURE.md + PROGRESS.md
        ↓
12. Push verified state to GitHub
        ↓
13. Begin full 3D/UX polish
```

---

# 12. Definition of Done

HIVE is complete only when:

- [ ] Visitor understands HIVE before entering the application
- [ ] Citizen registration/login works through Supabase Auth
- [ ] Citizen role cannot be self-escalated
- [ ] Admin role is database-controlled
- [ ] `/app/*` is protected
- [ ] `/admin/*` is protected
- [ ] Suggestions are stored only in PostgreSQL
- [ ] UUID/reference ID separation is correct
- [ ] Public tracking exposes only safe fields
- [ ] Citizen ownership is enforced by RLS
- [ ] Admin operations are enforced by RLS
- [ ] Status history is database-generated and trustworthy
- [ ] Photos are correctly stored and access-controlled
- [ ] Community support cannot be trivially duplicated by one user
- [ ] All six statuses are consistent
- [ ] All ten categories are consistent
- [ ] Every major route has a polished 3D experience
- [ ] Mobile/tablet/desktop work correctly
- [ ] Loading/error/empty states are complete
- [ ] Lint passes
- [ ] Production build passes
- [ ] End-to-end security testing passes
- [ ] Community/academic evidence is documented
- [ ] Final report and presentation are ready

---

# 13. Current Priority

### P0 — Do now

1. Pull GitHub hardening changes into AI Studio.
2. Apply the security migration to the live Supabase project.
3. Verify RLS/auth with real accounts.
4. Run lint/build and fix errors.
5. Test the complete citizen/admin data flows.

### P1 — After backend verification

1. Finish citizen UX.
2. Finish public tracking privacy.
3. Finish photo lifecycle.
4. Finish community support behavior.
5. Reconcile schema/migrations.

### P2 — Visual/product quality

1. Full 3D route polish.
2. Motion and transitions.
3. Responsive optimization.
4. Accessibility/reduced motion.

### P3 — Academic delivery

1. Community study.
2. Documentation.
3. Report.
4. Presentation.
5. Final demo.

---

## Change-management rule

**Every meaningful implementation or architectural change must update both `ARCHITECTURE.md` and `PROGRESS.md`.**

Never mark an item complete merely because code was written. Distinguish:

```text
Implemented in repository
        ≠
Applied to live Supabase
        ≠
Verified end-to-end
```

All three states matter.

## Scroll-linked visual sequence

- [x] Added reusable HTML-canvas scroll-sequence renderer
- [x] Added preload-before-playback behavior
- [x] Added `requestAnimationFrame`-driven frame selection
- [x] Added responsive canvas resizing and device-pixel-ratio handling
- [x] Added mobile every-second-frame reduction
- [x] Added `prefers-reduced-motion` handling
- [x] Added frame manifest contract under `public/frames/`
- [ ] Generate the final HIVE frame sequence and populate `public/frames/manifest.json`
