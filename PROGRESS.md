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

# 2. Recently Identified Problems

These are known issues that must be fixed before calling the project complete.

## Authentication

- [ ] Implement proper citizen registration
- [ ] Implement proper citizen sign-in
- [ ] Implement sign-out for citizens
- [ ] Implement forgot/reset password flow
- [ ] Protect the main citizen application so unauthenticated users cannot enter it directly
- [ ] Keep administrator authentication separate from citizen authentication
- [ ] Remove the current demo/fallback admin authentication behaviour

## First-Visit Experience

The desired user journey has changed from the original prototype.

Current concept:

`Website → Main Interface`

Desired concept:

`Website → About/Welcome → Citizen Sign In/Register → HIVE Interface`

Tasks:

- [ ] Make the About/Welcome page the first page for visitors
- [ ] Explain what HIVE is and why it exists
- [ ] Explain how HIVE works
- [ ] Add a clear "Enter HIVE" action
- [ ] Create citizen login page
- [ ] Create citizen registration page
- [ ] Redirect authenticated citizens into the main HIVE interface
- [ ] Redirect unauthenticated users back to the welcome/authentication flow when required

## About Page

- [ ] Complete the About/Welcome page
- [ ] Add project purpose
- [ ] Add problem statement
- [ ] Add how-it-works section
- [ ] Add project objectives
- [ ] Add community-focused explanation
- [ ] Add project/team information where appropriate
- [ ] Clearly state that HIVE is an academic prototype and not an official government portal
- [ ] Give the page the same 3D visual quality as the rest of the website

## Citizen Account Features

Because citizen accounts are now part of the desired experience:

- [ ] Connect citizen accounts to Supabase Auth
- [ ] Connect each citizen profile to their suggestions
- [ ] Add "My Suggestions"
- [ ] Allow citizens to view their own submissions
- [ ] Allow citizens to open their own suggestion details
- [ ] Preserve the ability to keep the citizen identity private from the public-facing suggestion information where required

---

# 3. Database and Security Fixes Required

## Supabase as the Source of Truth

- [ ] Remove the final dependency on localStorage for permanent suggestion data
- [ ] Stop using localStorage as a fallback for production data
- [ ] Make Supabase/PostgreSQL the authoritative source of suggestions and status history
- [ ] Keep localStorage only where it is genuinely useful for non-sensitive UI preferences, if needed

## Suggestion ID / History Issue

The current implementation generates a frontend suggestion ID while PostgreSQL also generates its own UUID.

Required fix:

`Create suggestion → receive database UUID → create status history using returned UUID`

- [ ] Fix suggestion creation so the database-generated ID is returned and reused
- [ ] Ensure status-history records always reference the real suggestion UUID
- [ ] Test the foreign-key relationship

## Row-Level Security

The current policies need to be tightened before deployment.

- [ ] Public users should only access information intended to be public
- [ ] Citizens should only access their own private account/submission data
- [ ] Administrators should have controlled access to administrative data
- [ ] Remove overly broad update permissions
- [ ] Ensure only authorized administrators can change suggestion status
- [ ] Ensure citizens cannot modify another citizen's suggestion
- [ ] Review every database policy after authentication is implemented

## Photo Storage

- [ ] Review the current temporary photo-upload process
- [ ] Associate uploaded photos with the correct suggestion
- [ ] Prevent orphaned uploads
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