# Aereale87 Dashboard

A role-based dashboard starter built with Next.js 16, React 19, TypeScript, and Tailwind CSS.

This project currently includes:

- An auth flow UI with `Sign In`, `Forgot Password`, `Verify OTP`, and `New Password` screens
- An `Author Dashboard` overview scaffold
- An `Admin Dashboard` overview scaffold
- A `src/`-based App Router structure with shared UI components

## Tech Stack

- Next.js 16.2.10
- React 19.2.4
- TypeScript
- Tailwind CSS v4
- Lucide React
- Base UI
- TanStack Query

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## App Routes

### Auth

- `/` - Sign in
- `/forgot-password` - Forgot password
- `/verify-otp` - OTP verification
- `/new-password` - Reset password

### Dashboards

- `/author-dashboard` - Author overview page
- `/admin-dashboard` - Admin overview page

## Project Structure

```text
src/
├── app/
│   ├── (auth)/
│   ├── (author)/
│   ├── (admin)/
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── auth/
│   ├── dashboard/
│   ├── shared/
│   └── ui/
├── lib/
├── providers/
└── features/
    ├── author-dashboard/
    └── admin-dashboard/
```

## Key Folders

- `src/app` contains the App Router pages, layouts, and route groups.
- `src/components/auth` contains the reusable auth screen UI.
- `src/components/dashboard` contains the dashboard shell, sidebar, topbar, and stats UI.
- `src/features` contains feature-scoped dashboard overview code.
- `src/lib` contains utility helpers like class merging.

## Notes

- This project uses the `src/` folder convention with the App Router.
- Public assets stay in the root `public/` folder.
- Import aliases use `@/*` mapped to `src/*`.
- The dashboard data is currently mock data prepared for future API integration.

## Verification

The project has been verified with:

```bash
npm run build
npm run lint
```

## Known Warning

Next.js currently shows a non-blocking warning about multiple `package-lock.json` files when building. It does not stop the app from compiling, but you may want to clean that up later or set the Turbopack root explicitly in `next.config.ts`.
