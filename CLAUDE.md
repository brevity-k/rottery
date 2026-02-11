# Rottery - AI-Powered Lottery Number Insights & Statistics

## Project Overview

Rottery is a free, SEO-optimized, statically-generated lottery information website that provides statistical analysis and number recommendations for US lotteries. Revenue model: Google AdSense (Phase 2+). No database, no backend, no serverless functions at runtime.

**Live repo:** https://github.com/brevity-k/rottery

---

## Architecture

```
[Build Time]  SODA API JSON files ──> Next.js SSG ──> Static HTML ──> Vercel CDN
[Runtime]     Client-side only: number generator, chart interactions
[Daily Cron]  GitHub Action fetches latest data ──> git push ──> Vercel rebuild
```

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, `output: 'export'`) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| Charts | Recharts 3 |
| Data source | NY Open Data SODA API (free, no key) |
| Data storage | JSON files in `src/data/` |
| Hosting target | Vercel free tier (static export) |

---

## Project Structure

```
rottery/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── layout.tsx                # Root layout (Header + Footer)
│   │   ├── page.tsx                  # Homepage: lottery grid + hero
│   │   ├── sitemap.ts               # Dynamic sitemap (24 URLs)
│   │   ├── robots.ts                # robots.txt generator
│   │   ├── [lottery]/               # /powerball, /mega-millions
│   │   │   ├── page.tsx             # Lottery overview + latest results + FAQ
│   │   │   ├── numbers/page.tsx     # Recommendations + random generator
│   │   │   ├── results/page.tsx     # Full results history
│   │   │   ├── results/[year]/      # Results by year (2002-2026)
│   │   │   └── statistics/page.tsx  # Frequency charts, hot/cold, overdue, pairs
│   │   ├── tools/
│   │   │   ├── number-generator/    # Crypto-random number generator
│   │   │   └── odds-calculator/     # Lottery odds breakdown
│   │   ├── blog/                    # Blog index + 8 article pages
│   │   │   └── [slug]/page.tsx
│   │   ├── about/page.tsx           # Required for AdSense
│   │   ├── privacy/page.tsx         # Required for AdSense
│   │   ├── terms/page.tsx           # Required for AdSense
│   │   └── disclaimer/page.tsx      # Required for AdSense
│   ├── components/
│   │   ├── layout/    Header, Footer, Breadcrumbs
│   │   ├── lottery/   LotteryCard, LotteryBall, ResultsTable, JackpotDisplay
│   │   ├── numbers/   NumberGenerator, HotColdChart, RecommendedNumbers
│   │   ├── ads/       AdUnit (placeholder, renders when ADSENSE_CLIENT_ID set)
│   │   ├── seo/       JsonLd
│   │   └── ui/        Button, Card, Tabs
│   ├── lib/
│   │   ├── lotteries/ config.ts (lottery definitions), types.ts
│   │   ├── data/      fetcher.ts (SODA API + JSON loader), parser.ts
│   │   ├── analysis/  frequency, hotCold, overdue, gaps, pairs, recommendations
│   │   ├── seo/       metadata.ts, structuredData.ts (JSON-LD schemas)
│   │   ├── blog.ts    Static blog post content + getters
│   │   └── utils/     formatters.ts, constants.ts
│   └── data/
│       ├── powerball.json           # 1,900 draws (2010-02-03 to present)
│       └── mega-millions.json       # 2,474 draws (2002-05-17 to present)
├── scripts/
│   └── update-data.ts               # SODA API fetcher (run via `npx tsx`)
├── .github/workflows/
│   └── update-lottery-data.yml      # Daily cron at 5 AM UTC
├── public/
│   └── ads.txt                      # AdSense placeholder
└── content/blog/                    # Reserved for future MDX posts
```

---

## What Was Built (Phase 1 MVP)

### Pages: 68 static HTML pages

| Route | Count | Description |
|---|---|---|
| `/` | 1 | Homepage with hero + lottery grid |
| `/[lottery]` | 2 | Powerball & Mega Millions overview |
| `/[lottery]/numbers` | 2 | AI-powered number recommendations |
| `/[lottery]/results` | 2 | Full results history |
| `/[lottery]/results/[year]` | 42 | Year-by-year archives (2002-2026) |
| `/[lottery]/statistics` | 2 | Frequency, hot/cold, overdue, pairs |
| `/tools/*` | 2 | Number generator, odds calculator |
| `/blog` + `/blog/[slug]` | 9 | Blog index + 8 articles |
| Legal pages | 4 | About, Privacy, Terms, Disclaimer |
| SEO files | 2 | sitemap.xml, robots.txt |

### Analysis Engine

All analysis runs at build time on historical draw data:

1. **Frequency Analysis** (`lib/analysis/frequency.ts`) - Count per number, percentage, last drawn, draws since last drawn
2. **Hot/Cold Scoring** (`lib/analysis/hotCold.ts`) - Weighted: recent (last 20) 3x, medium (last 100) 2x, all-time 1x
3. **Overdue Detection** (`lib/analysis/overdue.ts`) - Compares current gap to expected interval, calculates overdue ratio
4. **Gap Analysis** (`lib/analysis/gaps.ts`) - Min/max/avg gaps between appearances per number
5. **Pair Frequency** (`lib/analysis/pairs.ts`) - Most frequently co-occurring number pairs
6. **Recommendations** (`lib/analysis/recommendations.ts`) - Combines all signals with strategy weights

### Recommendation Strategies

| Strategy | Freq | Hot | Overdue | Pairs | Description |
|---|---|---|---|---|---|
| Balanced | 0.30 | 0.30 | 0.25 | 0.15 | Well-rounded blend |
| Trending | 0.20 | 0.50 | 0.15 | 0.15 | Favors recent momentum |
| Contrarian | 0.15 | 0.10 | 0.60 | 0.15 | Targets overdue numbers |

### Data Sources

| Lottery | SODA API Endpoint | Draws | Date Range |
|---|---|---|---|
| Powerball | `data.ny.gov/resource/d6yy-54nr.json` | 1,900 | 2010-02-03 to present |
| Mega Millions | `data.ny.gov/resource/5xaw-6ayf.json` | 2,474 | 2002-05-17 to present |

### SEO

- Unique `<title>` and `<meta description>` per page via `generateMetadata`
- JSON-LD: WebSite, BreadcrumbList, FAQPage, Article, SoftwareApplication
- Breadcrumb navigation on all inner pages
- Clean URL structure: `/powerball/numbers`, `/mega-millions/statistics`
- sitemap.xml with 24 URLs and priority/changefreq
- robots.txt allowing all crawlers

### Blog Articles (8 posts)

1. How Powerball Works: Complete Guide
2. Powerball Odds Explained
3. Mega Millions vs Powerball Comparison
4. What Are Hot and Cold Numbers?
5. How to Pick Lottery Numbers: Statistical Approach
6. Biggest Lottery Jackpots in US History
7. How Mega Millions Works: Complete Guide
8. Understanding Number Frequency

---

## Commands

```bash
# Development
npm run dev                    # Start dev server (http://localhost:3000)
npm run build                  # Build static export to out/
npm run start                  # Serve production build

# Data updates
npx tsx scripts/update-data.ts # Fetch latest draws from SODA API

# Lint
npm run lint                   # ESLint check
```

---

## Daily Data Update Flow

The GitHub Actions workflow (`.github/workflows/update-lottery-data.yml`) runs daily at 5 AM UTC:

1. Checkout repo
2. Install dependencies (`npm ci`)
3. Run `npx tsx scripts/update-data.ts` (fetches from SODA API)
4. Check if `src/data/` files changed
5. If changed: commit + push → triggers Vercel rebuild
6. All static pages regenerated with fresh data

**Cost: $0** (GitHub Actions free for public repos, Vercel rebuilds free)

---

## Deployment Plan

### Step 1: Connect to Vercel

1. Go to https://vercel.com and sign in with GitHub
2. Click "Add New Project" → Import `brevity-k/rottery`
3. Framework preset: **Next.js** (auto-detected)
4. Build command: `npm run build` (default)
5. Output directory: `out` (auto-detected from `output: 'export'`)
6. Click Deploy

### Step 2: Custom Domain (Optional)

1. In Vercel project settings → Domains
2. Add `rottery.com` (or your domain)
3. Update DNS records as instructed by Vercel
4. SSL is automatic

### Step 3: Google Search Console

1. Go to https://search.google.com/search-console
2. Add property → URL prefix → enter your domain
3. Verify via HTML file or DNS record
4. Submit sitemap: `https://yourdomain.com/sitemap.xml`

### Step 4: Enable GitHub Actions

1. In GitHub repo → Settings → Actions → General
2. Ensure "Allow all actions" is enabled
3. The daily cron will auto-run, or trigger manually from Actions tab

### Step 5: AdSense Application (Phase 2 — after 50+ quality pages)

See "AdSense Setup" section below.

---

## AdSense Setup (What the User Must Provide)

### Prerequisites Before Applying

Google AdSense requires:
- A live website with **original, quality content** (50+ pages recommended)
- Required legal pages: **About, Privacy Policy, Terms of Service, Disclaimer** (all included)
- Site must be **informational only** — no ticket sales or gambling promotion (compliant)
- Content must have **500+ words per page** on key pages (blog posts meet this)
- Site should be **at least 1-3 months old** with some organic traffic

### Application Process

1. Go to https://www.google.com/adsense/
2. Sign in with a Google account
3. Enter your site URL
4. Google reviews the site (typically 1-14 days)

### After Approval — What to Configure

The user must provide these values to enable ads:

| Item | Where to Set | Description |
|---|---|---|
| **AdSense Publisher ID** | `NEXT_PUBLIC_ADSENSE_CLIENT_ID` env var | Format: `ca-pub-XXXXXXXXXXXXXXXX`. Set in Vercel project settings → Environment Variables |
| **Ad Slot IDs** | Pass to `<AdUnit slot="..." />` in page components | Create ad units in AdSense dashboard, get slot IDs |
| **ads.txt content** | `public/ads.txt` | Replace placeholder with: `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0` |
| **AdSense script** | Add to `src/app/layout.tsx` `<head>` | `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>` |

### How to Enable Ads in Code

1. Set the environment variable in Vercel:
   ```
   NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
   ```

2. Add the AdSense script to `src/app/layout.tsx`:
   ```tsx
   <head>
     <script
       async
       src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
       crossOrigin="anonymous"
     />
   </head>
   ```

3. Add `<AdUnit>` components to pages where ads should appear:
   ```tsx
   import AdUnit from '@/components/ads/AdUnit';
   // In the page JSX:
   <AdUnit slot="1234567890" format="rectangle" />
   ```

4. Update `public/ads.txt` with your publisher ID

5. Redeploy

### Recommended Ad Placements (3-4 per page)

| Position | Desktop Format | Mobile Format |
|---|---|---|
| Sidebar | 300x250 + 300x600 (sticky) | N/A |
| In-content | 728x90 leaderboard | 320x100 banner |
| Below results | 300x250 rectangle | 300x250 rectangle |
| Bottom | 728x90 leaderboard | Anchor ad (auto) |

### AdSense Compliance Rules

- Position as **lottery information & statistics** — never transactional
- Never link to ticket purchase sites
- Use "statistical analysis," "frequency trends," "insights" — never "prediction," "guaranteed," or "winning strategy"
- Keep disclaimer on every recommendation page (already implemented)
- Never sell tickets or facilitate gambling

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | No (Phase 2) | Google AdSense publisher ID |
| `NEXT_PUBLIC_ANALYTICS_ID` | No | Google Analytics measurement ID |

---

## Phase Roadmap

### Phase 1: Core MVP (COMPLETE)
- [x] Next.js 15 + TypeScript + Tailwind CSS
- [x] Powerball & Mega Millions data from SODA API
- [x] Analysis engine (frequency, hot/cold, overdue, gaps, pairs)
- [x] Recommendation engine (3 strategies)
- [x] 68 static pages
- [x] 8 blog posts
- [x] SEO (sitemap, robots, JSON-LD, metadata)
- [x] GitHub Actions daily data update
- [x] Legal pages (About, Privacy, Terms, Disclaimer)

### Phase 2: Content Expansion (Target: 200+ pages)
- [ ] Add Lucky for Life, Cash4Life, Lotto America
- [ ] Add top 10 state lottery hubs
- [ ] Tools improvements (interactive odds calculator)
- [ ] 20 more blog posts
- [ ] FAQ sections on all lottery pages
- [ ] Apply for Google AdSense

### Phase 3: Full Coverage & Monetization (Target: 500+ pages)
- [ ] All 45 state hubs + games
- [ ] AdSense integration
- [ ] "Share your numbers" social feature
- [ ] Enhanced analysis (streaks, patterns)
- [ ] 20 more blog posts

### Phase 4: Growth Optimization
- [ ] A/B test ad placements
- [ ] PWA features (push notifications)
- [ ] Migrate to Mediavine at 50K sessions/mo

---

## Automatic Data Update Plan

### How It Works

The site updates itself automatically with zero manual intervention:

```
[Draw happens ~11 PM ET] → [SODA API updates ~1-3 hours later]
→ [GitHub Actions cron at 6 AM UTC / 1 AM ET] → [Fetches latest data]
→ [Commits to repo if changed] → [Vercel auto-deploys on push]
→ [All static pages rebuilt with fresh data]
```

### Schedule

| Day | What's Fetched | Draw That Occurred |
|---|---|---|
| Mon 6AM UTC | Nothing new (no Sun draw) | — |
| Tue 6AM UTC | Powerball Mon draw | Powerball (Mon 10:59 PM ET) |
| Wed 6AM UTC | Mega Millions Tue draw | Mega Millions (Tue 11 PM ET) |
| Thu 6AM UTC | Powerball Wed draw | Powerball (Wed 10:59 PM ET) |
| Fri 6AM UTC | Nothing new (no Thu draw) | — |
| Sat 6AM UTC | Mega Millions Fri draw | Mega Millions (Fri 11 PM ET) |
| Sun 6AM UTC | Powerball Sat draw | Powerball (Sat 10:59 PM ET) |

The cron runs daily to ensure no draws are missed. On days without draws, the script detects no changes and skips the commit.

### Update Pipeline

1. **GitHub Actions** (`.github/workflows/update-lottery-data.yml`) triggers daily at 6 AM UTC
2. **Data fetch** (`scripts/update-data.ts`) calls SODA API for Powerball + Mega Millions
3. **Change detection** — `git diff` checks if `src/data/` files actually changed
4. **Build verification** — runs `npm run build` to ensure no broken pages
5. **Commit + push** — only if data changed and build succeeds
6. **Vercel auto-deploy** — Vercel watches the repo and rebuilds on any push

### Cost

- GitHub Actions: **$0** (free for public repos, ~2 min/run)
- Vercel rebuilds: **$0** (free tier, 150K builds/mo)
- SODA API: **$0** (free, no key required)

### Manual Trigger

To update data manually at any time:
```bash
# Locally
npx tsx scripts/update-data.ts
npm run build

# Or via GitHub Actions UI
# Go to repo → Actions → "Update Lottery Data" → Run workflow
```

### What Gets Rebuilt

When new data is committed, Vercel rebuilds ALL static pages:
- Homepage (shows latest draw results)
- Lottery overview pages (latest results table)
- Numbers pages (recommendations recalculated from all historical data)
- Statistics pages (frequency, hot/cold, overdue all updated)
- Results pages (new draws appear in history)
- Year archive pages (new year pages auto-generated via `generateStaticParams`)

---

## Verified Information Accuracy

### Fact-Check Report (February 2026)

Verified against 3+ independent sources: official lottery websites (powerball.com, megamillions.com), state lottery commissions (CA, MD, WI, PA), Wikipedia, PBS, CNBC, US News, and ABC/CBS news outlets.

#### Powerball — All facts CORRECT
| Fact | Status | Sources |
|---|---|---|
| Format: 5/69 + 1/26 | CORRECT | powerball.com, Wikipedia, state lottery sites |
| Draw days: Mon, Wed, Sat | CORRECT | powerball.com |
| Draw time: 10:59 PM ET | CORRECT | powerball.com |
| Ticket price: $2 | CORRECT | powerball.com |
| Jackpot odds: 1 in 292,201,338 | CORRECT | powerball.com/powerball-prize-chart |
| Overall odds: ~1 in 24.87 | CORRECT | powerball.com |
| 9 prize tiers ($4 to Jackpot) | CORRECT | powerball.com/powerball-prize-chart |
| Power Play: 2x-10x, 10x only when ≤$150M | CORRECT | powerball.com |

#### Mega Millions — UPDATED (April 2025 overhaul)
| Fact | Status | Detail |
|---|---|---|
| Format: 5/70 + 1/24 | UPDATED | Was 1-25, changed to 1-24 in April 2025 |
| Draw days: Tue, Fri | CORRECT | megamillions.com |
| Draw time: 11:00 PM ET | CORRECT | megamillions.com |
| Ticket price: $5 | UPDATED | Was $2, changed to $5 in April 2025 |
| Jackpot odds: 1 in 290,472,336 | UPDATED | Was 1 in 302,575,350, improved in April 2025 |
| Megaplier: retired | UPDATED | Replaced by automatic 2x-10x multiplier on every ticket |
| Starting jackpot: $50M | NEW | Up from $20M |

#### Biggest Jackpots — UPDATED
| Rank | Amount | Game | Date | Location | Status |
|---|---|---|---|---|---|
| 1 | $2.04B | Powerball | Nov 2022 | CA | CORRECT |
| 2 | $1.817B | Powerball | Dec 2025 | AR | ADDED (new) |
| 3 | $1.787B | Powerball | Sept 2025 | MO, TX | ADDED (new) |
| 4 | $1.765B | Powerball | Oct 2023 | CA | CORRECT |
| 5 | $1.602B | Mega Millions | Aug 2023 | FL | CORRECT |
| 6 | $1.586B | Powerball | Jan 2016 | CA, FL, TN | CORRECT |
| 7 | $1.537B | Mega Millions | Oct 2018 | SC | CORRECT |

All corrections have been applied to the codebase (`src/lib/lotteries/config.ts`, `src/lib/blog.ts`).

---

## Key Design Decisions

1. **Static export** (`output: 'export'`) — Enables free Vercel hosting, maximum CDN performance, zero serverless costs
2. **JSON data files** — No database needed; data updated via git commits from GitHub Actions
3. **Client-side number generator** — Uses `crypto.getRandomValues()` for true randomness, zero server load
4. **Blog as TypeScript module** — `src/lib/blog.ts` stores posts as objects; simpler than MDX for Phase 1, easy to migrate later
5. **AdSense-ready but not active** — All legal pages present, `AdUnit` component renders only when env var is set
6. **"AI-Powered" branding** — Refers to the statistical analysis algorithms, not LLM usage; legitimate and no ongoing cost
