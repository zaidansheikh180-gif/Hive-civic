# HIVE — Digital Suggestion Box
## Comprehensive Architecture & Project Context

> **Purpose of this document:** This is the canonical architecture/context document for HIVE. An LLM, developer, reviewer, or future contributor should be able to read this file and understand what the project is, why it exists, how it evolved, how it is structured, what is already implemented, which architectural decisions were made, which problems were discovered, which problems were solved, and what must happen next.
>
> **Important:** This document describes both the **current implementation** and the **approved target architecture**. Sections explicitly marked `TARGET`, `PLANNED`, or `MUST CHANGE` are design decisions that are not necessarily fully implemented yet.

---

## 1. Project Identity

**Project name:** HIVE — Digital Suggestion Box

**Repository:** `zaidansheikh180-gif/Hive-civic`

**Primary branch:** `main`

**Project type:** Full-stack civic technology web application / academic research prototype

**Primary purpose:** Give citizens a structured digital channel for submitting local civic suggestions and issues, receiving a reference ID, tracking progress, and seeing transparent status changes while administrators review and manage submissions.

HIVE is intentionally designed as more than a CRUD form. The product concept combines:

- civic participation
- transparent issue/suggestion tracking
- citizen-facing submission and tracking
- administrative triage and management
- auditable status history
- community support/endorsement
- a distinctive 3D visual identity
- Supabase-backed persistence and authentication

The project is currently a **functional prototype with an established architecture and an active hardening/polish phase**.

---

## 2. Product Concept

### Problem

Citizens often have useful ideas or can identify local problems, but there may be no clear, structured, transparent path from observation to municipal review and eventual action.

Traditional suggestion mechanisms can suffer from:

- poor discoverability
- unclear submission procedures
- lack of tracking
- no visible progress
- fragmented communication
- weak transparency
- little community feedback

### HIVE's solution

HIVE provides one digital civic workflow:

```text
Citizen
  ↓
Understand HIVE
  ↓
Create / sign into citizen account
  ↓
Submit civic suggestion
  ↓
Receive DSB reference ID
  ↓
Suggestion enters municipal workflow
  ↓
Admin reviews and changes status
  ↓
Status history records the transition
  ↓
Citizen tracks progress
  ↓
Community can support suggestions
```

The product should make the lifecycle understandable without requiring the citizen to know how municipal departments operate internally.

---

## 3. Core Domain Model

### Suggestion categories

The canonical categories are:

1. Roads & Footpaths
2. Street Lighting
3. Waste Management
4. Water & Sanitation
5. Public Spaces
6. Transport
7. Education
8. Environment
9. Community Facilities
10. Other

### Canonical suggestion statuses

```text
submitted
under_review
accepted
planned
implemented
rejected
```

These represent the public-facing lifecycle of a civic suggestion.

### Reference ID

Human-readable reference IDs follow:

```text
DSB-YYYY-XXXXXX
```

Example:

```text
DSB-2026-7F3K9P
```

The generator intentionally avoids visually ambiguous characters such as `0`, `1`, `I`, and `O`.

### Status lifecycle

The intended normal progression is:

```text
submitted
    ↓
under_review
    ↓
accepted
    ↓
planned
    ↓
implemented
```

`rejected` can occur when a suggestion is reviewed and determined not to be feasible, appropriate, or compatible with relevant constraints.

The database also allows status history to record the actual sequence of transitions.

---

## 4. Current Technology Stack

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Lucide React
- React Hook Form
- Zod
- Motion
- GSAP

### 3D / graphics

- Three.js
- React Three Fiber
- React Three Drei

### Backend / data

- Supabase
- Supabase Auth
- PostgreSQL
- Supabase Storage
- PostgreSQL Row Level Security (RLS)

### Additional packages already present

- `@google/genai`
- `recharts`
- Express
- dotenv
- TypeScript tooling

The dependency set is visible in `package.json` and establishes React/Vite as the application runtime with Three.js/R3F for the 3D layer and Supabase for backend services.

---

## 5. Current Repository Structure

The repository currently follows this broad structure:

```text
Hive-civic/
├── .env.example
├── .gitignore
├── PROGRESS.md
├── bun.lock
├── index.html
├── metadata.json
├── package.json
├── public/
│   └── assets/
│       └── aistudio/
│           └── .gitignore
├── supabase/
│   └── schema.sql
└── src/
    ├── App.tsx
    ├── components/
    │   ├── AcademicDisclaimer.tsx
    │   ├── AdminDashboard.tsx
    │   ├── CitizenDashboard.tsx
    │   ├── CustomCursor.tsx
    │   ├── LandingPage.tsx
    │   ├── Navbar.tsx
    │   ├── StatusBadge.tsx
    │   ├── StatusTimeline.tsx
    │   ├── SubmitSuggestionForm.tsx
    │   └── TiltCard.tsx
    ├── data.ts
    ├── index.css
    ├── lib/
    │   └── supabaseClient.ts
    ├── main.tsx
    ├── pages/
    │   ├── AdminDashboard.tsx
    │   ├── AdminLogin.tsx
    │   ├── AdminSuggestions.tsx
    │   ├── Home.tsx
    │   ├── SubmissionSuccess.tsx
    │   ├── SubmitSuggestion.tsx
    │   ├── SuggestionDetails.tsx
    │   └── TrackSuggestion.tsx
    ├── services/
    │   ├── authService.ts
    │   ├── storageService.ts
    │   ├── suggestionService.ts
    │   └── supabaseClient.ts
    ├── three/
    │   ├── SceneCanvas.tsx
    │   ├── cameras/
    │   │   └── CameraRig.tsx
    │   ├── effects/
    │   │   └── ParticleField.tsx
    │   ├── objects/
    │   │   ├── CivicNetwork.tsx
    │   │   ├── DataBars3D.tsx
    │   │   ├── DataSphere.tsx
    │   │   ├── FloatingCard.tsx
    │   │   ├── StatusTimeline3D.tsx
    │   │   └── SuggestionBox.tsx
    │   └── scenes/
    │       ├── AdminScene.tsx
    │       ├── HomeScene.tsx
    │       ├── SubmitScene.tsx
    │       ├── SuccessScene.tsx
    │       ├── TrackScene.tsx
    │       └── WorkspaceScene.tsx
    └── types/
        └── index.ts
```

The repository has already evolved from a simple page-based prototype into a layered application with route pages, reusable UI components, service abstractions, Supabase integration, and a dedicated 3D rendering subsystem.

---

## 6. Architectural Layers

HIVE should be understood as five major layers.

```text
┌──────────────────────────────────────────────┐
│                 ROUTE / UX LAYER             │
│ Pages + React Router + navigation             │
├──────────────────────────────────────────────┤
│                 UI COMPONENT LAYER            │
│ Navbar, forms, cards, badges, timelines       │
├──────────────────────────────────────────────┤
│                 3D PRESENTATION LAYER         │
│ SceneCanvas + scenes + objects + effects      │
├──────────────────────────────────────────────┤
│                 SERVICE / DOMAIN LAYER        │
│ Auth + suggestions + storage + transformations│
├──────────────────────────────────────────────┤
│                 DATA / BACKEND LAYER          │
│ Supabase Auth + PostgreSQL + Storage + RLS    │
└──────────────────────────────────────────────┘
```

The UI should not contain direct database logic when a service abstraction is appropriate.

The 3D layer is a presentation system, not the source of application truth.

Supabase/PostgreSQL is intended to become the authoritative persistent source of truth.

---

## 7. Application Bootstrap

### `src/main.tsx`

This is the frontend entry point and mounts the React application.

### `src/App.tsx`

`App.tsx` currently acts as the global application shell.

It is responsible for:

- reading the current URL
- determining the active 3D scene
- rendering the global background video layer
- rendering `SceneCanvas`
- rendering the custom cursor
- rendering the global navbar
- rendering route content
- rendering the academic disclaimer
- scrolling to the top on navigation

Current route-to-scene mapping includes:

```text
/                         → home
/submit                   → submit
/submitted                → success
/track                    → track
/admin/login              → admin
/admin                    → admin
/admin/suggestions        → suggestions
/admin/suggestions/:id   → workspace
```

The current `App.tsx` therefore mixes global shell concerns, scene selection, and routing. This is acceptable for the prototype but can later be split into dedicated routing/auth/layout modules if complexity grows.

---

## 8. Current Route Architecture

### Implemented routes

```text
/                          Home / current landing experience
/submit                    Submit a suggestion
/submitted                 Submission success
/track                     Track a suggestion
/admin/login               Administrator login
/admin                     Administrator dashboard
/admin/suggestions         Administrator suggestion list
/admin/suggestions/:id     Administrator suggestion workspace/details
```

### Current limitation

There is currently **no complete citizen authentication flow** in the route architecture.

There is also no finalized public About/Welcome route in the current routing code.

This was identified as a major UX gap.

---

## 9. Approved Final Route Architecture — TARGET

The project decision is that the website should not immediately throw a first-time visitor into the operational application.

A first-time visitor should first understand what HIVE is and why it exists.

### Approved citizen flow

```text
/
About / Welcome
      ↓
/auth
Citizen Sign In / Register
      ↓
/app
Main HIVE Interface
      ↓
Submit / Track / My Suggestions
```

### Approved complete route map

```text
/
    Public About / Welcome

/auth
    Citizen authentication

/auth/login
    Citizen sign in

/auth/register
    Citizen registration

/auth/forgot-password
    Password recovery

/app
    Main citizen HIVE interface

/app/submit
    Submit civic suggestion

/app/submitted
    Submission confirmation

/app/track
    Track suggestion

/app/suggestions
    Citizen's submitted suggestions

/app/suggestions/:id
    Citizen suggestion details

/admin/login
    Separate administrator authentication

/admin
    Admin dashboard

/admin/suggestions
    Admin suggestion management

/admin/suggestions/:id
    Admin suggestion workspace/details
```

### Why this architecture was chosen

The product needs two distinct audiences:

- citizens
- administrators

Citizens should not be treated as administrators and should not use the admin authentication path.

The public landing/about experience should establish:

- what HIVE is
- what problem it solves
- how the civic workflow works
- why citizens should participate
- what information is collected
- what tracking means
- the academic/research context where appropriate

Only after that explanation should the user be asked to enter the operational application.

---

## 10. Authentication Architecture — TARGET

### Citizen authentication

Use **Supabase Auth** for:

- registration
- sign in
- sign out
- password recovery
- session persistence
- auth state changes

Citizen authentication should be separate from administrative authorization.

### Administrator authentication

Admins should also authenticate through Supabase Auth, but their authorization must be determined by a secure server-side/database role model.

The frontend must never decide that a user is an admin merely because:

- their email contains `admin`
- their password has a certain length
- a localStorage flag exists
- a demo condition is satisfied

### Critical security decision

The current `authService.ts` contains an academic/demo fallback that accepts broad conditions such as an email containing `admin` or a password of sufficient length. This is useful for an early prototype but is **not acceptable as production authentication**.

**MUST CHANGE:** Remove the insecure demo authentication fallback before the application is considered production-ready.

### Session principle

Supabase's authenticated session should be the source of truth for authentication state.

localStorage may be used for non-sensitive UI preferences or carefully controlled caches, but it must not become the authority for access control.

---

## 11. Database Architecture

The PostgreSQL schema currently defines three main application tables and a storage bucket.

```text
Supabase
│
├── Auth users
│
├── profiles
│
├── suggestions
│
├── suggestion_status_history
│
└── Storage
    └── suggestion-photos
```

### `profiles`

Links application profiles to Supabase Auth users.

Current fields:

```text
id
email
full_name
role
created_at
updated_at
```

Current role values:

```text
admin
moderator
```

### `suggestions`

Main civic proposal table.

Fields include:

```text
id
reference_id
category
title
description
location_text
photo_path
photo_url
contact_name
contact_email
contact_phone
is_anonymous
status
support_count
admin_notes
created_at
updated_at
```

### `suggestion_status_history`

Audit trail for lifecycle changes.

Fields:

```text
id
suggestion_id
old_status
new_status
note
changed_by
created_at
```

### Storage

A public Supabase Storage bucket named:

```text
suggestion-photos
```

is defined for suggestion images.

---

## 12. Database Security — CURRENT PROBLEMS TO HARDEN

The schema establishes RLS but some policies are intentionally broad in the current prototype.

Examples include policies equivalent to:

```text
using (true)
with check (true)
```

for operations that should ultimately be restricted.

### Risks

1. Authenticated users may be able to perform operations that should be administrator-only.
2. Public suggestion reads expose more data than may be appropriate.
3. Frontend masking is not a security boundary.
4. Public update policies are too broad.
5. Admin delete/update policies currently do not sufficiently enforce the admin role.

### Required target behavior

RLS should enforce authorization in PostgreSQL itself.

Conceptually:

```text
Public / anon
    ↓
Allowed only to create valid submissions and perform explicitly public operations

Authenticated citizen
    ↓
Can access only their permitted citizen data

Admin / moderator
    ↓
Can manage authorized suggestions and status history
```

The exact policies must be implemented carefully using authenticated identity and the `profiles.role` relationship.

---

## 13. Suggestion Ownership — TARGET DECISION

The current schema does not have a dedicated `user_id` foreign key on `suggestions`.

For the final citizen-authenticated architecture, the preferred model is:

```text
suggestions.user_id → auth.users.id
```

or an equivalent ownership field.

This allows:

- citizens to view their own submissions
- `/app/suggestions` to show a user's own suggestions
- `/app/suggestions/:id` to enforce ownership
- anonymous public presentation without exposing private contact data

`is_anonymous` should control whether the citizen's identity is publicly displayed, not whether the system loses ownership information internally.

A citizen can therefore be authenticated while choosing an anonymous public submission.

---

## 14. Public Transparency vs Privacy

HIVE is intended to be transparent, but transparency must not mean exposing personal data.

### Publicly useful information

Potentially public:

- reference ID
- category
- title
- general location
- description
- public status
- support count
- status history
- appropriate public/admin response

### Sensitive/private information

Should not be publicly exposed merely because a suggestion is public:

- private email
- private phone number
- internal contact information
- other personally identifying information

### Important rule

**Never rely on React rendering logic to hide sensitive database fields.**

RLS/database access must prevent unauthorized retrieval where necessary.

---

## 15. Suggestion ID Architecture — Important Historical Bug

Two identifiers exist and must not be confused.

### Human-facing identifier

```text
reference_id
DSB-YYYY-XXXXXX
```

Used by citizens for tracking.

### Database identifier

```text
id
UUID
```

Used internally for relational references.

### Historical bug

The frontend service previously generated a string suggestion ID such as:

```text
sug-...
```

while the PostgreSQL table defines `id` as a UUID generated by the database.

This can break status-history relationships because:

```text
suggestion_status_history.suggestion_id
```

references:

```text
suggestions.id
```

### Correct architecture

The database must create/return the canonical UUID.

Correct sequence:

```text
1. Generate reference_id
2. INSERT suggestion
3. PostgreSQL returns suggestion row + UUID
4. Use returned UUID for status history
5. Return reference_id to citizen
```

Never invent a separate frontend primary key when PostgreSQL owns the primary key.

---

## 16. Suggestion Service Architecture

`src/services/suggestionService.ts` is the main domain/data service for suggestions.

It currently handles concepts including:

- reference ID generation
- suggestion creation
- seed/demo data
- localStorage fallback
- suggestion reads
- history reads/writes
- dashboard statistics
- Supabase integration

### Historical prototype design

The service contains localStorage storage keys:

```text
hive_dsb_suggestions_v2
hive_dsb_history_v2
```

and realistic seed data.

This was useful for making the prototype functional without requiring a configured backend.

### Final architecture decision

Supabase should become the authoritative source of truth.

localStorage must not remain a competing persistence layer in the production architecture.

If offline/demo mode is retained for academic presentation, it must be explicit and isolated behind a clearly defined demo adapter rather than silently acting as a backend fallback.

---

## 17. Seed / Demo Data

The current service contains six realistic example suggestions spanning different categories and statuses.

The seed data demonstrates:

- submitted
- under review
- accepted
- planned
- implemented
- rejected

It also demonstrates:

- anonymous submissions
- named submissions
- community support counts
- admin notes
- status history

### Architectural decision

Seed data is useful for:

- development
- screenshots
- demonstrations
- academic evaluation
- testing UI states

But seed/demo records must not be confused with real field-study data or real municipal records.

Production deployment should either remove seed data or explicitly mark/demo-isolate it.

---

## 18. Photo Upload Architecture

`src/services/storageService.ts` handles suggestion image storage.

Current database/storage architecture includes a public bucket:

```text
suggestion-photos
```

### Historical problem

The prototype can upload a photo before the final database suggestion UUID is known, creating temporary-reference complexity.

### Preferred target flow

```text
1. Validate suggestion form
2. Create suggestion row
3. Receive canonical UUID
4. Upload photo using suggestion-specific path
5. Update suggestion.photo_path / photo_url
6. If upload fails, handle cleanup/error state
```

Alternatively, a robust temporary-upload strategy may be used, but it must include deterministic cleanup and ownership validation.

---

## 19. 3D Architecture

3D is a core product identity rather than a decorative afterthought.

The project intentionally uses a dedicated `src/three/` subsystem.

### `SceneCanvas.tsx`

Central renderer/orchestrator for the active Three.js scene.

The application selects a `SceneType` based on the route.

### Camera

```text
three/cameras/CameraRig.tsx
```

Provides reusable camera behavior.

### Effects

```text
three/effects/ParticleField.tsx
```

Provides atmospheric particle effects.

### Reusable 3D objects

```text
CivicNetwork
DataBars3D
DataSphere
FloatingCard
StatusTimeline3D
SuggestionBox
```

### Scene modules

```text
HomeScene
SubmitScene
SuccessScene
TrackScene
AdminScene
WorkspaceScene
```

### Design principle

Each major application context should have a visual environment that reinforces its purpose.

For example:

```text
Home / About
    → civic network / city / community visual language

Submit
    → suggestion box / intake / contribution visual language

Success
    → confirmation / registered contribution visual language

Track
    → status timeline / data flow visual language

Admin
    → civic operations / analytics / command-center visual language

Workspace
    → detailed case management / inspection visual language
```

---

## 20. 3D Visual Quality Requirement

A major project decision was that the site should be a **fully 3D animated experience**, not merely normal HTML pages with a decorative 3D background.

Therefore:

- 3D scenes should respond to route/context.
- Camera motion should feel intentional.
- Objects should have meaningful relationships to the current page.
- Animations should support hierarchy and navigation.
- UI should remain readable above the 3D layer.
- Performance must be protected.
- Mobile behavior must be considered.

The existing 3D architecture is strong enough to continue, but visual QA is still required to ensure every route feels genuinely integrated with the 3D world.

---

## 21. Global Visual System

Current global shell includes:

### Atmospheric video

`App.tsx` includes a fixed background video layer with reduced opacity.

### Custom cursor

`CustomCursor.tsx` provides a precision/interactive cursor effect.

### Navbar

`Navbar.tsx` provides global navigation.

### Motion

The project uses both:

- Motion
- GSAP

for UI/scene animation.

### Styling

`src/index.css` contains global styling and the application's visual language.

### Reusable UI primitives

- `TiltCard`
- `StatusBadge`
- `StatusTimeline`
- `SubmitSuggestionForm`

These are intended to reduce duplication across pages.

---

## 22. UI Component Responsibilities

### `AcademicDisclaimer.tsx`

Communicates that the system is an academic/research prototype where appropriate.

### `Navbar.tsx`

Global navigation and access to application areas.

### `CustomCursor.tsx`

Interactive visual cursor behavior.

### `TiltCard.tsx`

Reusable interactive card treatment.

### `StatusBadge.tsx`

Visual representation of a suggestion's lifecycle status.

### `StatusTimeline.tsx`

Human-readable history/progression of a suggestion.

### `SubmitSuggestionForm.tsx`

Reusable form implementation for civic suggestions.

### `CitizenDashboard.tsx`

Citizen-facing dashboard component. It exists in the component layer and should be integrated into the final authenticated `/app` experience.

### `LandingPage.tsx`

Legacy/current landing presentation component. Its responsibilities should eventually be reconciled with the approved About/Welcome architecture rather than allowing two competing landing concepts.

### Admin components

`AdminDashboard.tsx` provides reusable admin dashboard UI while `pages/AdminDashboard.tsx` is the route-level page.

This duplication is a signal that component/page boundaries should be reviewed during cleanup.

---

## 23. Page Architecture

### `Home.tsx`

Current public/home experience.

**TARGET:** Evolve into or be replaced by the approved About/Welcome experience.

### `SubmitSuggestion.tsx`

Route-level submission page.

Responsibilities include presenting the form, handling submission, interacting with suggestion services, and navigating to confirmation.

### `SubmissionSuccess.tsx`

Displays successful submission and reference ID information.

### `TrackSuggestion.tsx`

Allows users to locate a suggestion and inspect its status.

### `SuggestionDetails.tsx`

Detailed suggestion presentation/workspace.

### `AdminLogin.tsx`

Administrative authentication entry point.

### `AdminDashboard.tsx`

Administrative overview, statistics, and management controls.

### `AdminSuggestions.tsx`

Administrative suggestion list/filter/search interface.

---

## 24. Types Architecture

`src/types/index.ts` contains the main domain types.

Important interfaces/types:

```text
SuggestionStatus
SuggestionCategory
Suggestion
SuggestionStatusHistory
AdminProfile
DashboardStats
SceneType
```

### Current technical debt

The type file still contains legacy compatibility values such as:

```text
Under Review
Pending
Resolved
```

and older categories such as:

```text
Roads
Electricity
Sanitation
Public Safety
Parks
```

These are not part of the canonical product model.

### Target decision

Reduce the type model to the canonical categories/statuses once all legacy consumers are migrated.

Do not add new features using legacy values.

---

## 25. Data Flow — Citizen Submission

Final target flow:

```text
Citizen
  ↓
Authenticated session
  ↓
SubmitSuggestionForm
  ↓
Zod / form validation
  ↓
suggestionService.createSuggestion()
  ↓
Supabase INSERT
  ↓
PostgreSQL creates UUID
  ↓
Service receives canonical suggestion row
  ↓
Optional photo upload
  ↓
Status history initial entry
  ↓
Return reference_id
  ↓
SubmissionSuccess
```

The citizen sees the human-readable reference ID.

The system internally uses the UUID.

---

## 26. Data Flow — Tracking

Target flow:

```text
Citizen
  ↓
/app/track
  ↓
Enter DSB reference ID
  ↓
Service queries authorized/public tracking data
  ↓
Suggestion returned
  ↓
Status displayed
  ↓
Status history displayed
  ↓
3D TrackScene reflects lifecycle
```

Tracking should not require the citizen to know the database UUID.

---

## 27. Data Flow — Administration

Target flow:

```text
Admin
  ↓
/admin/login
  ↓
Supabase Auth
  ↓
Role verified from database
  ↓
/admin
  ↓
Dashboard statistics
  ↓
/admin/suggestions
  ↓
Select suggestion
  ↓
/admin/suggestions/:id
  ↓
Update status / notes / allowed fields
  ↓
Insert status-history record
  ↓
Citizen sees updated public status
```

Every meaningful lifecycle transition should have an audit entry.

---

## 28. Status History Rules

The status-history table exists to preserve a transparent lifecycle.

A status change should conceptually produce:

```text
old_status
new_status
note
changed_by
created_at
```

Example:

```text
submitted
    ↓
under_review

note: Department has begun reviewing the issue.
changed_by: Authorized administrator
```

The history should not be treated as a disposable UI log. It is part of the civic transparency model.

---

## 29. Community Support / Endorsement

The product includes `support_count` to represent community support.

This allows a suggestion to demonstrate that multiple citizens consider an issue valuable.

### Security consideration

The current prototype permits broad update access around support counts.

This is not sufficient for a production system.

### Target architecture

A safer design would use a dedicated endorsement mechanism, for example:

```text
suggestion_supports
    id
    suggestion_id
    user_id
    created_at
```

with a unique constraint preventing one citizen from repeatedly inflating support.

`support_count` could then be derived or maintained safely.

This is a recommended future hardening task, not a claim that the table currently exists.

---

## 30. Authentication / Authorization Separation

This distinction is fundamental.

```text
Authentication
    "Who are you?"

Authorization
    "What are you allowed to do?"
```

Supabase Auth answers identity/session questions.

Database roles/RLS answer authorization questions.

Do not implement authorization as:

```text
if (email.includes('admin')) ...
```

or:

```text
if (localStorage.admin) ...
```

The database must enforce privileged operations.

---

## 31. Errors and Architectural Problems Already Identified

The project has not been built linearly. Several issues were discovered during architecture review.

### Problem 1 — No citizen login/register

**Discovery:** The initial application had an admin login but no citizen authentication.

**Why it mattered:** The final product needs personalized citizen functionality and a clear separation between citizens and administrators.

**Decision:** Add Supabase-backed citizen authentication.

---

### Problem 2 — No About/Welcome experience

**Discovery:** The site originally opened directly into the application.

**Why it mattered:** A first-time visitor should understand the civic purpose before being asked to operate the system.

**Decision:** Make `/` the About/Welcome experience and place citizen authentication after it.

---

### Problem 3 — Supabase was present but not fully authoritative

**Discovery:** The code had Supabase integration but also maintained localStorage persistence/fallback behavior.

**Why it mattered:** Two competing data sources can diverge and make behavior unpredictable.

**Decision:** Supabase/PostgreSQL becomes the source of truth. Demo storage must be explicitly isolated if retained.

---

### Problem 4 — Suggestion UUID vs frontend-generated ID

**Discovery:** PostgreSQL expects a UUID while frontend logic generated its own string ID.

**Why it mattered:** Status history references the database UUID.

**Decision:** Insert first, receive the database UUID, then use it everywhere internally.

---

### Problem 5 — Overly permissive RLS

**Discovery:** Several policies use broad `true` conditions.

**Why it mattered:** RLS must protect data even if frontend code is bypassed.

**Decision:** Replace broad policies with role/ownership-aware policies before production readiness.

---

### Problem 6 — Demo admin authentication is insecure

**Discovery:** The current service includes a broad academic demo login fallback.

**Why it mattered:** It can accept credentials that are not genuinely authenticated by Supabase.

**Decision:** Keep demo access only if explicitly isolated; remove it from the production authentication path.

---

### Problem 7 — Public data could expose private fields

**Discovery:** Public reads currently allow access to suggestion rows broadly.

**Why it mattered:** Frontend masking cannot protect data already returned to a client.

**Decision:** Restrict database access or introduce a public projection/view/RPC that exposes only approved public fields.

---

### Problem 8 — Photo upload lifecycle

**Discovery:** Uploading before the final suggestion exists creates temporary-reference complexity.

**Decision:** Prefer database-first creation, UUID-based storage paths, then photo upload/update with cleanup handling.

---

### Problem 9 — 3D could become decorative instead of meaningful

**Discovery:** A 3D background alone does not satisfy the product's intended visual identity.

**Decision:** Maintain route-specific scenes, meaningful 3D objects, camera behavior, and visual relationships to the current civic workflow.

---

### Problem 10 — Legacy type values

**Discovery:** The type model contains both canonical and older status/category values.

**Decision:** Migrate consumers to the canonical model and remove legacy values after compatibility is no longer needed.

---

### Problem 11 — Duplicate page/component responsibilities

**Discovery:** Some concepts exist both as route pages and reusable components, such as admin dashboard functionality and landing experiences.

**Decision:** Consolidate responsibilities so route files orchestrate pages and components provide reusable UI/business presentation pieces.

---

## 32. Evolution of the Project

The project evolved through the following architectural stages.

### Stage 1 — Basic civic concept

The project began as a digital suggestion-box concept focused on collecting civic ideas/issues.

### Stage 2 — Page-based functional prototype

Core pages were introduced:

- home
- submit
- success
- track
- admin login
- admin dashboard
- admin suggestions
- suggestion details

### Stage 3 — Backend architecture

Supabase was introduced for:

- authentication
- PostgreSQL persistence
- storage
- RLS
- status history

### Stage 4 — 3D product identity

A dedicated Three.js/React Three Fiber architecture was added with:

- scene routing
- reusable 3D objects
- camera rig
- particles
- data visualizations
- route-specific environments

### Stage 5 — Architecture review

A deeper review identified that the presence of Supabase did not automatically mean the app was securely or consistently using Supabase as the source of truth.

The review exposed:

- localStorage fallback
- ID mismatch
- permissive RLS
- insecure demo admin fallback
- public-data/privacy concerns
- incomplete citizen authentication
- missing first-visit explanation

### Stage 6 — Approved product flow

The product direction was refined to:

```text
About / Welcome
      ↓
Citizen Auth
      ↓
Main HIVE App
      ↓
Submit / Track / My Suggestions

Separate Admin Auth
      ↓
Admin Dashboard
```

### Stage 7 — Documentation maturity

`PROGRESS.md` was created to track implementation state and next steps.

This `ARCHITECTURE.md` now serves as the deeper architectural memory of the project.

---

## 33. Current State vs Final State

| Area | Current | Final Target |
|---|---|---|
| React app | Implemented | Keep |
| TypeScript | Implemented | Keep |
| React Router | Implemented | Expand route model |
| Supabase client | Implemented | Keep |
| Supabase database | Implemented | Harden |
| Supabase Auth | Admin-oriented | Citizen + admin separation |
| Citizen auth | Missing/incomplete | Required |
| About/Welcome | Missing from final route architecture | Required at `/` |
| Submission | Implemented | Auth-aware + Supabase-authoritative |
| Tracking | Implemented | Ownership/privacy hardened |
| Admin dashboard | Implemented | Role-protected |
| Status history | Implemented | UUID-correct + RLS-hardened |
| Photo storage | Implemented | Lifecycle hardened |
| localStorage persistence | Present | Remove as authoritative backend |
| Demo seed data | Present | Isolate/remove for production |
| RLS | Present | Strongly restrict |
| 3D engine | Implemented | Polish and optimize |
| Mobile UX | Needs QA | Fully responsive |
| Legacy types | Present | Remove after migration |
| Community support | Basic counter | Prefer identity-aware endorsement model |
| Testing | Needs comprehensive pass | Required before final release |

---

## 34. Final Folder Structure — TARGET

The approved target organization should converge toward the following structure without unnecessary overengineering:

```text
Hive-civic/
├── .env.example
├── .gitignore
├── ARCHITECTURE.md
├── PROGRESS.md
├── README.md
├── bun.lock
├── index.html
├── metadata.json
├── package.json
│
├── public/
│   └── assets/
│       └── aistudio/
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_citizen_auth_and_ownership.sql
│   │   ├── 003_rls_hardening.sql
│   │   └── 004_supports_and_storage_hardening.sql
│   └── schema.sql
│
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── index.css
    │
    ├── components/
    │   ├── AcademicDisclaimer.tsx
    │   ├── Navbar.tsx
    │   ├── CustomCursor.tsx
    │   ├── StatusBadge.tsx
    │   ├── StatusTimeline.tsx
    │   ├── SubmitSuggestionForm.tsx
    │   ├── CitizenDashboard.tsx
    │   ├── AdminDashboard.tsx
    │   └── TiltCard.tsx
    │
    ├── pages/
    │   ├── About.tsx
    │   ├── auth/
    │   │   ├── Login.tsx
    │   │   ├── Register.tsx
    │   │   └── ForgotPassword.tsx
    │   ├── app/
    │   │   ├── Dashboard.tsx
    │   │   ├── SubmitSuggestion.tsx
    │   │   ├── SubmissionSuccess.tsx
    │   │   ├── TrackSuggestion.tsx
    │   │   ├── Suggestions.tsx
    │   │   └── SuggestionDetails.tsx
    │   └── admin/
    │       ├── AdminLogin.tsx
    │       ├── AdminDashboard.tsx
    │       ├── AdminSuggestions.tsx
    │       └── SuggestionDetails.tsx
    │
    ├── services/
    │   ├── authService.ts
    │   ├── citizenService.ts
    │   ├── suggestionService.ts
    │   ├── storageService.ts
    │   └── supabaseClient.ts
    │
    ├── lib/
    │   ├── supabaseClient.ts
    │   ├── validation.ts
    │   └── constants.ts
    │
    ├── types/
    │   └── index.ts
    │
    ├── data/
    │   └── demoData.ts
    │
    └── three/
        ├── SceneCanvas.tsx
        ├── cameras/
        │   └── CameraRig.tsx
        ├── effects/
        │   └── ParticleField.tsx
        ├── objects/
        │   ├── CivicNetwork.tsx
        │   ├── DataBars3D.tsx
        │   ├── DataSphere.tsx
        │   ├── FloatingCard.tsx
        │   ├── StatusTimeline3D.tsx
        │   └── SuggestionBox.tsx
        └── scenes/
            ├── AboutScene.tsx
            ├── AuthScene.tsx
            ├── HomeScene.tsx
            ├── SubmitScene.tsx
            ├── SuccessScene.tsx
            ├── TrackScene.tsx
            ├── AdminScene.tsx
            └── WorkspaceScene.tsx
```

### Important note about the target structure

This is an architectural target, not a command to blindly move every file immediately.

Existing code should be migrated incrementally and tested after each architectural change.

Avoid restructuring purely for aesthetics if it introduces risk without improving maintainability.

---

## 35. Routing and Protection — TARGET

The application should have route protection at the application layer while RLS independently protects the data layer.

Conceptually:

```text
Public routes
├── /
└── /auth/*

Citizen protected routes
└── /app/*

Admin protected routes
└── /admin/*
```

### Important security principle

Route guards improve UX, but route guards are **not security boundaries**.

Actual authorization must be enforced by Supabase/PostgreSQL RLS and trusted backend logic.

---

## 36. Environment Configuration

`.env.example` defines the expected Supabase client configuration.

The frontend expects environment values equivalent to:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

These values are used by the Supabase client.

### Rule

Do not commit private service-role keys or server secrets to the frontend repository.

The anon/public key is designed for client-side use when paired with correct RLS.

The security of the application must therefore come from database policies, not from hiding the anon key.

---

## 37. Validation Architecture

The project already includes React Hook Form and Zod.

Validation should exist at multiple layers:

```text
UI validation
    ↓
Service validation
    ↓
Database constraints / RLS
```

Client validation improves usability.

Database constraints guarantee data integrity.

RLS guarantees authorization.

No single layer should be trusted alone.

---

## 38. Error Handling Philosophy

Every asynchronous operation should have explicit handling for:

- authentication failure
- database failure
- network failure
- invalid input
- upload failure
- missing records
- unauthorized operations
- session expiration

The UI should distinguish between:

```text
Validation error
Authentication error
Authorization error
Network/database error
Not found
Unexpected error
```

Do not silently fall back to fake data when a real backend request fails unless the application is explicitly in demo mode.

---

## 39. Performance Architecture

The 3D experience must not make the application unusable.

Priorities:

1. avoid unnecessary scene reinitialization
2. reuse Three.js objects where practical
3. limit particle counts on mobile
4. avoid expensive per-frame React state updates
5. lazy-load heavy scenes/components where beneficial
6. pause or simplify 3D when the page is hidden
7. provide reduced-motion behavior
8. optimize images and video assets
9. avoid unnecessary database requests
10. use pagination for large suggestion lists

The 3D layer should enhance HIVE rather than become its largest performance bottleneck.

---

## 40. Accessibility Architecture

A 3D application still needs to function as a normal web application.

Required considerations:

- keyboard navigation
- visible focus states
- semantic headings
- labels for form controls
- sufficient contrast
- accessible status messaging
- screen-reader-friendly submission results
- reduced-motion support
- usable mobile controls
- no critical information communicated only through animation

The 3D layer must never be the only way to understand the application state.

---

## 41. Responsive Design

The target application must work across:

- desktop
- laptop
- tablet
- mobile

Particular attention is required for:

- 3D canvas scaling
- form layouts
- admin tables
- status timelines
- navigation
- touch interactions
- custom cursor disabling on touch devices
- background video performance

---

## 42. Testing Strategy — TARGET

### Functional tests

Test:

- registration
- login
- logout
- password recovery
- submission
- reference ID generation
- tracking
- status updates
- history creation
- photo upload
- anonymous submission behavior
- community support
- admin access
- unauthorized access

### Security tests

Test RLS directly.

Attempt:

- citizen reading another citizen's private data
- citizen changing suggestion status
- citizen deleting suggestions
- unauthenticated admin access
- non-admin authenticated user accessing admin operations
- arbitrary support-count manipulation
- unauthorized photo access/upload

### Visual tests

Test every scene and route at:

- desktop
- mobile
- reduced motion
- slow network
- no WebGL / degraded environment where practical

---

## 43. Academic / Research Context

HIVE is an academic/research-oriented prototype intended to demonstrate:

- civic technology concepts
- full-stack web development
- database design
- authentication
- authorization
- data transparency
- user-centered design
- 3D web interfaces
- workflow/state modeling

The system should not claim to be an official municipal government service unless it is actually deployed and authorized as one.

The academic disclaimer exists for this reason.

---

## 44. What an LLM Must Not Assume

Any future LLM working on this repository must not assume:

1. Supabase is fully production-secure merely because the client exists.
2. localStorage is the final database.
3. the current demo admin login is acceptable production authentication.
4. `id` and `reference_id` are interchangeable.
5. frontend route guards are sufficient security.
6. `using (true)` policies are acceptable for privileged operations.
7. public suggestions mean public contact information.
8. current seed data represents real municipal records.
9. every type value in `src/types/index.ts` is canonical.
10. a decorative 3D background satisfies the project's 3D requirement.
11. current routes are the final approved route architecture.
12. every item in the target folder structure already exists.

---

## 45. What an LLM Should Treat as Canonical

Unless explicitly changed in a newer architectural decision, treat these as canonical:

### Product name

```text
HIVE — Digital Suggestion Box
```

### Canonical categories

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

### Canonical statuses

```text
submitted
under_review
accepted
planned
implemented
rejected
```

### Reference ID

```text
DSB-YYYY-XXXXXX
```

### Citizen flow

```text
About → Auth → Main App
```

### Admin flow

```text
Admin Login → Admin Dashboard → Suggestion Workspace
```

### Backend source of truth

```text
Supabase / PostgreSQL
```

### Frontend stack

```text
React + TypeScript + Vite
```

### 3D stack

```text
Three.js + React Three Fiber + Drei
```

---

## 46. Recommended Implementation Order From This Point

The safest sequence is:

### Phase 1 — Authentication

1. Implement citizen Supabase registration.
2. Implement citizen sign in.
3. Implement citizen sign out.
4. Implement password recovery.
5. Implement session-aware route guards.
6. Remove insecure admin demo fallback from production flow.
7. Establish secure admin role verification.

### Phase 2 — First-Visit Experience

1. Create the final About/Welcome page.
2. Make `/` the public explanation/entry point.
3. Add clear CTA to sign in/register.
4. Ensure returning authenticated users can reach `/app` efficiently.
5. Add About-specific 3D scene.

### Phase 3 — Database Hardening

1. Add suggestion ownership (`user_id`).
2. Correct UUID/reference ID flow.
3. Harden RLS.
4. Restrict public fields.
5. Protect admin operations.
6. Harden status history writes.
7. Harden photo upload rules.
8. Decide whether public suggestions are exposed through a safe view/RPC.

### Phase 4 — Citizen Experience

1. Build `/app` dashboard.
2. Integrate `CitizenDashboard`.
3. Build My Suggestions.
4. Make Track robust.
5. Make anonymous/public identity behavior correct.
6. Add useful empty/error/loading states.

### Phase 5 — 3D and Visual Polish

1. Integrate About/Auth scenes.
2. Refine each existing scene.
3. Improve transitions.
4. Optimize camera behavior.
5. Add reduced-motion behavior.
6. Test mobile performance.
7. Ensure 3D communicates the current workflow.

### Phase 6 — Cleanup

1. Remove legacy status/category values.
2. Consolidate duplicate components/pages.
3. Isolate demo data.
4. Remove silent localStorage backend fallback.
5. Remove dead code and unused dependencies.
6. Standardize naming.

### Phase 7 — Testing

1. Functional testing.
2. Security/RLS testing.
3. Responsive testing.
4. 3D visual testing.
5. Performance testing.
6. Error-state testing.

### Phase 8 — Academic Delivery

1. Final README.
2. Architecture documentation.
3. Progress documentation.
4. Database documentation.
5. Screenshots/demo material.
6. Final presentation/demo flow.

---

## 47. Definition of Done

HIVE should be considered complete only when all of the following are true:

### Product

- A first-time visitor understands HIVE immediately.
- Citizen registration/login works.
- Citizen sessions persist correctly.
- Citizens can submit suggestions.
- Every submission receives a valid DSB reference ID.
- Citizens can track submissions.
- Citizens can view their own submissions.
- Anonymous public identity works correctly.
- Admins can review suggestions.
- Admins can update statuses.
- Status history is recorded correctly.
- Community support cannot be trivially abused.

### Security

- No insecure demo admin bypass exists in production mode.
- RLS is ownership/role aware.
- Private citizen data is not exposed through public reads.
- Admin operations are authorization-protected at the database layer.
- Photo storage is properly controlled.

### Architecture

- Supabase is the authoritative backend.
- UUIDs are used consistently for internal relationships.
- DSB reference IDs are used for human-facing tracking.
- Legacy types are removed or isolated.
- Demo data is isolated.

### UX

- About/Welcome flow works.
- Auth flow works.
- Main citizen app is coherent.
- Admin flow is separate.
- Mobile layout works.
- Loading/error/empty states are clear.

### 3D

- Every major experience has meaningful 3D integration.
- Animations support the product rather than distract from it.
- Performance is acceptable.
- Reduced-motion behavior exists.

### Documentation

- README explains setup.
- ARCHITECTURE.md explains system design.
- PROGRESS.md reflects current status.
- Supabase setup is documented.
- Environment variables are documented.
- Demo/academic limitations are documented.

---

## 48. Current Priority List

At the current point in development, the highest-priority work is:

```text
P0 — Citizen authentication
P0 — About/Welcome first-visit flow
P0 — Secure admin authorization
P0 — Supabase as single source of truth
P0 — RLS hardening
P0 — UUID/reference ID correction
P1 — Citizen dashboard / My Suggestions
P1 — Privacy-safe public suggestion access
P1 — Photo upload lifecycle
P1 — Status-history integrity
P1 — Community support hardening
P2 — 3D visual polish
P2 — Responsive/mobile optimization
P2 — Legacy cleanup
P2 — Comprehensive testing
P3 — Final academic documentation/demo
```

---

## 49. Change Management Rule for Future LLMs

Before making a significant architectural change, a future LLM should:

1. Read `ARCHITECTURE.md`.
2. Read `PROGRESS.md`.
3. Inspect the actual files involved.
4. Determine whether the desired change is **current**, **target**, or **new architecture**.
5. Preserve canonical domain values unless there is an explicit product decision to change them.
6. Avoid introducing duplicate persistence mechanisms.
7. Avoid weakening RLS for frontend convenience.
8. Keep citizen and admin authorization separate.
9. Preserve the distinction between UUIDs and DSB reference IDs.
10. Update `ARCHITECTURE.md` and/or `PROGRESS.md` when an architectural decision materially changes.

Do not treat this document as permission to implement every target item automatically. It is the architectural source of context that tells the implementer what the project is moving toward.

---

## 50. One-Page Mental Model

If an LLM only has time to understand one diagram, use this:

```text
                         HIVE
              Digital Suggestion Box
                         │
             ┌───────────┴───────────┐
             │                       │
       PUBLIC / CITIZEN           ADMIN
             │                       │
       ┌─────▼─────┐          ┌──────▼──────┐
       │ About     │          │ Admin Login │
       │ Welcome   │          └──────┬──────┘
       └─────┬─────┘                 │
             ↓                       ↓
       Citizen Auth            Admin Authorization
             │                       │
             ↓                       ↓
        Main HIVE App          Admin Dashboard
             │                       │
       ┌─────┼─────┐                 ↓
       │     │     │            Suggestion
    Submit  Track  My           Management
       │     │   Suggestions         │
       └─────┼─────┘                 │
             ↓                       ↓
          Suggestion ◄────── Status Updates
             │                       │
             ├──────────┬────────────┘
             ↓          ↓
        PostgreSQL   Status History
             │
             ├── Supabase Auth
             ├── RLS
             └── Storage

             3D PRESENTATION LAYER
                     │
        ┌────────────┼────────────┐
        ↓            ↓            ↓
      Scenes       Objects      Effects
        │            │            │
        └──────── SceneCanvas ────┘
                     │
                     ↓
              Route-aware HIVE UX
```

---

## 51. Final Architectural Principle

HIVE should remain a **civic workflow application wrapped in a distinctive 3D experience**, not a 3D demo with a civic form attached.

The hierarchy is:

```text
Civic purpose
    ↓
Reliable workflow
    ↓
Secure data architecture
    ↓
Clear citizen/admin UX
    ↓
Meaningful 3D presentation
    ↓
Polish
```

The most important engineering rule is therefore:

> **Never sacrifice correctness, privacy, authorization, or usability merely to make the application look impressive.**

The most important product rule is:

> **Every visual and technical decision should help citizens understand, submit, follow, or support civic suggestions — or help administrators process them responsibly.**

---

## Document Status

**Status:** Canonical architecture/context document

**Repository:** `zaidansheikh180-gif/Hive-civic`

**Current project phase:** Functional prototype + architecture hardening

**Primary next milestone:** Implement the approved About → Citizen Auth → Main HIVE App flow while simultaneously hardening Supabase authorization and making PostgreSQL the authoritative source of truth.
