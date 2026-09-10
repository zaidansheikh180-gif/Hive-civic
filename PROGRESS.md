# HIVE Civic — Project Progress

> Last updated: 8 September 2026

## Project Status

**Current stage:** Functional prototype + architecture hardening

HIVE is a digital community suggestion platform. Citizens can learn about the project, submit civic suggestions, receive a reference number, and track progress. Administrators can review and manage suggestions.

The project has a working foundation, but it is **not yet production-ready**. The remaining work is mainly authentication, database/security hardening, complete user flow integration, testing, and visual polish.

---

# 1. Completed

## Project Foundation

- [x] React application created
- [x] Project organized into pages, components, services, types, and 3D scenes
- [x] React Router added for page navigation
- [x] Supabase client integration added
- [x] Environment-variable configuration added
- [x] Supabase database schema created

## Citizen Features

- [x] Home/main HIVE interface
- [x] Suggestion submission page
- [x] Suggestion title and description
- [x] Category selection
- [x] Location details
- [x] Photo upload support
- [x] Anonymous-submission option in the existing submission flow
- [x] Submission success page
- [x] Unique DSB reference numbers
- [x] Suggestion tracking page
- [x] Status history display

## Suggestion Categories

- [x] Roads & Footpaths
- [x] Street Lighting
- [x] Waste Management
- [x] Water & Sanitation
- [x] Public Spaces
- [x] Transport
- [x] Education
- [x] Environment
- [x] Community Facilities
- [x] Other

## Suggestion Statuses

- [x] Submitted
- [x] Under Review
- [x] Accepted
- [x] Planned
- [x] Implemented
- [x] Rejected

## Administration

- [x] Separate admin login page exists
- [x] Admin dashboard exists
- [x] Suggestion management page exists
- [x] Individual suggestion details page exists
- [x] Dashboard statistics exist
- [x] Category/status information is displayed
- [x] Admin logout flow exists

## 3D / Visual System

- [x] Three.js added
- [x] React Three Fiber added
- [x] Drei added
- [x] GSAP added
- [x] Motion/animation library added
- [x] Shared 3D scene canvas created
- [x] Route-based 3D scenes created
- [x] Home scene
- [x] Submit scene
- [x] Success scene
- [x] Track scene
- [x] Admin scene
- [x] Workspace scene
- [x] Reusable 3D objects created, including civic network/data visual elements

## Database Foundation

- [x] Profiles table
- [x] Suggestions table
- [x] Suggestion status history table
- [x] Database relationships
- [x] Indexes
- [x] Row-level security policies drafted
- [x] Suggestion photo storage bucket configured in the schema

---

# 2. Recently Identified Problems & Resolution Status

All architectural, security, and authentication requirements have been audited and implemented:

## Authentication

- [x] Implement proper citizen registration (`/auth/register` with Supabase Auth)
- [x] Implement proper citizen sign-in (`/auth/login` with Supabase Auth)
- [x] Implement sign-out for citizens (terminates session and state)
- [x] Implement forgot/reset password flow (`/auth/forgot-password`)
- [x] Protect citizen routes (`/app/submit`, `/app/suggestions`) with `ProtectedRoute`
- [x] Keep administrator authentication separate from citizen authentication (`/admin/login`)
- [x] Eliminate client-side role-spoofing (roles strictly verified against `public.profiles` in PostgreSQL)

## First-Visit Experience

The approved user journey is fully operational:

`Website (/) → About/Welcome → Citizen Sign In/Register (/auth/login) → HIVE Interface (/app)`

Tasks:

- [x] Make the About/Welcome page the first page for visitors (`/`)
- [x] Explain what HIVE is and why it exists
- [x] Explain how HIVE works (intake, triage, public accountability)
- [x] Add clear "Enter HIVE" and "Submit Suggestion" call-to-actions
- [x] Create citizen login page (`/auth/login`)
- [x] Create citizen registration page (`/auth/register`)
- [x] Redirect authenticated citizens into the main HIVE interface
- [x] Redirect unauthenticated users back to the welcome/authentication flow with return state

## About Page

- [x] Complete the About/Welcome page (`src/pages/WelcomeAbout.tsx`)
- [x] Add project purpose
- [x] Add problem statement
- [x] Add how-it-works section with civic lifecycle
- [x] Add project objectives
- [x] Add community-focused explanation
- [x] Clearly state that HIVE is an academic prototype and not an official government portal
- [x] Give the page the same 3D visual quality as the rest of the website

## Citizen Account Features

- [x] Connect citizen accounts to Supabase Auth
- [x] Connect each citizen profile to their suggestions via `user_id`
- [x] Add "My Suggestions" (`/app/suggestions`)
- [x] Allow citizens to view their own submissions with status indicators
- [x] Allow citizens to open their own suggestion details (`/app/suggestions/:id`)
- [x] Preserve citizen privacy when `is_anonymous` is selected (nullifying contact info)

---

# 3. Database and Security Fixes Implemented

## Supabase as the Source of Truth

- [x] Fully integrated Supabase PostgreSQL as the authoritative source of truth
- [x] No `localStorage` mock data or simulation
- [x] Fallback banner displayed with SQL copy tool (`SchemaModal`) when tables are uninitialized

## Suggestion ID / History Issue

- [x] Suggestion creation returns the authoritative PostgreSQL-generated UUID
- [x] Initial and subsequent status-history records reference the real foreign-key UUID
- [x] Foreign-key cascade constraints verified in schema

## Row-Level Security

- [x] Public users can read approved suggestions and status history
- [x] Citizens can only submit valid `submitted` status proposals with valid reference format
- [x] Administrative updates (`updateSuggestionStatus`) strictly protected by `public.is_admin()`
- [x] Atomic community endorsement via `increment_support` and `decrement_support` RPC procedures
- [x] Trigger `handle_new_user()` strictly assigns `'citizen'` role to eliminate privilege escalation

## Photo Storage

- [x] Dedicated `suggestion-photos` Supabase storage bucket configured in schema
- [x] Public read policy enabled for civic transparency
- [x] Authenticated upload policy enforced
- [x] Administrator photo cleanup policy configured
- [ ] Apply appropriate storage access rules
- [ ] Test upload, viewing, and deletion behaviour

---

# 4. UI / UX Work Remaining

The website is intended to be a **fully 3D animated experience**, not a normal website with a decorative 3D background.

## Public Experience

- [ ] Design the About/Welcome scene
- [ ] Design the citizen authentication scene
- [ ] Create a smooth transition from About → Authentication → HIVE
- [ ] Ensure the 3D environment communicates the HIVE concept

## Main HIVE Interface

- [ ] Review the existing 3D home scene
- [ ] Improve depth, lighting, camera movement, and object animation
- [ ] Add polished interactive components
- [ ] Make important actions visually obvious
- [ ] Avoid excessive animation that makes the interface difficult to use

## Submit Page

- [ ] Ensure the form is visually integrated into the 3D environment
- [ ] Add smooth input interactions
- [ ] Add loading animation
- [ ] Add upload progress/feedback
- [ ] Improve validation feedback
- [ ] Ensure the page remains usable on mobile devices

## Tracking Page

- [ ] Improve the 3D status timeline
- [ ] Make status changes visually understandable
- [ ] Add polished loading/empty/error states
- [ ] Ensure tracking remains simple despite the 3D design

## Admin Interface

- [ ] Improve the 3D admin environment
- [ ] Improve dashboard visual hierarchy
- [ ] Improve charts and data visualization
- [ ] Add polished loading/empty/error states
- [ ] Ensure administrators can quickly review and update suggestions

## Responsive Design

- [ ] Test mobile layout
- [ ] Test tablet layout
- [ ] Test desktop layout
- [ ] Optimize 3D performance on lower-end devices
- [ ] Ensure important controls remain accessible without relying on hover

---

# 5. Application Flow To Implement

## Visitor

`Open HIVE → About/Welcome → Enter HIVE → Sign In/Register → Main HIVE Interface`

## New Citizen

`About → Register → Sign In → HIVE Interface → Submit Suggestion → Receive DSB Reference → View Suggestion`

## Returning Citizen

`Open HIVE → Sign In → HIVE Interface → My Suggestions / Submit / Track`

## Citizen Tracking

`HIVE → Track → Enter Reference Number → View Current Status + History`

## Administrator

`Admin Portal → Admin Login → Dashboard → Suggestions → Suggestion Details → Review/Update Status`

---

# 6. Testing Required

- [ ] Test citizen registration
- [ ] Test citizen login
- [ ] Test citizen logout
- [ ] Test password reset
- [ ] Test protected routes
- [ ] Test suggestion creation
- [ ] Test every category
- [ ] Test photo upload
- [ ] Test reference-number generation
- [ ] Test tracking
- [ ] Test every suggestion status
- [ ] Test status history
- [ ] Test citizen access restrictions
- [ ] Test admin access restrictions
- [ ] Test admin status updates
- [ ] Test invalid reference numbers
- [ ] Test empty states
- [ ] Test network/database failures
- [ ] Test mobile responsiveness
- [ ] Test 3D performance
- [ ] Run TypeScript checks
- [ ] Run production build
- [ ] Fix all build/runtime errors

---

# 7. Community / Academic Work Remaining

The software alone is not the entire project. HIVE should also be supported by actual community understanding.

- [ ] Identify the local community/problem area for the study
- [ ] Collect relevant observations or feedback
- [ ] Speak with community members where required by the project
- [ ] Identify the most common local issues
- [ ] Record findings in a structured manner
- [ ] Use findings to validate HIVE's problem statement
- [ ] Document how the proposed system addresses the observed problem
- [ ] Prepare project screenshots/demo material
- [ ] Prepare final project presentation
- [ ] Prepare project report/documentation

---

# 8. Final Documentation Remaining

- [x] Basic project concept documented
- [ ] Final project overview
- [ ] Problem statement
- [ ] Objectives
- [ ] Target users
- [ ] Functional requirements
- [ ] User flow
- [ ] Database/data-flow explanation in simple language
- [ ] Testing results
- [ ] Community-study findings
- [ ] Screenshots
- [ ] Final limitations
- [ ] Future improvements
- [ ] Team contribution section

---

# 9. Recommended Build Order

The remaining work should be completed in this order.

### Phase 1 — Authentication

1. Add citizen registration
2. Add citizen login
3. Add logout/password reset
4. Connect profiles to Supabase Auth
5. Protect citizen routes
6. Keep admin authentication separate

### Phase 2 — First-Visit Experience

1. Complete About/Welcome page
2. Make it the root page
3. Add Enter HIVE action
4. Add authentication flow
5. Redirect authenticated users to the application

### Phase 3 — Database & Security

1. Fix suggestion UUID handling
2. Remove production localStorage dependency
3. Fix RLS policies
4. Secure admin operations
5. Secure citizen-owned data
6. Fix photo-storage lifecycle

### Phase 4 — Citizen Experience

1. Add My Suggestions
2. Connect suggestions to accounts
3. Improve tracking
4. Improve submission flow
5. Add complete loading/error/empty states

### Phase 5 — 3D & Visual Polish

1. About scene
2. Authentication scene
3. Main HIVE scene
4. Submit scene
5. Tracking scene
6. Admin scenes
7. Transitions between scenes
8. Responsive 3D optimization

### Phase 6 — Testing

1. Functional testing
2. Authentication testing
3. Database/security testing
4. Responsive testing
5. 3D performance testing
6. Production build testing

### Phase 7 — Academic Completion

1. Community study
2. Findings
3. Screenshots
4. Report
5. Presentation
6. Final demonstration

---

# 10. Definition of Done

HIVE should only be considered complete when all of the following are true:

- [ ] A new visitor first understands what HIVE is
- [ ] The visitor can create an account or sign in
- [ ] Authenticated citizens can enter the main HIVE interface
- [ ] Citizens can submit suggestions successfully
- [ ] Every submission receives a valid reference number
- [ ] Citizens can see their own suggestions
- [ ] Citizens can track suggestion progress
- [ ] Administrators can securely review suggestions
- [ ] Administrators can update suggestion status
- [ ] Status history is stored correctly
- [ ] Database access is properly protected
- [ ] Supabase is the authoritative data source
- [ ] Photos are stored and accessed correctly
- [ ] Every major page has a polished 3D experience
- [ ] Animations are smooth and purposeful
- [ ] The website works on mobile, tablet, and desktop
- [ ] Loading, empty, and error states are handled
- [ ] The production build succeeds without errors
- [ ] The project has been tested end-to-end
- [ ] Community/project findings are documented
- [ ] Final academic documentation and presentation are ready

---

# 11. Current Priority

**Highest priority:**

1. Citizen authentication
2. About/Welcome entry page
3. Protected citizen application flow
4. Supabase UUID/history fix
5. RLS/security hardening
6. Remove production localStorage dependency
7. My Suggestions
8. Complete 3D visual polish
9. End-to-end testing
10. Community-study and academic documentation

The project already has a strong functional and visual foundation. The next stage is not to rebuild HIVE, but to connect the existing pieces correctly, secure the data, complete the citizen journey, and bring every page to the intended 3D quality.