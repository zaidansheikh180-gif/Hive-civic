# Hive - Digital Suggestion Box

Hive is a civic-issue reporting web app. Citizens can submit local issues and suggestions, receive a reference number, support other submissions, and follow status updates. Administrators review submissions and manage their progress through a separate dashboard.

This is an academic/community prototype, not an official government grievance portal. The repository includes demonstration records; they do not represent real municipal cases.

## Live app

[Open Hive](https://hive-civic.onrender.com)

APP url: https://hive-civic.onrender.com

## Folder structure

```text
Hive-civic/
├── src/
│   ├── App.tsx                 # Routes and shared application shell
│   ├── main.tsx                # React entry point
│   ├── index.css               # Global styles and theme
│   ├── components/             # Navigation, route guards, status UI, shared controls
│   │   └── ui/                 # Liquid-glass button and orb loader
│   ├── pages/                  # Citizen, authentication, and administrator pages
│   │   └── *.test.tsx          # Profile and admin-flow tests
│   ├── services/               # Authentication, suggestions, and photo uploads
│   ├── lib/                    # Supabase client configuration
│   ├── three/                  # React Three Fiber scene system
│   │   ├── cameras/            # Camera rig
│   │   ├── effects/            # Particle field
│   │   ├── objects/            # Civic and status visualizations
│   │   └── scenes/             # Route-specific scenes
│   ├── types/                  # Shared domain types
│   ├── types.ts                # Type re-export
│   ├── data.ts                 # Categories and demonstration data
│   └── vite-env.d.ts           # Client environment types
├── supabase/
│   ├── schema.sql              # Historical baseline schema and demo seed data
│   └── migrations/             # Security, profile, and photo-upload changes (001-005)
├── .env.example                # Environment-variable template
├── ARCHITECTURE.md             # Detailed architecture and contributor context
├── PROGRESS.md                 # Work history, checks, and remaining tasks
├── bun.lock                    # Dependency lockfile
├── index.html                  # HTML entry point
├── metadata.json               # App metadata
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
└── vite.config.ts              # Vite plugins and environment mapping
```

## Features

### Citizens

- Register and sign in with email and password through Supabase Auth.
- Submit a suggestion with a category, title, description, and location.
- Attach a JPG or PNG photo up to 5 MiB.
- Choose anonymous public presentation while retaining authenticated ownership.
- Receive a reference number in the form `DSB-YYYY-XXXXXX`.
- Browse the feed with search, category/status filters, and sorting.
- Add or remove support for a suggestion.
- View personal submissions, suggestion details, and status history.
- Track a suggestion using its reference number.
- Edit the profile display name and request a password-reset email.

### Administrators

- Sign in through a separate admin login with database-backed role checks.
- View dashboard counts by status and category.
- Review submissions and update statuses and administrative notes.
- View status history and edit their own display name.

### Interface

- Dark honey-colored theme with shared glass controls and orb loading states.
- Route-specific 3D scenes built with React Three Fiber.
- Smooth scrolling and motion effects, with reduced-motion styles.

### Suggestion lifecycle

```text
submitted → under_review → accepted → planned → implemented
```

`rejected` is an alternate outcome. The database records status changes in the suggestion history.

Categories cover roads and footpaths, street lighting, waste management, water and sanitation, public spaces, transport, education, environment, community facilities, and other issues.

## Tech stack

| Area | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite 6 |
| Styling | Tailwind CSS 4, custom CSS, Lucide icons |
| Routing | React Router |
| Forms | React Hook Form, Zod |
| Motion | Motion, GSAP, Lenis |
| 3D | Three.js, React Three Fiber, Drei |
| Backend | Supabase Auth, PostgreSQL, Storage, row-level security |
| Tests | Vitest, jsdom, React Testing Library |
| Dependencies | Bun with a committed `bun.lock` |
| Hosting | Render Static Site for the frontend |

The frontend calls Supabase through the service layer. It builds into static assets and does not require a separate Express server.

## Getting started

### Prerequisites

- Git.
- Bun. The repository lockfile was generated with Bun **1.3.14**, as recorded in `PROGRESS.md`.
- A Supabase project with the matching schema, migrations, and storage policies.

### 1. Clone the working branch

```bash
git clone --branch instinct https://github.com/zaidansheikh180-gif/Hive-civic.git
cd Hive-civic
bun install --frozen-lockfile
```

### 2. Set environment variables

Copy `.env.example` to `.env`. In Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

On macOS/Linux:

```bash
cp .env.example .env
```

Fill in these values from your Supabase project settings:

```dotenv
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-or-publishable-key
```

The current app uses these two variables. The template also includes `GEMINI_API_KEY` and `APP_URL` from the AI Studio template; the current application does not use them.

Vite embeds the Supabase URL and public key into the browser build. Use an anon/publishable key, **not a service-role or secret key**. Database policies must enforce access. Keep `.env` out of version control; `.gitignore` excludes it. Restart the dev server after changing local values, or rebuild after changing hosting variables.

### 3. Start development

```bash
bun run dev
```

Open `http://localhost:3000`. The dev script listens on port 3000 and binds to `0.0.0.0`.

## Supabase setup

The repository stores SQL files rather than a complete Supabase CLI project configuration.

For a **new development project**, review `supabase/schema.sql`, then apply it through the Supabase SQL Editor. Apply the migrations in numeric order:

1. `001_security_hardening.sql`
2. `002_security_function_privileges.sql`
3. `003_rls_performance_hardening.sql`
4. `004_profile_name_only.sql`
5. `005_suggestion_photo_limits.sql`

The baseline includes historical policies and demonstration data. **The baseline alone does not match the current client or security model.** Read the migration SQL and [architecture notes](ARCHITECTURE.md) before setting up a project. For an existing database, inspect its migration history and current policies instead of rerunning these files blindly. This README does not certify the state of a deployed database.

The current client expects:

- `profiles`, `suggestions`, `suggestion_status_history`, and `suggestion_supports` tables.
- `public_suggestions` and `public_suggestion_status_history` views for public-safe reads.
- Support RPCs (`add_support`, `remove_support`) and the `attach_suggestion_photo` RPC.
- A `suggestion-photos` storage bucket with owner-bound uploads, JPG/PNG limits, and a 5 MiB size ceiling.

New registrations receive the `citizen` role. A project administrator must assign the `admin` role in the database; the app does not offer self-service role changes. The hardened role model uses `citizen` and `admin`.

Configure Supabase Auth site/redirect URLs for your local and deployed origins. The password-reset request uses `/auth/login` on the current origin as its redirect. Verify the recovery flow against your project's Auth settings before relying on it.

Photos use a public bucket. Public photo paths include the uploader UUID. Anonymous submission hides public identity/contact presentation; it does not make photos or paths private. Avoid sensitive information in uploads.

## Scripts and checks

| Command | Purpose |
| --- | --- |
| `bun run dev` | Start the Vite development server on port 3000 |
| `bun run build` | Build production assets into `dist/` |
| `bun run preview` | Preview the production build locally |
| `bun run lint` | Run TypeScript checks with `tsc --noEmit` |
| `bun run clean` | Remove `dist` and `server.js` using `rm -rf` |

`lint` is a type check, not an ESLint run. The `clean` script needs a shell that supports `rm`, such as Git Bash or WSL on Windows.

The repository has Vitest tests but no `test` package script. Run them with:

```bash
bunx vitest run --environment jsdom
```

Build and preview:

```bash
bun run build
bun run preview
```

Unit tests do not replace testing sign-in, cross-account access, administrator actions, and photo upload policies against your Supabase project.

## Deploy to Render

Create a **Static Site** from this repository with these settings:

| Setting | Value |
| --- | --- |
| Branch | `instinct` |
| Root directory | Leave blank (repository root) |
| Build command | `bun install --frozen-lockfile && bun run build` |
| Publish directory | `dist` |
| Environment variables | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |

Set the environment variables before building. To match the lockfile's documented Bun version, set `BUN_VERSION` to `1.3.14`.

Add a Redirects/Rewrites rule so direct visits and refreshes on React Router paths return the application:

```text
Source: /*
Destination: /index.html
Action: Rewrite
```

Render hosts the frontend; Supabase hosts authentication, database data, and uploaded photos. Rebuild the static site after changing frontend environment variables.

## Main routes

| Route | Purpose |
| --- | --- |
| `/` | Welcome/about page |
| `/auth/login`, `/auth/register` | Citizen sign-in and registration |
| `/auth/forgot-password` | Password-reset email request |
| `/app` | Citizen feed |
| `/app/submit`, `/app/submitted` | Submission form and confirmation |
| `/app/track` | Reference-number tracking |
| `/app/suggestions`, `/app/suggestions/:id` | Personal submissions and details |
| `/app/profile` | Citizen profile |
| `/admin/login` | Administrator sign-in |
| `/admin` | Administrator dashboard |
| `/admin/suggestions`, `/admin/suggestions/:id` | Administrator submission management |
| `/admin/profile` | Administrator profile |

Citizen app routes require sign-in. Administrator routes also require the `admin` role. Legacy `/submit`, `/submitted`, and `/track` paths redirect to their `/app` equivalents.

## Documentation and contributions

Read [ARCHITECTURE.md](ARCHITECTURE.md) for the data model, service boundaries, authentication, storage, and 3D system. Read [PROGRESS.md](PROGRESS.md) for check history and open tasks. Some historical notes describe earlier deployment state; the source code and current service settings take precedence.

Keep changes on `instinct`. Do not change or merge into other branches without the owner's approval. Review existing patterns, keep private fields out of public reads, and run type checks, tests, and a build before proposing code changes. Database changes need separate review; do not apply SQL to a shared project as part of a frontend change.

For bugs, include the route, steps to reproduce, expected result, and any error message. Do not include credentials, personal information, or private submission data.

## Project status and limitations

Hive has a deployed frontend, but remains a prototype. A deployment is not a production-security sign-off. The architecture and progress documents track remaining database verification, end-to-end checks, performance work, and historical schema reconciliation. Keep demonstration records separate from real civic submissions.

## License

The repository does not include a `LICENSE` file. The UI footer mentions MIT, but contributors should confirm licensing with the owner rather than treat the footer as a license grant.
