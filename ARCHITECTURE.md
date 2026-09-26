# HIVE — Digital Suggestion Box
## Canonical Architecture & Project Context

> **Last architecture update:** 26 September 2026 (instinct branch)
>
> This is the HIVE project handoff for a future contributor or LLM asked by the owner to read it. Read this full document and `PROGRESS.md` for the current checklist. Source code and the actual live database win over stale documentation; repository behavior and live Supabase state are different kinds of evidence.

---

## Read-me-first: context map for an LLM or new contributor

This file is the architecture and implementation map, not a substitute for checking source code. `PROGRESS.md` records what is done, what was only user-reported, and what has **not** been verified live. The current working branch is `instinct`; `main` remains unchanged by the recent rounds. This is an academic civic prototype, not an official government service and not cleared for public deployment.

| Need | Start here |
| --- | --- |
| Purpose and user journey | Sections 1–3; current route map in section 7 |
| Stack and environment | Sections 4–6 and `package.json`, `vite.config.ts`, `.env.example` |
| Auth, roles, database, RLS, storage | Sections 8–22; `supabase/schema.sql` followed by migrations 001–004 |
| 3D, home, styling, shared controls | Sections 23–27, 38B; `src/App.tsx`, `src/index.css`, `src/components/ui/` |
| Citizen/admin implementation | Sections 28–31 and their `src/pages/` components |
| Tests, status, blockers and deployment risks | Sections 32, 35–38C; `PROGRESS.md` sections 5–9 and 11–13 |

**Run locally on the user's Windows VS Code checkout:** `git fetch origin`, `git checkout instinct`, `git pull origin instinct`, `bun install`, `bun dev` (Vite serves port 3000 per `package.json`). Inspect `git status` before switching or pulling; do not discard local edits merely because a lockfile changed. The project lockfile is Bun 1.3.14-compatible `lockfileVersion: 1`. Configure only public Supabase URL and publishable/anon key using `.env.example`; no service-role key in client env. For checks, run `bun run lint`, `bun run build`, and `bunx vitest run src/pages/admin-flow.test.tsx src/pages/profile-flow.test.tsx`. The last local check had 7/7 tests, lint and build passing, but the bundle warned at ~2.13 MB JS (~594 KB gzip). Re-run checks on the current checkout instead of relying on that older result.

**How it fits:** `src/App.tsx` holds the global video, route-aware `SceneCanvas`, cursor, navbar, and React Router. `/` renders `WelcomeAbout`, not the legacy `Home` or `LandingPage`; `/auth/*` is public auth; `/app/*` requires an authenticated session; `/admin/*` requires an admin profile. `authService`, `suggestionService`, and `storageService` own integration logic. Supabase Auth identifies the user. The hardened `profiles` constraint allows `citizen`/`admin`; database RLS, functions and grants enforce data access. Suggestion UUID is the internal identity; DSB reference is the citizen-facing identifier. A public projection omits private contact and notes, while an owner/admin may read fuller records subject to live RLS. Profile self-service updates `full_name` only under repository migration 004.

**Visual language:** preserve honey `#E7C226` and deep `#0B0B0F`, route-aware 3D plus background video, native glass controls in `src/components/ui/LiquidGlassButton.tsx`, and honey particle loading in `src/components/ui/OrbNoise.tsx`. Keep keyboard, focus, disabled and reduced-motion behavior. Round 1 simplified the public hero; round 2 added the glass/orb system and lower-page/sign-in revisions; round 3 repaired mobile responsive display, safe areas and input zoom. Feed and Track Search controls received later sizing/contrast fixes. Dither Reveal and daisyUI were considered and not added.

**Do not blur evidence:** 001–003 application to the live Supabase project remains unverified; the user reported running 004 and saving an admin name, not a full migration audit. Migration 002 revokes the legacy counter RPCs in repository SQL; their live grants are unknown. Read the specific caveats and deployment blockers in `PROGRESS.md` before calling this ready. Changes requested on `instinct` do not imply permission to merge `main` or mutate live Supabase; obtain the owner's current approval for those actions.

---

## 1. Project Identity

**Name:** HIVE — Digital Suggestion Box  
**Repository:** `zaidansheikh180-gif/Hive-civic`  
**Working branch:** `instinct` (`main` unchanged)
**Type:** Full-stack civic-technology academic/research prototype  

HIVE gives citizens a structured way to submit local civic suggestions/issues, receive a human-readable reference number, track progress, and view a transparent status lifecycle. Administrators review and manage submissions.

HIVE is explicitly **not an official government grievance portal**. It is an academic/community project prototype.

### Product principle

HIVE is a civic workflow application wrapped in a distinctive 3D experience—not a 3D demo with a civic form attached.

Priority order:

```text
Civic purpose
  ↓
Reliable workflow
  ↓
Secure data
  ↓
Clear citizen/admin UX
  ↓
Meaningful 3D presentation
  ↓
Polish
```

---

## 2. Product Workflow

```text
Visitor
  ↓
About / Welcome
  ↓
Citizen Sign In / Register
  ↓
Main HIVE App
  ├── Submit suggestion
  ├── My suggestions
  └── Track suggestion
          ↓
      DSB reference ID
          ↓
      Administrative review
          ↓
      Status changes + audit history
          ↓
      Citizen-visible progress
```

Separate administrative flow:

```text
Admin Login
  ↓
Supabase Auth
  ↓
Database role verification
  ↓
Admin Dashboard
  ↓
Suggestion management
  ↓
Status / notes / history
```

---

## 3. Canonical Domain Values

### Categories — exactly ten

```text
Roads & Footpaths
Street Lighting
Waste Management
Water & Sanitation
Public Spaces
Transport
Education
Environment
Community Facilities
Other
```

### Statuses — exactly six

```text
submitted
under_review
accepted
planned
implemented
rejected
```

Normal lifecycle:

```text
submitted → under_review → accepted → planned → implemented
```

`rejected` is an alternate terminal outcome.

### Reference ID

Citizen-facing identifier:

```text
DSB-YYYY-XXXXXX
```

The generator uses an alphabet that avoids visually ambiguous characters.

**Important:** `reference_id` and the PostgreSQL UUID `id` are different identifiers.

---

## 4. Technology Stack

### Application

- React 19
- TypeScript
- Vite
- React Router 7
- Tailwind CSS
- React Hook Form
- Zod
- Lucide React
- Motion
- GSAP
- Recharts

### 3D

- Three.js
- React Three Fiber
- React Three Drei

### Backend

- Supabase Auth
- PostgreSQL
- Row Level Security (RLS)
- Supabase Storage

### Environment & AI Studio Secret Bridging

Google AI Studio injects user secrets as server process environment variables (`process.env`). In a client-side Vite single-page application (SPA), the browser runtime does not have direct access to server-side `process.env`. Vite bundles environment variables into the client bundle at build and dev time.

To ensure seamless operation in AI Studio, `vite.config.ts` uses `loadEnv` and bridges the public Supabase configuration into the client bundle via Vite's `define`:

```text
VITE_SUPABASE_URL (or SUPABASE_URL)
VITE_SUPABASE_ANON_KEY (or SUPABASE_ANON_KEY / SUPABASE_PUBLISHABLE_KEY)
```

In the client codebase, `src/lib/supabaseClient.ts` directly consumes `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY` (with safe fallbacks for alternative names and node execution), enabling Vite's AST static replacement in both dev mode and production builds.

Security enforcement: Only the public/anon publishable key is ever bridged or exposed. A service-role or secret key must never be added to frontend code or bundle definitions. A safe diagnostic utility (`getSupabaseConfigStatus` / `window.__HIVE_SUPABASE_DIAGNOSTICS__`) reports `'configured'` or `'not configured'` without ever leaking credential values.

---

## 5. Current Repository Structure

The actual repository currently contains:

```text
Hive-civic/
├── .env.example
├── .gitignore
├── ARCHITECTURE.md
├── PROGRESS.md
├── bun.lock
├── index.html
├── metadata.json
├── package.json
├── tsconfig.json
├── vite.config.ts
├── public/
│   └── assets/aistudio/
├── supabase/
│   ├── schema.sql
│   └── migrations/
│       ├── 001_security_hardening.sql
│       ├── 002_security_function_privileges.sql
│       ├── 003_rls_performance_hardening.sql
│       └── 004_profile_name_only.sql
└── src/
    ├── App.tsx
    ├── data.ts
    ├── index.css
    ├── main.tsx
    ├── types.ts
    ├── types/
    │   └── index.ts
    ├── lib/
    │   └── supabaseClient.ts
    ├── services/
    │   ├── authService.ts
    │   ├── storageService.ts
    │   └── suggestionService.ts
    ├── components/
    │   ├── AcademicDisclaimer.tsx
    │   ├── CustomCursor.tsx
    │   ├── LandingPage.tsx
    │   ├── Navbar.tsx
    │   ├── ProtectedRoute.tsx
    │   ├── SchemaModal.tsx
    │   ├── StatusBadge.tsx
    │   ├── StatusTimeline.tsx
    │   └── TiltCard.tsx
    ├── pages/
    │   ├── AdminDashboard.tsx
    │   ├── AdminLogin.tsx
    │   ├── AdminSuggestions.tsx
    │   ├── ProfilePage.tsx
    │   ├── admin-flow.test.tsx
    │   ├── profile-flow.test.tsx
    │   ├── CitizenAppFeed.tsx
    │   ├── CitizenForgotPassword.tsx
    │   ├── CitizenLogin.tsx
    │   ├── CitizenRegister.tsx
    │   ├── CitizenSuggestionDetails.tsx
    │   ├── Home.tsx
    │   ├── MySuggestions.tsx
    │   ├── SubmissionSuccess.tsx
    │   ├── SubmitSuggestion.tsx
    │   ├── SuggestionDetails.tsx
    │   ├── TrackSuggestion.tsx
    │   └── WelcomeAbout.tsx
    └── three/
        ├── SceneCanvas.tsx
        ├── cameras/CameraRig.tsx
        ├── effects/ParticleField.tsx
        ├── objects/
        │   ├── CivicNetwork.tsx
        │   ├── DataBars3D.tsx
        │   ├── DataSphere.tsx
        │   ├── FloatingCard.tsx
        │   ├── StatusTimeline3D.tsx
        │   └── SuggestionBox.tsx
        └── scenes/
            ├── AdminScene.tsx
            ├── HomeScene.tsx
            ├── SubmitScene.tsx
            ├── SuccessScene.tsx
            ├── TrackScene.tsx
            └── WorkspaceScene.tsx
```

The repository has a deliberate layered structure: route pages, reusable UI, services, domain types, Supabase client, and an isolated 3D subsystem.

---

## 6. Architectural Layers

```text
Routes / Pages
      ↓
Reusable UI components
      ↓
3D presentation system
      ↓
Service/domain layer
      ↓
Supabase Auth + PostgreSQL + Storage
      ↓
RLS / database constraints
```

### Rules

- React components should not become the database abstraction.
- Services own repeated data-access workflows.
- PostgreSQL owns persistent application truth.
- RLS is the data authorization boundary.
- Route guards are UX protection, not the ultimate security boundary.
- 3D is presentation, not persistence.

---

## 7. Application Shell and Routing

`src/App.tsx` is currently the global shell. It determines the route-driven `SceneType`, renders the background video, 3D canvas, cursor, navbar, route content, and academic disclaimer.

### Current route architecture

```text
PUBLIC
/

CITIZEN AUTH
/auth/login
/auth/register
/auth/forgot-password

CITIZEN APP
/app
/app/submit
/app/submitted
/app/track
/app/suggestions
/app/suggestions/:id
/app/profile

ADMIN
/admin/login
/admin
/admin/suggestions
/admin/suggestions/:id
/admin/profile
```

Legacy aliases remain:

```text
/submit      → /app/submit
/submitted   → /app/submitted
/track       → /app/track
```

### Protection status

The current code protects `/app`, `/app/submit`, `/app/submitted`, `/app/track`, `/app/suggestions`, and `/app/suggestions/:id` with `ProtectedRoute`.

Admin routes, including `/admin/profile`, use `ProtectedRoute requireAdmin`. `/app/profile` uses `ProtectedRoute`. Both profile routes render `ProfilePage` with a context-sensitive back link.

Citizen login/register use `PublicOnlyRoute`.

The root route is `WelcomeAbout`.

---

## 8. Authentication Architecture

`src/services/authService.ts` now uses Supabase Auth as the sole authentication source.

### Current behavior

- `signIn()` uses `supabase.auth.signInWithPassword()`.
- `signUp()` uses `supabase.auth.signUp()`.
- `resetPassword()` uses Supabase password recovery.
- `signOut()` calls Supabase sign-out.
- `onAuthStateChange()` listens to Supabase Auth events.
- The authenticated user's profile is loaded from `public.profiles`.
- Admin sign-in requires `profiles.role = 'admin'`; `ProtectedRoute requireAdmin` also accepts `moderator` for guarded routes. A public signup creates a citizen profile and does not assign admin privileges.

### Critical decision

Authentication state is **not cached in localStorage by HIVE**.

`getCurrentUserSync()` intentionally returns `null`; route guards wait for the authoritative Supabase session/profile lookup.

Supabase itself may persist its Auth session using its own supported storage behavior. That is different from HIVE inventing a second localStorage authentication system.

### Removed behavior

The previous `authService.ts` stored:

```text
hive_authenticated_profile
```

and used cached localStorage profile state for authentication/role decisions.

That was removed because a browser-controlled cached role must not become an authorization source.

---

## 9. Profile and Role Architecture

`profiles.id` is linked to `auth.users.id`.

The hardened migration 001 constrains `profiles.role` to `citizen | admin`. The original `schema.sql` and some frontend types/guards still mention `moderator`; this is a legacy mismatch, not a third working role under that migration. New registrations should become `citizen`; admin privileges require a database-side assignment, not public signup.

The database trigger `handle_new_user()` is responsible for enforcing this rather than trusting browser-provided role metadata.

### Security rule

A user must never be able to turn themselves into an admin by changing:

- React state
- localStorage
- user metadata
- request payloads
- profile form values

Admin authorization is a database concern.

### Admin redirect fix on instinct

`getCurrentAdmin()` intentionally returns `null` because a synchronous browser cache is not an authorization source. Older AdminDashboard, AdminSuggestions and SuggestionDetails components called it and redirected even after successful sign-in. They now rely on async `getCurrentUser()` / `ProtectedRoute requireAdmin` instead. The user retested locally and reported reaching the admin dashboard; deeper admin operations are not yet verified.

### Self-service profile name editing

Both `/admin/profile` and `/app/profile` render `ProfilePage` and expose only `full_name` as editable. The email and role are displayed read-only. `authService.updateDisplayName()` validates a nonempty name of at most 80 characters, calls `supabase.auth.getUser()`, updates only `{ full_name }` with `.eq('id', authUser.id)`, selects the resulting profile, and notifies the navbar to refresh. Name changes do not promote an account. The user reports applying the 004 SQL and seeing "Name saved" on the admin profile; persistence on reload and citizen-path save need a live test.

`supabase/migrations/004_profile_name_only.sql` narrows the authenticated database grant to UPDATE(`full_name`) and replaces the prior broad profile UPDATE policy with an own-row policy. In 003, non-admin role changes were already checked against the current role; 004 adds column-level least privilege. Do not assume that a repository migration has run in production: 004 is reported applied by the user; 001–003 live execution and the full RLS matrix remain unverified. The 004 grant intentionally removes app-client edits to other profile fields, including role assignment; database operators retain privileged SQL access outside this authenticated client grant.

The branch declares Vitest, jsdom and React Testing Library as devDependencies and has 7 passing admin/profile unit tests at the latest local check. `bun.lock` is lockfileVersion 1, regenerated and frozen-install tested with Bun 1.3.14 after a newer lockfile failed on the user's machine. Vite appears only under devDependencies. Lint and production build pass. These tests do not replace authenticated end-to-end checks.

---

## 10. Supabase Client

`src/lib/supabaseClient.ts` is the reusable browser client.

It reads:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

and creates a single Supabase client when configured.

The client enables:

- persisted Auth session
- token refresh
- URL session detection

No service-role key is used by the browser client.

There is historical duplication in the repository naming (`src/lib/supabaseClient.ts` is canonical; any separate service-layer client should not be reintroduced). Future cleanup must preserve one client instance.

---

## 11. Database Model

### `profiles`

```text
id          uuid → auth.users.id
email       text
full_name   text
role        citizen | admin after migration 001 (baseline also lists moderator)
created_at
updated_at
```

### `suggestions`

```text
id              uuid PK
reference_id    text UNIQUE
category        canonical category
title
description
location_text
photo_path
photo_url
contact_name
contact_email
contact_phone
is_anonymous
user_id         uuid → auth.users.id
status          canonical status
support_count
admin_notes
created_at
updated_at
```

### `suggestion_status_history`

```text
id
suggestion_id   uuid → suggestions.id
old_status
new_status
note
changed_by
created_at
```

### `suggestion_supports` — NEW HARDENING MODEL

```text
suggestion_id   uuid → suggestions.id
user_id         uuid → auth.users.id
created_at
PRIMARY KEY (suggestion_id, user_id)
```

This prevents one authenticated user from repeatedly creating support records for the same suggestion.

---

## 12. UUID vs DSB Reference ID

This distinction is mandatory.

### Database identity

```text
suggestions.id
UUID
```

Used for:

- foreign keys
- status history
- photo paths
- internal queries
- ownership

### Citizen identity

```text
suggestions.reference_id
DSB-YYYY-XXXXXX
```

Used for:

- citizen tracking
- display
- communication about a submission

### Correct submission sequence

```text
Authenticated citizen
      ↓
INSERT suggestion
      ↓
PostgreSQL returns UUID
      ↓
Use UUID for internal relations
      ↓
Upload photo under UUID path
      ↓
Return DSB reference ID to citizen
```

The old frontend-generated `sug-${Date.now()}` style ID is not part of the final architecture.

---

## 13. Suggestion Service

`src/services/suggestionService.ts` is the domain/data service.

It currently handles:

- schema availability check
- suggestion creation
- reference ID generation
- public suggestion retrieval
- citizen-owned suggestion retrieval
- suggestion details
- admin status updates
- dashboard statistics
- community support

### Current source-of-truth rule

The service no longer uses localStorage as suggestion persistence.

A failed Supabase request should not silently become a localStorage database.

### Auth requirement

Suggestion creation now requires an authenticated Supabase user. `is_anonymous` means the citizen's identity is hidden from public presentation; it does not mean the system abandons authenticated ownership.

---

## 14. Public Data Projection

A major security issue was that a public `select *` on `suggestions` could return private fields even if React later hid them.

The hardening migration introduces:

```text
public.public_suggestions
```

with only public-safe fields:

```text
id
reference_id
category
title
description
location_text
photo_url
is_anonymous
status
support_count
created_at
updated_at
```

It deliberately excludes:

```text
user_id
contact_name
contact_email
contact_phone
admin_notes
photo_path
```

Public feed/tracking service calls use this projection.

This is important because UI masking is not a security boundary.

---

## 15. Citizen-Owned Data

Authenticated citizens access their own suggestions using:

```text
suggestions.user_id = auth.uid()
```

`getMySuggestions(userId)` queries the base table and relies on RLS.

Citizen details also use the protected base table so a citizen can see information belonging to their own submission.

### Required security property

Citizen A must not be able to retrieve Citizen B's private suggestion by manipulating:

- URL UUID
- query parameter
- reference ID
- frontend state

RLS must enforce this independently of React.

---

## 16. Anonymous Submission Semantics

HIVE supports a public anonymity choice.

Correct interpretation:

```text
Authenticated citizen
      +
"Submit anonymously"
      ↓
Internal ownership remains available
      ↓
Public identity/contact information is not displayed
```

The anonymous flag controls public identity presentation/privacy. It is not an authentication bypass.

---

## 17. Status History Architecture

The hardening migration changes status history from client-written audit events to database-generated events.

A database trigger records:

### On suggestion creation

```text
null → submitted
```

with:

```text
changed_by = Citizen Intake System
```

### On status change

```text
old status → new status
```

with:

```text
changed_by = auth.uid()
```

This prevents the browser from claiming that a different administrator performed the action.

The trigger also reduces the chance of a status update succeeding while its corresponding history record silently fails.

---

## 18. Administrative Status Updates

The admin service now performs the suggestion update only.

Database trigger logic creates the history record automatically whenever the status changes.

Admin update is protected by:

```text
public.is_admin()
```

RLS must therefore reject non-admin updates even if a user manually calls the Supabase API.

`admin_notes` are not part of public projection data.

---

## 19. Photo Storage Architecture

Bucket:

```text
suggestion-photos
```

Preferred path:

```text
suggestions/{suggestion UUID}/{timestamp}_{filename}
```

Current service flow:

```text
Create suggestion
      ↓
Receive real UUID
      ↓
Upload photo under UUID path
      ↓
Call attach_suggestion_photo RPC
      ↓
RPC verifies ownership/status
      ↓
Store photo_path + photo_url
```

The reason for the RPC is important: ordinary citizen UPDATE permission is intentionally restricted so a citizen cannot arbitrarily edit protected suggestion fields merely because they own the row.

---

## 20. Community Support Architecture

The previous implementation used localStorage to remember supported suggestion IDs and directly modified `support_count` as a fallback.

That was insecure and easy to manipulate.

The hardening migration introduces:

```text
suggestion_supports
```

with one support per authenticated user/suggestion pair.

RPCs:

```text
add_support(uuid)
remove_support(uuid)
```

are authenticated-only and security-definer functions with a controlled search path.

The frontend no longer uses localStorage to track support state. Legacy `increment_support` and `decrement_support` are granted to authenticated in 001, then explicitly revoked from both `anon` and `authenticated` in 002. Do not claim they remain callable after 002. The live function grants have not been audited; verify which migrations actually ran before deciding on a fix.

### Remaining consideration

The existing `support_count` values include demonstration baselines. A later data-cleanup phase may reconcile seeded counts with actual support rows if necessary.

---

## 21. RLS Architecture

RLS is enabled on sensitive application tables.

### Intended model

```text
ANONYMOUS
  ↓
Public projection only

AUTHENTICATED CITIZEN
  ↓
Own suggestion rows
Own status history
Own support rows

ADMIN
  ↓
Authorized administrative suggestion access
Status updates
Administrative operations
```

### Important hardening change

The previous broad suggestion policy:

```text
using (true)
```

was removed from the base `suggestions` table.

Authenticated citizens now read their own rows or rows available to an admin.

Public access goes through the safe projection.

### Status history

Clients do not receive arbitrary insert permission for audit events. Database triggers create them.

---

## 22. Security Problems Discovered and Decisions

### Problem A — localStorage authentication cache

**Old behavior:** profile/role was cached in localStorage.  
**Risk:** browser-controlled state could influence route/role decisions.  
**Decision:** Supabase Auth session + database profile are authoritative.

### Problem B — fake/admin fallback authentication

**Old behavior:** broad demo conditions could act as admin authentication.  
**Risk:** authentication was not genuinely backed by Supabase.  
**Decision:** remove fake production authentication; admin login uses Supabase Auth + profile role.

### Problem C — broad public suggestion SELECT

**Old behavior:** public base-table reads could return private columns.  
**Risk:** UI hiding does not protect data already sent to the browser.  
**Decision:** public-safe database projection.

### Problem D — status history written by browser

**Old behavior:** frontend supplied `changed_by`.  
**Risk:** audit identity could be forged.  
**Decision:** database trigger records actor identity from `auth.uid()`.

### Problem E — support state in localStorage

**Old behavior:** browser stored supported IDs and could fall back to direct counter updates.  
**Risk:** easy manipulation and duplicate support.  
**Decision:** authenticated `suggestion_supports` table + RPCs.

### Problem F — citizen photo UPDATE conflict

**Old behavior:** citizen could require a broad update to attach a photo.  
**Risk:** broad UPDATE permission would expose unrelated fields.  
**Decision:** ownership-checked `attach_suggestion_photo` RPC.

### Problem G — frontend-generated suggestion IDs

**Old behavior:** frontend-generated string IDs conflicted with UUID FK design.  
**Decision:** PostgreSQL UUID is authoritative.

### Problem H — incomplete first-visit flow

**Old behavior:** website opened directly into operational interface.  
**Decision:** `/` is the About/Welcome page; authentication follows.

---

## 23. Current 3D Architecture

The 3D system lives under `src/three/`.

### Renderer

```text
SceneCanvas.tsx
```

### Camera

```text
cameras/CameraRig.tsx
```

### Effects

```text
ParticleField.tsx
```

### Objects

```text
CivicNetwork
DataBars3D
DataSphere
FloatingCard
StatusTimeline3D
SuggestionBox
```

### Scenes

```text
HomeScene
SubmitScene
SuccessScene
TrackScene
AdminScene
WorkspaceScene
```

The scene is selected from route context in `App.tsx`.

### Visual requirement

The final website should be a fully 3D animated experience. 3D should communicate the workflow and page purpose, not exist only as a decorative background.

The visual identity currently centers on:

- dark/black environment
- HIVE honey/gold accent
- glass-like UI surfaces
- typography-led information hierarchy
- atmospheric video
- custom cursor
- route-specific 3D scenes
- animated civic/data objects

---

### Public-page polish pass (26 September 2026)

The root route keeps `HomeScene` as a React Three Fiber background. Its civic network, particle count, suggestion-box glow and point-light intensity are restrained so the UI remains legible without replacing the 3D concept. The welcome content favors an explicit submit → reference → review story over unverified metrics; the academic-prototype notice remains visible.

`WelcomeScroll` owns a Lenis instance only while the pathname is `/`; it destroys the instance when the route changes or reduced-motion preference changes. `InView`, adapted from motion-primitives, animates one explanatory section on entry and renders it without motion when reduced motion is requested. The custom cursor is likewise hidden for reduced-motion preference. No Supabase schema, policies or live data are affected by this visual pass.

Desktop and mobile hero and citizen sign-in snapshots were inspected locally. Lower-page animation, signed-in routes, keyboard/accessibility behavior and device performance still require testing. The build currently emits a large-chunk warning.

## 24. Route-to-Scene Concept

Current conceptual mapping:

```text
/                         → home
/auth/*                   → admin/auth visual context
/app                      → home
/app/submit               → submit
/app/submitted            → success
/app/track                → track
/app/suggestions          → suggestions
/app/suggestions/:id      → workspace
/admin/*                  → admin/workspace
```

### Target refinement

A future polish phase should introduce dedicated visual contexts for:

```text
About
Auth
Citizen App
Admin
```

without unnecessarily rebuilding the existing scene architecture.

---

## 25. UI/UX Architecture

Reusable components include:

- `Navbar`
- `CustomCursor`
- `TiltCard`
- `StatusBadge`
- `StatusTimeline`
- `SchemaModal`
- `AcademicDisclaimer`
- `ProtectedRoute`

The application uses shared `src/components/ui/LiquidGlassButton.tsx` for button/link semantics with the adapted honey glass treatment, and `OrbNoise.tsx` for the user-supplied particle loading animation. Reduced-motion handling is present. The `hidden` utility requires explicit display precedence over the glass base style, corrected in `index.css`. The application should continue using shared components instead of duplicating identical UI behavior across pages.

### UI state requirements

Every asynchronous route should eventually handle:

```text
loading
empty
success
validation error
authentication error
authorization error
network/database error
not found
```

---

## 26. Current About / First-Visit Architecture

The root route is now:

```text
/
→ WelcomeAbout
```

Intended flow:

```text
About / Welcome
      ↓
Enter HIVE
      ↓
/auth/login or /auth/register
      ↓
/app
```

The About experience must explain:

- what HIVE is
- the problem
- how it works
- who it is for
- citizen capabilities
- administrator capabilities
- project/academic status
- non-government disclaimer

---

## 27. Current Authentication Flow

```text
/auth/register
      ↓
Supabase Auth signUp
      ↓
handle_new_user() trigger
      ↓
profiles row with role=citizen
      ↓
Authenticated session, if email confirmation permits
      ↓
/app
```

Login:

```text
/auth/login
      ↓
signInWithPassword
      ↓
load profiles row
      ↓
role returned
      ↓
/app for citizen
/admin for admin
```

Admin:

```text
/admin/login
      ↓
Supabase Auth
      ↓
profiles.role === admin
      ↓
/admin
```

---

## 28. Current Citizen Submission Flow

```text
Protected /app/submit
      ↓
Form validation
      ↓
suggestionService.createSuggestion()
      ↓
Authenticated user required
      ↓
Generate DSB reference
      ↓
INSERT suggestions
      ↓
PostgreSQL UUID returned
      ↓
Initial status-history trigger
      ↓
Optional photo upload
      ↓
attach_suggestion_photo RPC
      ↓
SubmissionSuccess
```

---

## 29. Current Citizen Tracking Flow

```text
/app/track
      ↓
Enter DSB reference
      ↓
public_suggestions projection
      ↓
public_suggestion_status_history projection
      ↓
Current status + public timeline
```

No private contact/admin fields should be returned through this public path.

---

## 30. Current Admin Flow

```text
/admin/login
      ↓
Supabase Auth
      ↓
Profile role check
      ↓
/admin
      ↓
AdminSuggestions
      ↓
SuggestionDetails
      ↓
Update status / admin notes
      ↓
RLS validates admin
      ↓
Status trigger records audit event
```

---

## 31. Seed / Demonstration Data

The repository contains realistic demonstration suggestions in the database schema.

These are useful for:

- development
- UI testing
- screenshots
- presentations

They are not real municipal records and must not be represented as field-study evidence.

Future production cleanup should separate demonstration records from real community data.

---

## 32. Known Technical Debt

The following areas still need work even after this security-hardening pass:

1. `supabase/schema.sql` is the original baseline and should eventually be reconciled with the new migration so a fresh install produces the same architecture without relying on manual historical steps.
2. The current support seed counts may need reconciliation with `suggestion_supports`.
3. The storage bucket is currently public for civic-image transparency; this needs explicit verification against the project's final privacy requirements.
4. Public views should be tested against the actual deployed Supabase project.
5. Error handling in some pages may still need refinement.
6. The 3D system needs comprehensive visual/performance QA on every route.
7. Legacy/duplicate page/component concepts should eventually be consolidated.
8. Public/admin/citizen queries need end-to-end RLS testing with real accounts.
9. Live execution of migrations 001–003 remains unverified; user reports running 004 but its grants/RLS still need an independent audit. The legacy support RPCs are revoked in repository migration 002, so their live exposure depends on actual migration state.
10. Lint, build and 7 unit tests pass locally on instinct; authenticated end-to-end and cross-role tests remain.

---

## 33. Approved Final Architecture — Target

```text
                         HIVE
                          │
             ┌────────────┴────────────┐
             │                         │
          PUBLIC                    ADMIN
             │                         │
          About                    Admin Login
             │                         │
       Citizen Auth              Supabase Auth
             │                         │
             └───────┬─────────────────┘
                     │
              ROLE / SESSION
                     │
          ┌──────────┴──────────┐
          │                     │
       CITIZEN                ADMIN
          │                     │
      /app/*                /admin/*
          │                     │
       Services              Services
          │                     │
          └──────────┬──────────┘
                     │
                  Supabase
                     │
        ┌────────────┼─────────────┐
        │            │             │
       Auth       PostgreSQL    Storage
                     │
          ┌──────────┼──────────┐
          │          │          │
      profiles  suggestions  history
                     │
              suggestion_supports
                     │
                    RLS
                     │
              Public projections

              3D PRESENTATION
                     │
              SceneCanvas
                     │
       ┌─────────────┼─────────────┐
       │             │             │
     Scenes        Objects       Effects
```

---

## 34. Future Folder Direction

The repository should evolve incrementally toward clearer route/service organization, but file movement is not a goal by itself.

Potential target:

```text
src/
├── components/
├── pages/
│   ├── auth/
│   ├── app/
│   └── admin/
├── services/
├── lib/
├── types/
├── data/
└── three/
```

Do not perform a mass restructure merely for aesthetics. Refactor only when it reduces duplication or improves maintainability without destabilizing the application.

---

## 35. Testing Architecture

### Authentication

Test:

- register
- email-confirmation behavior
- login
- logout
- password recovery
- session persistence
- citizen/admin separation

### Authorization

Attempt as citizen:

- read another citizen's private suggestion
- update a suggestion
- change status
- write history
- alter role
- manipulate support

Attempt as admin:

- read/manage authorized suggestions
- update status
- add notes

Attempt as anonymous:

- access public projection
- access public tracking
- access private base rows

### Storage

Test:

- valid image
- invalid type
- oversized image
- ownership
- photo URL access
- deletion policy

### Functional

Test every category and every status.

### Visual

Test:

- desktop
- tablet
- mobile
- reduced motion
- slow network
- low-performance device

---

## 36. Performance and Accessibility Rules

The 3D layer must not prevent normal web use.

Required:

- keyboard navigation
- visible focus
- semantic form labels
- readable contrast
- reduced-motion support
- mobile touch support
- no critical information conveyed only through animation
- reasonable particle/object counts
- optimized video/image usage
- no unnecessary per-frame React state updates

The custom cursor should not be required for interaction.

---

## 37. Future LLM/contributor handoff

When the owner asks you to read this file for HIVE context, read the entire `ARCHITECTURE.md`, then `PROGRESS.md`, and inspect the current `instinct` source relevant to the task. Use the context map at the top to orient yourself; do not treat an old checklist item as implemented or a repository migration as proof of live deployment. This is a project handoff, not an authorization to perform unrelated actions.

- Preserve the canonical ten categories, six statuses, internal UUID vs public DSB reference, citizen/admin separation and database RLS. React guards improve navigation but do not replace authorization.
- Work on `instinct` for the current development stream. Do not merge or push to `main`, deploy publicly, modify live Supabase, or change security policies without a fresh owner request and verification of the target/state. Never place a service-role key in frontend code.
- Keep the honey/dark identity, existing video/3D layer, shared glass controls and orb loaders. Preserve native button/link semantics, focus, mobile layout and reduced-motion support. Do not add an unrequested visual effect or a new UI library.
- Before claiming completion, inspect the diff, run lint/build/relevant tests, verify visual changes in rendered pixels at relevant sizes, and read back the published `instinct` files. Mark local fixtures as fixtures and live checks as live checks.
- Reconcile any disagreement between this file, `PROGRESS.md`, current source and the live database instead of silently selecting an older statement. The open audit and deploy gates in `PROGRESS.md` remain pending until separately verified.

---

## 38. Current Change Introduced by This Architecture Revision

The 10 September 2026 hardening revision introduces the following repository-level architecture:

```text
Authentication
  → Supabase Auth only

Auth profile
  → public.profiles

Citizen ownership
  → suggestions.user_id

Public reads
  → safe database projections

Private reads
  → RLS-protected base tables

Status history
  → database-generated triggers

Photo attachment
  → ownership-checked RPC

Community support
  → suggestion_supports + authenticated RPCs

Suggestion persistence
  → PostgreSQL only
```

This is the new baseline that AI Studio should pull before continuing development.

---


## 38A. Citizen Flow Verification — Issues Encountered and Resolved

The citizen experience was verified in AI Studio on 24 September 2026. Two environment/infrastructure issues occurred during verification.

### Issue 1 — Supabase credentials were reported as not configured

**Observed error:**

    Supabase credentials are not configured.

**Cause:** The Supabase values configured for AI Studio were not initially reaching the Vite browser client under the expected VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY build-time variables.

**Resolution:** The Vite configuration was updated to bridge the AI Studio-provided environment values into the client-side Vite variables without hardcoding credentials.

**Security outcome:** No hardcoded credentials, service-role key, mock authentication, or localStorage authentication fallback was introduced.

### Issue 2 — Sign-in returned Failed to fetch

**Observed error:**

    Failed to fetch

**Cause:** The Supabase project/database was paused. The application could attempt Supabase Auth, but the Supabase backend was not active.

**Resolution:** The Supabase project was reactivated. Citizen sign-in then succeeded without changing the authentication implementation.

**Lesson:** A generic browser Failed to fetch during Supabase Auth does not necessarily indicate an application-code defect. Supabase project availability must be checked before changing auth code.

### Result

The verified citizen workflow is now:

    About / Welcome
      ↓
    Citizen Registration / Sign In
      ↓
    Protected Citizen App
      ↓
    Submit Suggestion
      ↓
    Supabase persistence
      ↓
    Reference ID / submission confirmation
      ↓
    My Suggestions
      ↓
    Track / view suggestion

The citizen flow is considered functionally working in the verified AI Studio environment. This does not mean every pending RLS, storage, support, moderator, or admin test is complete.

## 38B. September 26 UI passes and current shell

The routed public page is `WelcomeAbout.tsx`; `Home.tsx` and `LandingPage.tsx` remain legacy/unrouted. Round 1 revised the public hero, reduced the existing 3D scene noise, and scoped Lenis smooth scrolling and an InView reveal to the public page. Round 2 rewrote the lower home narrative, simplified citizen sign-in language while keeping diagnostics behind details, and adapted the user-supplied glass-button and particle-loader components under `src/components/ui/`. The honey/dark palette, remote background video, and route-aware SceneCanvas remain.

Round 2 visual QA fixed the citizen feed's clipped filter chips, one-line desktop navbar labels, a clipped mobile admin + action, and centered full-page orb loading. Round 3 fixed glass controls overriding responsive `hidden`, added viewport safe-area spacing and a dark theme-color, gave coarse-pointer form controls 16px text, improved tap feedback, and removed page-wide text-selection blocks. Later targeted fixes reduced the citizen feed Search button and improved the Track Search disabled contrast while placing its clear control inside the input. No Dither Reveal or daisyUI integration was added. These were local-preview and fabricated-auth fixture checks, not a deployment test on a real phone or live Supabase.

## 38C. Repository audit findings that need deployment checks

- `schema.sql` storage upload policy checks only `bucket_id`; `storageService.ts` applies client-side size/MIME checks. Confirm live bucket limits and policy path restrictions before production. No live storage configuration was inspected in this code audit.
- `SchemaModal.tsx` still embeds a copyable pre-hardening SQL baseline and is reachable from the admin login page. Do not present this as a safe one-step deployment script.
- Citizen-owned detail queries return `admin_notes` and the citizen details page renders them. Treat notes as citizen-visible until a product/privacy decision changes this. The public projection excludes them.
- `index.html` loads `motion@latest` from a CDN without pinning, alongside bundled motion. The production JS still builds as a ~2.13 MB single chunk (~594 KB gzip).
- Baseline schema and frontend still mention `moderator`, while migration 001 limits roles to `citizen | admin`. Registration UI requires six characters; actual Supabase password policy is not verified.
- Package metadata contains likely unused `@google/genai`, `express`, `dotenv`, and `@types/express`; do an import/dependency check before removing. The footer says MIT but the branch has no LICENSE file.
- The migration order 001 through 004 and live grants/RLS/bucket settings need a read-only audit. Migration 002 does revoke legacy counter RPCs; whether that protection is live is unknown.

## 39. One-Page Mental Model

```text
                         HIVE
                          │
             ┌────────────┴────────────┐
             │                         │
          CITIZEN                    ADMIN
             │                         │
       About → Auth               Auth → Role
             │                         │
           /app                    /admin
             │                         │
     Submit / Track / My       Review / Update
             │                         │
             └────────────┬────────────┘
                          │
                       Supabase
                          │
             ┌────────────┼────────────┐
             │            │            │
            Auth      PostgreSQL    Storage
                          │
             ┌────────────┼────────────┐
             │            │            │
         profiles    suggestions    history
                          │
                 suggestion_supports
                          │
                         RLS
                          │
                  public projections

                  3D presentation
                          │
                    SceneCanvas
                          │
             scenes + objects + effects
```

---

## 40. Final Architectural Principles

> **Supabase is the source of truth.**

> **Authentication identifies the user; RLS determines what the user may access.**

> **The database UUID is authoritative internally; DSB reference IDs are for citizens.**

> **Anonymous means privacy of public identity, not anonymous authentication.**

> **Audit history must be generated from trusted database context, not arbitrary browser claims.**

> **A beautiful 3D interface is valuable only if the civic workflow underneath it is correct, secure, and usable.**
