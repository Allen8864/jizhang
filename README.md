# Jizhang (记账)

Jizhang is a clean, real-time web app for tracking payments, rounds, balances, and final settlements during mahjong, poker, board games, or any small-group score-based game.

It was originally built for a simple situation: playing mahjong with friends without physical chips. Existing mini programs had ads, cluttered UI, weak round tracking, manual settlement math, and noticeable network delay. It was also a good excuse to try real-time data modeling and sync design in a small, practical product. Jizhang keeps the experience lightweight: no ads, no account registration, a simple mobile-first UI, real-time sync, and automatic settlement calculation.

This is a personal project built around the way I play 4-player mahjong with friends, but the room and settlement model also works for 2-8 players across other scoring or money-tracking games.

## Features

- **No registration** - Users are signed in anonymously with Supabase Auth.
- **2-8 player rooms** - Built from a private 4-player mahjong scenario, but flexible enough for other small-group games.
- **4-digit room codes** - Create a room and invite friends with a short code or QR code.
- **Real-time sync** - Room members see player, transaction, round, and countdown updates live.
- **Round-aware tracking** - Transactions are grouped by round so the game history stays readable.
- **Automatic settlement** - Calculates balances and the minimum transfers needed to settle the room.
- **Game history** - Saves settlement snapshots with personal stats such as win rate and total profit/loss.
- **Countdown timer** - Optional round countdown for faster game flow.
- **Pull to refresh** - Mobile-friendly refresh when network state is uncertain.
- **Auto cleanup** - Inactive rooms are cleaned up automatically after 3+ hours.
- **Ad-free UI** - Built as a focused web app instead of an ad-supported mini program.

## Use Case

Jizhang is useful when a group needs to track who paid whom during a game, without carrying chips or calculating settlement manually.

Typical flow:

1. One player creates a room.
2. Other players join with the 4-digit code or QR code.
3. During each round, tap a player and record the amount paid.
4. Move to the next round when needed.
5. At the end, open settlement and let the app calculate who should transfer money to whom.
6. Confirm settlement to save history and close the room.

Although it started from a private mahjong scenario, the same flow works for poker, card games, board games, dinner/game-night shared scoring, or any small 2-8 person session where balances need to be tracked.

## Tech Stack

- **Framework**: Next.js 16 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL, Realtime, Auth)
- **Hosting**: Vercel
- **QR Codes**: qrcode.react

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A Supabase project

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Allen8864/jizhang.git
   cd jizhang
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Fill in your Supabase project credentials:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   NEXT_PUBLIC_SITE_URL=https://jizhang.s-yc.com
   ```

4. Enable anonymous auth in Supabase:

   - Open your Supabase project dashboard.
   - Go to **Authentication** -> **Sign In / Providers**.
   - Enable **Anonymous Sign-Ins**.

5. Set up the database:

   Run these SQL files in the Supabase SQL editor, in order:

   - `supabase/migrations/00001_init.sql`
   - `supabase/migrations/00002_cleanup_expired_rooms.sql`
   - `supabase/migrations/00003_keep_alive.sql`

6. Start the development server:

   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000).

## Deployment and Scheduled Jobs

### Vercel

1. Push the repository to GitHub.
2. Import the GitHub repository into Vercel.
3. Add the same environment variables in Vercel:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   NEXT_PUBLIC_SITE_URL=https://jizhang.s-yc.com
   ```

4. Deploy.

### GitHub Actions

Scheduled jobs are handled by GitHub Actions instead of Vercel Cron.

Add these repository secrets in GitHub:

| Secret | Purpose |
| --- | --- |
| `APP_URL` | The deployed app URL, for example `https://jizhang.example.com` or the Vercel production URL |
| `SUPABASE_URL` | Supabase project URL, for example `https://your-project-id.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key used only by GitHub Actions |

SEO metadata, canonical URLs, Open Graph images, and the sitemap use `NEXT_PUBLIC_SITE_URL`.
Set it to the production domain, for example `https://jizhang.s-yc.com`.

Workflows:

- `.github/workflows/cleanup-expired-rooms.yml` calls `APP_URL/api/cleanup` every day at 17:00 UTC.
- `.github/workflows/keep-supabase-alive.yml` queries the dedicated `keep_alive` table every 3 days at 06:00 UTC.

The service role key is intentionally kept in GitHub Secrets and is not needed in `.env.local` or Vercel environment variables.

## Auto Cleanup

Expired rooms are handled differently depending on whether the room has transactions:

- Rooms with transactions: settlement history is saved before the room is deleted.
- Rooms without transactions: the room is deleted directly.

The cleanup endpoint is intentionally public because it only calls the database cleanup function. If you fork this project and add more sensitive maintenance tasks, protect the endpoint with a secret token or move the job to a trusted worker.

## Supabase Keep Alive

Supabase free projects can be paused after inactivity. The `00003_keep_alive.sql` migration creates a tiny `keep_alive` table with one row, and GitHub Actions periodically reads it through Supabase REST:

```bash
curl -fsS "$SUPABASE_URL/rest/v1/keep_alive?select=id&limit=1" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
```

The table has RLS enabled and no public read policy. The workflow uses the service role key so the keep-alive request does not require anonymous access and does not touch business tables.

## Project Structure

```text
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── page.tsx            # Home page
│   ├── history/            # Game history page
│   ├── room/[code]/        # Dynamic room page
│   └── api/cleanup/        # Cleanup API for GitHub Actions
├── components/
│   ├── home/               # Home page components
│   ├── room/               # Room page components
│   └── ui/                 # Reusable UI components
├── hooks/                  # React hooks for auth, room state, and history
├── lib/                    # Supabase clients and settlement utilities
└── types/                  # TypeScript type definitions
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Build the production app |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

## Notes

- Users can only be in one active room at a time.
- Room codes are 4-digit numeric codes.
- Amounts are stored as cents in the database.
- Settlement history is saved when a room is settled manually or cleaned up after inactivity.
- Scheduled jobs run on GitHub Actions, not Vercel Cron.
- The app is mobile-first, but also works in desktop browsers.

## License

MIT
