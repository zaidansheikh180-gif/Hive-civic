# HIVE — Digital Suggestion Box
## Canonical Architecture & Project Context

> **Last architecture update:** 10 September 2026
>
> This document is the canonical technical context for HIVE. It describes the repository as it actually exists on `main`, the security/architecture decisions that have been made, the problems that were discovered and solved, and the remaining target work. Future LLMs must inspect the code before assuming a `TARGET` item is implemented.

---

## 1. Project Identity

**Name:** HIVE — Digital Suggestion Box  
**Repository:** `zaidansheikh180-gif/Hive-civic`  
**Branch:** `main`  
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

### Environment

The browser client expects:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Only the public/anon client key belongs in browser code. A service-role/secret key must never be shipped to the frontend.

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
│       └── 001_security_hardening.sql
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

ADMIN
/admin/login
/admin
/admin/suggestions
/admin/suggestions/:id
```

Legacy aliases remain:

```text
/submit      → /app/submit
/submitted   → /app/submitted
/track       → /app/track
```

### Protection status

The current code protects `/app`, `/app/submit`, `/app/submitted`, `/app/track`, `/app/suggestions`, and `/app/suggestions/:id` with `ProtectedRoute`.

Admin routes use `ProtectedRoute requireAdmin`.

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
- Admin access requires `profiles.role = 'admin'`.

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

Current roles are:

```text
citizen
admin
```

New registrations must become `citizen`.

The database trigger `handle_new_user()` is responsible for enforcing this rather than trusting browser-provided role metadata.

### Security rule

A user must never be able to turn themselves into an admin by changing:

- React state
- localStorage
- user metadata
- request payloads
- profile form values

Admin authorization is a database concern.

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
role        citizen | admin
created_at
tupdated_at
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

The frontend no longer uses localStorage to track support state.

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

The application should continue using shared components instead of duplicating identical UI behavior across pages.

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
9. Migration execution on the connected Supabase project must be verified; a committed SQL migration is not proof that the live database has applied it.
10. Full lint/build/runtime verification must be performed after pulling these changes into AI Studio.

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

## 37. Change Management Rules for Future LLMs

Before changing HIVE:

1. Read `ARCHITECTURE.md`.
2. Read `PROGRESS.md`.
3. Inspect the actual files involved.
4. Distinguish CURRENT from TARGET.
5. Never assume a committed migration has been applied to the live Supabase project.
6. Never introduce localStorage as a replacement backend.
7. Never use frontend-only authorization.
8. Never expose service-role secrets.
9. Preserve UUID/reference-ID separation.
10. Preserve the canonical six statuses and ten categories.
11. Preserve citizen/admin separation.
12. Update both architecture and progress documentation whenever meaningful architecture or implementation progress occurs.
13. Do not mark work complete unless it is actually implemented and, where applicable, verified.

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
