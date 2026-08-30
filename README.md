# Wealthline

A personal financial operating system for tracking money, investments, net worth, and FIRE progress.

## Features

- Personal dashboard
- Expense tracking
- Income tracking
- Budget management
- Investment tracking
- Net worth tracking
- Financial goals
- FIRE projection
- Financial health score
- Financial insights
- Multi-device synchronization
- PWA installation
- Dark mode

> **Status:** The application shell, navigation, and all core screens (overview,
> transactions, budget, investments, net worth, goals, FIRE, reports, settings)
> are implemented and running on mock data. Supabase-backed auth, persistence,
> multi-device sync, and PWA installability are on the roadmap and not yet wired in.

## Tech Stack

- [Next.js](https://nextjs.org) (App Router) + React + TypeScript
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com) (built on Radix UI)
- [Geist](https://vercel.com/font) font
- [Lucide](https://lucide.dev) icons
- [Zustand](https://zustand-demo.pmnd.rs) for client state
- [Recharts](https://recharts.org) for charts
- [Supabase](https://supabase.com) (Postgres, Auth) — planned for persistence and multi-device sync
- Deployed on [Vercel](https://vercel.com)

## Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/suriyauxdesigner-code/Wealthline.git
   cd Wealthline
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy the example file and fill in your own values:

   ```bash
   cp .env.example .env.local
   ```

4. **Connect Supabase**

   Create a project at [supabase.com](https://supabase.com), then copy its
   Project URL and anon key into `.env.local` as `NEXT_PUBLIC_SUPABASE_URL`
   and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Database migrations live in
   `supabase/migrations` (added as the Supabase integration lands).

5. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

See [`.env.example`](./.env.example) for the full list. Required for Supabase integration:

| Variable | Exposed to browser | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous/public API key |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Server-only key for privileged operations; never expose this client-side |

Never commit `.env` or `.env.local` — they're excluded via `.gitignore`.

## Deployment

Wealthline is deployed on [Vercel](https://vercel.com):

1. Import the `suriyauxdesigner-code/Wealthline` GitHub repository into Vercel.
2. Set the same environment variables from `.env.example` in the Vercel
   project's **Settings → Environment Variables**.
3. Vercel builds and deploys automatically on every push to `main`.

```
Local Development → Git → GitHub → Vercel → Wealthline (PWA)
```

GitHub is the source of truth — all development happens through pull requests
and commits to this repository.
