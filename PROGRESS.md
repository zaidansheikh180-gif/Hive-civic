# HIVE Civic — Project Progress

> **Last updated:** 26 September 2026 (instinct branch)
> **Current phase:** UI passes published on `instinct`; live Supabase migration/security and real-device QA still pending. Not yet cleared for deployment.

## 1. Current Status

HIVE is a functional civic suggestion-platform prototype with a React/TypeScript frontend, Supabase backend, citizen/admin flows, and a route-aware Three.js/React Three Fiber visual system.

The project has moved beyond the initial prototype architecture. The current priority is to verify the existing security and data flow while improving the visual system in scoped, reviewable passes.

**Important:** The user reports running the SQL for `004_profile_name_only.sql` in Supabase and receiving "Name saved" after an admin profile edit. This verifies that one save path by user report, not an independent database audit. The live application and test matrix for 001–003 remain unverified; do not infer them from the 004 report.

---

# 2. Completed

## Project foundation

- [x] React + TypeScript + Vite application
- [x] React Router
- [x] Supabase client
- [x] Supabase environment-variable configuration (AI Studio secret bridging resolved via Vite define & direct import.meta.env)
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
- [x] Citizen registration/sign-in verified end-to-end in AI Studio
- [x] Citizen suggestion submission and persistence verified
- [x] My Suggestions / tracking flow verified

## Admin product flow

- [x] Separate admin login
- [x] Protected admin dashboard
- [x] Admin suggestion list
- [x] Admin suggestion details/workspace
- [x] Status management UI
- [x] Admin notes support
- [x] Fixed admin login redirect loop on `instinct`: removed synchronous `getCurrentAdmin()` checks from AdminDashboard, AdminSuggestions, and SuggestionDetails; dashboard now loads the verified profile asynchronously. User reports entering the admin dashboard after local retest.
- [x] Added `/admin/profile` and `/app/profile` with display-name editing, read-only email and role, and navbar links. Admin name save reported successful by user. Citizen name save not yet user-tested.

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

- [x] Added migrations `002_security_function_privileges.sql`, `003_rls_performance_hardening.sql`, and `004_profile_name_only.sql` in the repository. Migration 004 grants authenticated clients UPDATE on `full_name` only and restricts updates to their own profile row. The prior 003 policy checks that a citizen cannot change their existing role; do not claim a demonstrated self-promotion flaw.
- [x] User reports running the 004 SQL in live Supabase and seeing "Name saved" on the admin profile. Independent grant/RLS audit and 001–003 live status still pending.

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


## 4A. Citizen Flow Verification — Issues Encountered and Fixed

The first complete citizen-flow verification in AI Studio exposed two infrastructure/configuration issues.

### 1. Supabase credentials not reaching the Vite client

**Error:** Supabase credentials are not configured.

**Cause:** AI Studio's configured Supabase values were not initially available to the browser client under the expected Vite VITE_* variables.

**Fix:** Updated the Vite configuration to bridge the AI Studio environment values into the client-side variables without hardcoding credentials or introducing an authentication fallback.

**Result:** Supabase Auth became reachable from the citizen application.

### 2. Supabase project was paused

**Error:** Failed to fetch

**Cause:** The Supabase project/database was paused, so the backend/Auth endpoint was unavailable.

**Fix:** Reactivated the Supabase project.

**Result:** Citizen sign-in worked after the project became active. No auth-code workaround was required.

### Verified citizen milestone

    About / Welcome
      ↓
    Register / Sign In
      ↓
    Protected Citizen App
      ↓
    Submit Suggestion
      ↓
    Database persistence
      ↓
    Reference ID / Success
      ↓
    My Suggestions
      ↓
    Track / Details

**Status: VERIFIED WORKING in the AI Studio environment.**

This milestone does not mark the remaining admin, cross-role, RLS, storage, support, and full security test matrix as complete.

# 5. Instinct Branch State and Verification

- `instinct` is the working branch; `main` has not received these admin/profile fixes or visual work.
- Admin loop regression and profile page tests: 7/7 pass locally; TypeScript lint and Vite production build pass.
- `package.json` includes Vitest, jsdom and React Testing Library in devDependencies. Vite is listed once (devDependencies).
- `bun.lock` was regenerated as lockfileVersion 1 with Bun 1.3.14 after a Bun 1.4 lockfile proved incompatible with the user's Windows Bun 1.3.14. A clean `bun install --frozen-lockfile`, lint, build and test run passed with Bun 1.3.14.
- Profile visual inspection used local desktop and mobile screenshots; authenticated live UI and citizen name save still need a separate check.
- UI updates through `cee08c0` were published to `instinct` before this documentation update. The remote branch and local repository are separate: pulling locally does not prove live Supabase or deployment state.

---

# 6. Still Required — Live Supabase Verification

- [ ] Determine whether `supabase/migrations/001_security_hardening.sql` is applied to the actual Supabase project; do not rerun blindly
- [ ] Determine actual applied migration versions and errors without blindly replaying SQL
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

- [x] Register a new citizen account — verified in AI Studio
- [x] Verify profile is created — verified through the functional citizen flow
- [x] Verify role is `citizen` — database model remains authoritative
- [x] Verify login — verified in AI Studio
- [ ] Verify logout
- [ ] Verify session persistence
- [ ] Verify password reset
- [ ] Verify `/app` cannot be accessed while logged out
- [x] Submit a suggestion — verified in AI Studio
- [x] Verify real PostgreSQL UUID — implementation verified; deeper DB audit remains pending
- [x] Verify DSB reference ID — verified in submission flow
- [ ] Verify initial status history
- [ ] Upload a photo
- [ ] Verify photo association
- [x] Verify My Suggestions — verified in AI Studio
- [x] Verify citizen details — verified in AI Studio
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

- [x] Admin profile display-name save — user reports the "Name saved" message after running 004 SQL (not independently checked against Supabase)
- [ ] Citizen profile display-name save and persisted readback
- [ ] Profile permissions: forged client cannot write role/email or another profile row

- [x] Admin login — user reports entering the admin dashboard after the branch fix
- [ ] Non-admin admin-login rejection
- [ ] Admin dashboard statistics (landing on dashboard verified by user; figures not checked)
- [ ] Admin suggestion list
- [ ] Admin details
- [ ] Status update
- [ ] Admin note
- [ ] Automatic status-history entry
- [ ] Verify actor is the authenticated admin UUID
- [ ] Verify citizen cannot perform admin update

---

# 8. Public page polish pass (repository implementation)

- [x] Rewrote the welcome hero and first explanatory section to describe submission, reference tracking and review without unsupported performance metrics or institutional claims.
- [x] Reduced visual noise in the home scene by lowering network density, particles, highlights and one point light; kept the original Three.js scene and honey/dark identity.
- [x] Added Lenis smooth scrolling only on the public `/` page and an InView reveal adapted from motion-primitives for one lower section. Both respect reduced-motion preference; the custom cursor is hidden when motion is reduced.
- [x] Checked local desktop and mobile hero screenshots and a citizen sign-in desktop screenshot. These are visual spot checks, not a complete route or device QA pass.
- [x] Ran lint, build and existing admin/profile tests after the pass (see test log and commit validation). The build still reports a large chunk warning; no bundle optimization was claimed.
- [x] Inspected lower welcome sections in local desktop/mobile screenshots; scroll reveal interaction on a real device still needs verification.
- [ ] Finish visual/accessibility/performance QA across all routes, breakpoints and actual devices. A signed-in data view was not visually checked in this pass.

---

# 8A. Subsequent UI passes on `instinct` (repository work)

- [x] Round 2: lower welcome narrative and prototype notice, simpler citizen sign-in copy with troubleshooting details, native glass button/link controls in `src/components/ui/LiquidGlassButton.tsx`, particle loading states in `OrbNoise.tsx`. Existing honey/dark identity, video, and SceneCanvas retained.
- [x] Visual QA fixes: full-width category-chip labels in a horizontal scroller, non-wrapping 1280px citizen navbar labels, mobile admin + action clearance, and centered larger orb on full-page loads.
- [x] Round 3 mobile polish: corrected glass base display overriding responsive `hidden`, added safe-area-aware nav/viewport metadata and theme color, 16px input text on coarse pointers, touch feedback and selectable page content.
- [x] Targeted follow-ups: shrank citizen-feed Search button; improved Track Search disabled-state contrast while preserving `disabled`, aligned its desktop button to the input, and returned clear-X inside the field.
- [x] Local TypeScript lint, Vite production build and seven admin/profile tests passed after the Track Search fix. Build still warns about a ~2.13 MB JS chunk (~594 KB gzip). Inspected local desktop/mobile fixture screenshots; the fixture uses fabricated users/proposals, not live records.
- [ ] Verify the UI on a real phone, on the deployed site, with real authenticated citizen/admin data, including slow network, keyboard, safe areas and reduced motion.

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
- [x] Add OrbNoise-based loading states across major routed pages; continue testing transition timing and error states
- [ ] Add polished empty states
- [ ] Add polished error states
- [ ] Add reduced-motion behavior
- [ ] Test mobile 3D performance
- [ ] Test tablet performance
- [ ] Test desktop performance

Do not replace the existing 3D architecture with generic decorative backgrounds.

---

# 8B. Read-only code audit: open deployment risks, not proof of live exposure

The following are code/documentation findings. No live Supabase permissions, bucket settings, or migration history were inspected for this audit. **Do not deploy publicly until those checks and the cross-role tests pass.**

- [ ] Verify the actual live grants for legacy `increment_support` / `decrement_support`. Baseline schema and 001 grant authenticated execution, but **002 revokes it from authenticated and anon**. The earlier claim that the functions remain callable after the complete migration sequence was wrong; a risk exists only if 002 was not applied or grants later changed.
- [ ] Check the public `suggestion-photos` bucket's live MIME/size limits and upload policy. Repository `schema.sql` upload policy checks only `bucket_id`; `storageService.ts` checks MIME/5 MB in the client, which is bypassable outside that client. Verify appropriate server-side limits and object-path rules.
- [ ] Remove or replace the admin login's copyable `SchemaModal.tsx` baseline SQL, which predates migrations 001–004. Do not use it alone to initialize a deployment.
- [ ] Decide whether `admin_notes` are meant to be visible to the submitting citizen; `CitizenSuggestionDetails.tsx` renders them. Public projections omit them.
- [ ] Pin or eliminate the `motion@latest` CDN script in `index.html` after checking its usage; bundled `motion` is also installed. Split/profile the ~2.13 MB initial JS chunk.
- [ ] Resolve `moderator` references left in frontend/baseline SQL against migration 001's `citizen | admin` role constraint.
- [ ] Audit and remove unused packages only after dependency checks (`@google/genai`, `express`, `dotenv`, `@types/express`). Add a LICENSE file if MIT is indeed the intended license; footer currently claims MIT without one.
- [ ] Review registration's six-character minimum and verify the actual Supabase Auth password policy. Consider signup abuse controls in the deployment configuration.
- [ ] Audit live migration 001–003 status and independently confirm reported 004 effects, then test RLS, function grants, storage and all cross-role flows with real accounts.

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

1. Keep all work on `instinct`; preserve `main` until a reviewed merge.
2. Check the live state of migrations 001–003 and confirm the reported 004 application without blindly replaying SQL; inspect legacy function grants and bucket settings, then run the missing RLS/security matrix with real accounts.
3. Verify admin profile name persists on reload, then citizen name save and persistence; check non-admin rejection and admin status operations separately.
4. Verify recent honey/dark UX fixes on the deployed site and real devices; continue route-aware 3D polish in reviewable commits with reduced-motion coverage, tests, lint and build.
5. Resolve the code-audit checklist and reconcile baseline schema/migrations, then prepare project documentation and demonstration.

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

1. Verify live migration state (001–003 unknown; 004 reported run by user).
2. Run the remaining RLS/auth matrix with real accounts.
3. Verify persisted admin/citizen profile names and role isolation.
4. Keep lint/build/tests green while polishing the instinct branch.
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
