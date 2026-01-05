# Jizhang (记账)

A real-time web application for tracking transactions and settlements during multiplayer card games like mahjong and poker.

## Overview

Jizhang eliminates the hassle of manual scorekeeping during card games. Players can create or join game rooms, record transactions in real-time, and let the app calculate optimal settlements at the end of the session.

## Features

- **Room-based Gaming** - Create or join rooms with simple 4-digit codes
- **Real-time Sync** - All players see transaction updates instantly
- **Transaction Tracking** - Record payments between players organized by rounds
- **Smart Settlement** - Automatic calculation of optimal money transfers to settle all debts
- **Game History** - View past games with personal statistics (wins, losses, win rate, total profit/loss)
- **QR Code Sharing** - Easily invite others to join your room
- **Auto Countdown** - Configurable countdown timer between rounds
- **No Registration** - Jump right in with anonymous authentication

## Tech Stack

- **Framework**: Next.js 16 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL + Realtime + Auth)
- **QR Codes**: qrcode.react

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/jizhang.git
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

   Fill in your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Set up the database:

   Run the migration in `supabase/migrations/00001_init.sql` in your Supabase SQL editor.

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Home page
│   ├── history/           # Game history page
│   └── room/[code]/       # Dynamic room page
├── components/
│   ├── home/              # Home page components
│   ├── room/              # Room page components
│   └── ui/                # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and Supabase clients
├── types/                 # TypeScript type definitions
└── utils/                 # Helper functions
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## How It Works

1. **Create a Room** - Start a new game session and share the 4-digit code
2. **Invite Players** - Others join using the code or QR code
3. **Record Transactions** - Tap a player to record payments during the game
4. **Settle Up** - When done, the app calculates the minimum number of transfers needed to settle all balances

## License

MIT
