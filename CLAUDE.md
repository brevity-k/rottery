# My Lotto Stats - AI-Powered Lottery Number Insights & Statistics

## Project Overview

My Lotto Stats is a free, SEO-optimized lottery information website that provides statistical analysis and number recommendations for US lotteries. Revenue model: Google AdSense (Phase 2+). Hybrid rendering: static pages + serverless API routes on Vercel.

**Live site:** https://mylottostats.com
**Live repo:** https://github.com/brevity-k/lottery
**Domain registrar:** Porkbun
**Hosting:** Vercel (auto-deploys on push)
**Google Analytics:** G-5TW1TM399X
**Google Search Console:** Verified + sitemap submitted
**Current page count:** 608 static pages + 1 serverless API route

---

## Architecture

```
[Build Time]  SODA API JSON files ──> Next.js SSG ──> Static HTML ──> Vercel CDN
[Runtime]     Client-side: number generator, tax calculator, chart interactions
[Runtime]     Serverless: /api/contact (Resend email)
[Daily Cron]  GitHub Action 1: fetches 5 lottery datasets ──> git push ──> Vercel rebuild
[Daily Cron]  GitHub Action 2: generates blog (triggered after data fetch) ──> git push ──> Vercel rebuild
[Daily Cron]  GitHub Action 3: posts latest blog to X/Twitter (triggered after blog generation)
[Weekly Cron] GitHub Action checks for new SODA datasets ──> creates GitHub Issue if found
[Quarterly]   GitHub Action auto-updates state tax rates via Claude API
```

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, hybrid: static + serverless) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| Charts | Recharts 3 |
| Email | Resend (contact form auto-reply) |
| Data source | NY Open Data SODA API (free, no key) — 5 games |
| Data storage | JSON files in `src/data/` |
| State tax data | TypeScript file in `src/data/state-tax-rates.ts` |
| Blog generation | Claude Haiku via Anthropic API (daily, automated, 14-topic rotation) |
| Social posting | twitter-api-v2 (daily auto-post to X after blog generation) |
| Hosting | Vercel free tier |
| DNS | Porkbun → Vercel (A: 76.76.21.21, CNAME: cname.vercel-dns.com) |

---

## Lottery Games Supported

| Game | Slug | Format | Bonus | Draw Schedule | SODA Dataset ID | Data Since |
|---|---|---|---|---|---|---|
| Powerball | `powerball` | 5/69 + 1/26 | Powerball | Mon, Wed, Sat 10:59 PM ET | `d6yy-54nr` | 2010 |
| Mega Millions | `mega-millions` | 5/70 + 1/24 | Mega Ball | Tue, Fri 11:00 PM ET | `5xaw-6ayf` | 2002 |
| Cash4Life | `cash4life` | 5/60 + 1/4 | Cash Ball | Daily 9:00 PM ET | `kwxv-fwze` | 2014 |
| NY Lotto | `ny-lotto` | 6/59 + 1/59 | Bonus | Wed, Sat 8:15 PM ET | `6nbc-h7bj` | 2001 |
| Take 5 | `take5` | 5/39 | None | Daily 2:30 PM & 10:30 PM ET | `dg63-4siq` | 2001 |

**Notes:**
- Take 5 has **no bonus number** (`bonusNumber.count === 0`). All UI, analysis, and recommendation code handles this.
- Take 5 has **two draws per day** (midday/evening). Data is stored with `drawTime: 'midday' | 'evening'`.
- Cash4Life is **retiring Feb 21, 2026**. Historical data remains valuable.
- **Millionaire for Life** launches Feb 22, 2026 replacing Cash4Life + Lucky for Life. SODA endpoint expected soon — the weekly `check-new-datasets.ts` script will auto-detect it.

**Known untracked draw games on SODA** (candidates for Phase 3):
- Daily Numbers / Win-4 — daily pick-3/pick-4 style games
- Quick Draw — keno-style game with frequent draws
- Pick 10 — pick-10 style game

---

## Project Structure

```
rottery/
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Root layout (Header + Footer + GA + Search Console)
│   │   ├── icon.svg                  # SVG favicon (slot machine with blue-purple gradient, matches 🎰 branding)
│   │   ├── apple-icon.png            # Apple touch icon (180x180 PNG, generated from icon.svg)
│   │   ├── page.tsx                  # Homepage: lottery grid + hero
│   │   ├── sitemap.ts               # Dynamic sitemap (lotteries + blog + states + tools)
│   │   ├── robots.ts                # robots.txt generator
│   │   ├── [lottery]/               # /powerball, /mega-millions, /cash4life, /ny-lotto, /take5
│   │   │   ├── page.tsx             # Lottery overview + latest results + FAQ
│   │   │   ├── numbers/page.tsx     # Recommendations + random generator + explore numbers
│   │   │   ├── numbers/[numberSlug]/page.tsx  # Per-number analysis (main-N, bonus-N) ~410 pages
│   │   │   ├── results/page.tsx     # Full results history
│   │   │   ├── results/[year]/      # Results by year (2001-2026)
│   │   │   └── statistics/page.tsx  # Frequency charts, hot/cold, overdue, pairs
│   │   ├── states/                  # State lottery hubs
│   │   │   ├── page.tsx             # States index (46 states)
│   │   │   └── [state]/page.tsx     # Individual state hub (tax, games, claims, FAQ)
│   │   ├── api/contact/route.ts     # Serverless: Resend email API
│   │   ├── contact/page.tsx         # Contact form page
│   │   ├── tools/
│   │   │   ├── tax-calculator/      # Federal + state tax calculator, lump sum vs annuity
│   │   │   ├── number-generator/    # Crypto-random number generator
│   │   │   ├── odds-calculator/     # Lottery odds breakdown
│   │   │   └── ticket-checker/      # Check numbers against past draws
│   │   ├── blog/                    # Blog index + article pages
│   │   │   └── [slug]/page.tsx
│   │   ├── about/page.tsx           # Required for AdSense
│   │   ├── privacy/page.tsx         # Required for AdSense
│   │   ├── terms/page.tsx           # Required for AdSense
│   │   └── disclaimer/page.tsx      # Required for AdSense
│   ├── components/
│   │   ├── layout/    Header (Lotteries/Tools dropdowns + States), Footer, Breadcrumbs
│   │   ├── lottery/   LotteryCard, LotteryBall, ResultsTable (handles no-bonus + drawTime)
│   │   ├── numbers/   NumberGenerator (handles no-bonus), HotColdChart, RecommendedNumbers
│   │   ├── tools/     TaxCalculator, TicketChecker (client components)
│   │   ├── contact/   ContactForm (client component)
│   │   ├── ads/       AdUnit (placeholder, renders when ADSENSE_CLIENT_ID set)
│   │   ├── seo/       JsonLd, FAQSection
│   │   └── ui/        Button, Card, Tabs
│   ├── lib/
│   │   ├── lotteries/ config.ts (5 lottery definitions), types.ts (supports optional bonus, drawsPerDay, drawTime)
│   │   ├── states/    config.ts (46 state configs with tax, games, claims, facts)
│   │   ├── data/      fetcher.ts (SODA API + JSON loader), parser.ts (handles all game formats)
│   │   ├── analysis/  frequency, hotCold, overdue, gaps, pairs, triplets, quadruplets, recommendations (handles no-bonus)
│   │   ├── seo/       metadata.ts, structuredData.ts (JSON-LD schemas, game-specific FAQs), faqContent.ts (FAQ generators for all pages)
│   │   ├── blog.ts    Static blog post content + getters
│   │   └── utils/     formatters.ts, constants.ts
│   └── data/
│       ├── powerball.json           # ~1,904 draws (2010 to present)
│       ├── mega-millions.json       # ~2,478 draws (2002 to present)
│       ├── cash4life.json           # ~2,948 draws (2014 to present)
│       ├── ny-lotto.json            # ~2,550 draws (2001 to present)
│       ├── take5.json               # ~12,194 draws (2001 to present, 2x/day)
│       └── state-tax-rates.ts       # All 50 states + DC tax data (auto-updated quarterly)
├── scripts/
│   ├── lib/
│   │   ├── retry.ts                 # Shared retry utility with exponential backoff
│   │   └── constants.ts             # Shared constants (CLAUDE_MODEL, build thresholds, seasonal/special topics, SEO keywords)
│   ├── update-data.ts               # SODA API fetcher for all 5 games + validation + stale detection
│   ├── generate-blog-post.ts        # Claude-powered daily blog (14-topic rotation, 5 games, retirement-aware)
│   ├── check-new-datasets.ts        # Auto-detect new SODA lottery datasets (weekly, with retry)
│   ├── update-tax-rates.ts          # Auto-update state tax rates via Claude API (quarterly)
│   ├── validate-build.ts            # Post-build validation (draw counts, page count, blog integrity)
│   ├── seo-health-check.ts          # Weekly SEO check (page count, data freshness, blog quality)
│   ├── cleanup-stale-issues.ts      # Auto-close resolved automation-failure GitHub Issues
│   ├── post-to-x.ts                 # Post latest blog to X/Twitter (daily, automated)
│   ├── onboard-new-game.ts          # Semi-automated new lottery game onboarding via Claude API
│   ├── generate-state-configs.ts    # Generate/update state hub configs via Claude API (quarterly)
│   ├── generate-methodology.ts      # One-time methodology page content generation
│   └── sync-claude-md.ts            # Sync CLAUDE.md stats (page count, draw counts) after builds
├── .github/workflows/
│   ├── fetch-lottery-data.yml       # Daily cron at 6 AM UTC (data fetch + stale check)
│   ├── generate-blog.yml            # Triggered after data fetch (blog generation)
│   ├── post-to-x.yml               # Triggered after blog generation (X/Twitter posting)
│   └── weekly-maintenance.yml       # Weekly: new datasets check, quarterly: tax rate update
├── content/blog/                    # Auto-generated daily blog posts (JSON)
├── .posted-to-x                     # Tracks blog slugs already posted to X (committed, auto-updated)
├── public/
│   └── ads.txt                      # AdSense placeholder
└── .env.local                       # RESEND_API_KEY (not committed)
```

---

## Commands

```bash
# Development
npm run dev                    # Start dev server (http://localhost:3000)
npm run build                  # Build for production (~608 pages)
npm run start                  # Serve production build

# Data updates (daily automation)
npx tsx scripts/update-data.ts              # Fetch all 5 games from SODA API + validate
npx tsx scripts/generate-blog-post.ts       # Generate daily blog post (needs ANTHROPIC_API_KEY)
npx tsx scripts/post-to-x.ts               # Post latest blog to X (needs X API keys)

# Monitoring (weekly automation)
npx tsx scripts/check-new-datasets.ts       # Check for new SODA lottery datasets
npx tsx scripts/cleanup-stale-issues.ts     # Auto-close resolved GitHub Issues

# Quarterly automation
npx tsx scripts/update-tax-rates.ts         # Update state tax rates via Claude (needs ANTHROPIC_API_KEY)
npx tsx scripts/generate-state-configs.ts   # Refresh state hub configs via Claude (needs ANTHROPIC_API_KEY)

# Build validation
npx tsx scripts/validate-build.ts           # Post-build checks (draw counts, page count, blog integrity)
npx tsx scripts/seo-health-check.ts         # SEO audit (page count, data freshness, blog quality)

# One-time / semi-automated
npx tsx scripts/onboard-new-game.ts <id>    # Onboard new lottery game from SODA dataset ID
npx tsx scripts/generate-methodology.ts     # Generate methodology page content
npx tsx scripts/sync-claude-md.ts           # Sync CLAUDE.md stats after build

# Lint
npm run lint                   # ESLint check
```

---

## Environment Variables

| Variable | Required | Where Set | Description |
|---|---|---|---|
| `RESEND_API_KEY` | Yes | Vercel + `.env.local` | Resend API key for contact form emails |
| `ANTHROPIC_API_KEY` | No | GitHub Secrets | For auto blog generation + tax rate updates |
| `CONTACT_EMAIL` | No | Vercel | Contact form recipient (default: rottery0.kr@gmail.com) |
| `X_CONSUMER_KEY` | No | GitHub Secrets + `.env.local` | X API consumer key (OAuth 1.0a) |
| `X_SECRET_KEY` | No | GitHub Secrets + `.env.local` | X API consumer secret |
| `X_API_ACCESS_TOKEN` | No | GitHub Secrets + `.env.local` | X API access token |
| `X_API_ACCESS_TOKEN_SECRET` | No | GitHub Secrets + `.env.local` | X API access token secret |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | No (Phase 2) | Vercel | Google AdSense publisher ID |
| `GITHUB_TOKEN` | Auto | GitHub Actions | Used by check-new-datasets.ts to create issues |

---

## Automation & Self-Sufficiency

The site is designed to run itself with minimal manual intervention.

### Daily Automation — Fetch Lottery Data (6 AM UTC, `fetch-lottery-data.yml`)
1. Fetch all 5 lottery datasets from SODA API (with retry: 3 attempts, exponential backoff)
2. Validate data: range checks, schedule validation, duplicate detection, record count guard
3. Check for stale data: per-game staleness thresholds (PB/MM: 4 days, C4L/T5: 3 days, NYL: 5 days)
4. Build verification before commit (`npm run build && validate-build.ts`)
5. Sync CLAUDE.md stats (page count, draw counts)
6. Auto-commit data + push → Vercel auto-deploys
7. On stale data: writes `.stale-warning` marker → workflow creates GitHub Issue

### Daily Automation — Generate Blog (after data fetch, `generate-blog.yml`)
1. Triggered automatically after Fetch Lottery Data workflow completes
2. Generate blog post via Claude Haiku (14-topic rotation covering active games + tax/state topics, with retry)
   - Retired games (e.g., Cash4Life after 2026-02-21) are automatically excluded from analysis
   - TOPICS and TARGET_KEYWORDS arrays validated at startup for length parity
3. Build verification before commit (`npm run build && validate-build.ts`)
4. Sync CLAUDE.md stats (page count, draw counts)
5. Auto-commit blog + push → Vercel auto-deploys

### Daily Automation — Post to X (after blog generation, `post-to-x.yml`)
1. Triggered automatically after Generate Blog Post workflow completes
2. Reads the most recent blog post JSON from `content/blog/` (sorted by date suffix)
3. Checks `.posted-to-x` tracker file — skips if slug already posted (prevents duplicates)
4. Crafts tweet: emoji + title + description + URL + hashtags (≤280 chars)
5. Posts via X API v2 (OAuth 1.0a, with retry)
6. Appends slug to `.posted-to-x` and commits the tracker file
7. Logs tweet URL on success

### Weekly Automation (Monday 8 AM UTC)
- Scan `data.ny.gov` SODA catalog for new lottery-related datasets (12 search terms, with retry)
- Compare against known dataset IDs (5 games) + `IGNORED_DATASET_IDS` (reviewed non-game datasets)
- Strict relevance filter: only flags datasets with "winning numbers" in the name (all NY draw game datasets follow this SODA naming convention) or watched game names (e.g., "millionaire for life")
- To suppress a false positive permanently, add its dataset ID to `IGNORED_DATASET_IDS` in `scripts/lib/constants.ts`
- Auto-create GitHub Issue if new datasets found (e.g., Millionaire for Life)
- Auto-close resolved automation-failure Issues (`cleanup-stale-issues.ts`)
- Dependency security audit (`npm audit --audit-level=high`)
- SEO health check (page count, data freshness, blog quality)
- On failure: auto-creates GitHub Issue with `automation-failure` label

### Quarterly Automation (Jan, Apr, Jul, Oct — first 7 days)
- Use Claude API to verify/update state tax rates against current data (with retry)
- Sanity bounds: reject rates > 15% or changes > 3 percentage points (catches hallucinations)
- Line-based file editing (safer than regex)
- Refresh state hub configs via Claude API (`generate-state-configs.ts`)
- Build verification before commit (`npm run build && validate-build.ts`)
- Auto-commit changes if rates have changed
- On failure: auto-creates GitHub Issue with `automation-failure` label
- Also runs on `workflow_dispatch` (manual trigger) regardless of date

### Data Validation (in `update-data.ts`)
- **Range validation:** Every number checked against game's max values
- **Schedule validation:** Draw dates verified against expected days of week
- **Duplicate detection:** Flags duplicate draw dates
- **Record count guard:** Never overwrites if new data has fewer records (prevents data loss)
- **Stale data detection:** Per-game staleness thresholds; writes `.stale-warning` marker file (gitignored)
- **Retired game handling:** Games with `retiredDate` (e.g., Cash4Life 2026-02-21) skip stale checks after retirement
- **Anomaly warnings:** Logged to console, included in CI output

### Retry Logic (in `scripts/lib/retry.ts`)
All external API calls use `withRetry()` with exponential backoff:
- **SODA API fetches:** 3 attempts, 2s base delay
- **Claude API calls:** 2 attempts, 3s base delay
- **SODA catalog searches:** 2 attempts, 1s base delay
- **GitHub API calls:** 2 attempts, 2s base delay (issue search, create, comment, workflow runs)
- **X API calls:** 2 attempts, 2s base delay

### Failure Notifications
All GitHub Actions workflows create Issues on failure:
- **Label:** `automation-failure` — used for deduplication (comment on existing open issue instead of creating duplicates)
- **Stale data:** Separate `[Auto] Stale lottery data detected` issue with warning details
- **Blog failures:** `[Auto] generate-blog failed` — separate workflow, easy to identify
- **Workflow failures:** `[Auto] fetch-lottery-data failed`, `[Auto] generate-blog failed`, `[Auto] post-to-x failed`, `[Auto] check-new-datasets failed`, `[Auto] quarterly-tax-update failed`, `[Auto] quarterly-state-refresh failed`
- **SEO failures:** `[Auto] SEO health check failed` (label: `seo-health`)
- **Security:** `[Auto] npm security vulnerabilities detected`
- **Auto-close:** `cleanup-stale-issues.ts` closes issues when corresponding workflow succeeds

### Self-Corrective Behaviors
- Build verification before any automated commit (broken builds don't get pushed)
- New game detection auto-creates actionable GitHub Issues
- Tax rates auto-verified quarterly with sanity bounds (rejects hallucinated rates)
- Blog topics cycle through 14 variations to prevent repetition
- Blog generation skips retired games automatically (e.g., Cash4Life after Feb 21, 2026)
- Stale data detection alerts before data goes too stale
- Retry logic prevents transient API failures from breaking the pipeline
- All failure notifications are deduplicated to prevent issue spam
- X posting tracks posted slugs in `.posted-to-x` to prevent duplicate tweets

---

## Competitive Landscape

### Top Competitors (by US traffic)

| Rank | Site | Monthly Visits | Key Differentiator |
|---|---|---|---|
| 1 | lotterypost.com | ~14.2M | Community forums (7.7M+ posts) |
| 2 | lotteryusa.com | ~5M+ | 240+ games, est. 1995, state coverage |
| 3 | lottonumbers.com | Moderate | Deep statistical analysis, 52% search traffic |
| 4 | usamega.com | Moderate | Best-in-class tax/payout calculator |
| 5 | lotteryvalley.com | Growing | AI predictions, 300+ games, 9 tools |
| 6 | lottostrategies.com | Moderate | 21 analysis algorithms |

### Feature Gap Analysis

| Feature | Competitors | My Lotto Stats | Priority |
|---|---|---|---|
| Multi-state game results | 240+ games | 5 games | DONE (Phase 2) |
| State lottery hubs (50 states) | All majors have it | 46 states | DONE (Phase 2) |
| Tax/payout calculator | USAMega, LotteryUSA, Powerball.net | All 50 states + DC | DONE (Phase 2) |
| Ticket/number checker | LotteryUSA, Powerball.net, LotteryValley | All 5 games | DONE (Phase 2) |
| Per-number analysis pages | Powerball.net, LottoNumbers | ~410 pages, all 5 games | DONE (Phase 2) |
| Triplet/quadruplet analysis | LottoNumbers, Powerball.net | All 5 games | DONE (Phase 2) |
| Pick 3/4 daily games | LotteryUSA, LottoStrategies, LotteryCorner | None | MEDIUM |
| Community/forums | LotteryPost, LotteryUSA | None | LOW |
| Scratch-off analysis | LotteryValley | None | LOW |

### Our Competitive Advantages

1. **Zero operating cost** — static pages, free APIs, free hosting
2. **Modern tech stack** — Next.js 16, Tailwind v4, clean responsive UI
3. **AI-powered analysis branding** — unique positioning vs. competitors
4. **Multi-strategy recommendation engine** — most competitors lack this
5. **Automated daily blog generation** — builds content and SEO authority automatically (14 topics, 5 games)
6. **Full SEO infrastructure** — JSON-LD, sitemap, robots, per-page metadata
7. **Self-sufficient automation** — daily data, weekly monitoring, quarterly tax updates, all zero-touch
8. **Tax calculator** — covers all 50 states + DC with local taxes (NYC, Yonkers, Baltimore)
9. **State hubs** — 46 state pages with game availability, tax info, claim procedures

---

## SEO Strategy

### Target Keywords (by priority)

**Tier 1 — Statistical analysis (our sweet spot, lower competition):**
- "most common powerball numbers"
- "powerball number frequency"
- "hot and cold lottery numbers"
- "overdue powerball numbers"
- "mega millions statistics"
- "powerball number pairs"
- "cash4life winning numbers"
- "ny lotto results"
- "take 5 winning numbers"

**Tier 2 — Tool-based traffic (NEW — high-intent):**
- "lottery tax calculator by state"
- "powerball after tax calculator"
- "mega millions lump sum calculator"
- "lottery winnings tax by state"
- "powerball number generator"
- "lottery probability calculator"

**Tier 3 — State-specific (NEW — long tail):**
- "california lottery tax rate"
- "new york lottery tax calculator"
- "florida lottery no tax"
- "texas lottery winnings tax"
- "lottery tax rate [state]"

**Tier 4 — Educational/guide content:**
- "how to pick powerball numbers statistically"
- "powerball vs mega millions which is better"
- "lump sum vs annuity lottery"
- "how does power play work"

### SEO Best Practices

- **Intent-first title tags:** "Powerball Results Today [Date] | Winning Numbers & Statistics" (not brand-first)
- **Featured snippet optimization:** Answer queries in 40-60 words directly after H2 headings
- **Table snippets:** Clean HTML tables for odds, prize charts (Google pulls these)
- **FAQ schema:** FAQPage JSON-LD on every game overview page and state hub page
- **Internal linking:** Every results page links to statistics, numbers, and blog posts
- **Content freshness:** Results updated daily via GitHub Actions; timestamp displayed on pages

### E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)

This site falls under **YMYL (Your Money Your Life)** — Google applies higher standards:

- **Experience:** Show real calculations, methodology transparency, interactive tools (tax calculator)
- **Expertise:** Cite data sources, mathematical rigor, never claim "prediction"
- **Authoritativeness:** Comprehensive coverage (5 games, 46 states), regular publishing, linkable data visualizations
- **Trustworthiness:** Legal pages, disclaimers, "verify with official lottery" language, responsible gambling messaging (helpline in footer)

---

## Data Validation & Credibility

### Current Data Sources

NY Open Data SODA API (government source):

| Game | API Endpoint | Dataset ID |
|---|---|---|
| Powerball | `data.ny.gov/resource/d6yy-54nr.json` | `d6yy-54nr` |
| Mega Millions | `data.ny.gov/resource/5xaw-6ayf.json` | `5xaw-6ayf` |
| Cash4Life | `data.ny.gov/resource/kwxv-fwze.json` | `kwxv-fwze` |
| NY Lotto | `data.ny.gov/resource/6nbc-h7bj.json` | `6nbc-h7bj` |
| Take 5 | `data.ny.gov/resource/dg63-4siq.json` | `dg63-4siq` |

### Automated Validation Rules (in `scripts/update-data.ts`)

**Structural validation:**
- Number ranges match game config (e.g., 1-69 main, 1-26 bonus for Powerball)
- Draw dates align with expected schedule per game
- No duplicate draw dates (or draw date + drawTime for Take 5)
- Record count never decreases between updates (prevents data loss)

**Known historical anomalies (expected warnings):**
- Powerball bonus range was 1-35 before Oct 2015, changed to 1-26 (old draws trigger range warnings)
- Mega Millions bonus range was 1-25 before April 2025, changed to 1-24
- These are historical format changes, not data errors

### Required Disclaimers

Every results page and analysis page must include:
1. **Unofficial status:** "This website is not affiliated with or endorsed by Powerball, Mega Millions, MUSL, or any state lottery commission"
2. **Official numbers control:** "In the event of a discrepancy, official winning numbers as certified by the Multi-State Lottery Association shall control"
3. **Verification directive:** "Always verify results with your official state lottery"
4. **Entertainment only:** All analysis is for informational and entertainment purposes
5. **No prediction claims:** Statistical analysis examines historical patterns but does not predict future outcomes
6. **Data source attribution:** "Results sourced from NY Open Data (data.ny.gov)"
7. **Responsible gambling:** National Council on Problem Gambling helpline: 1-800-522-4700 (in footer)

### Format Change Monitoring

Lottery game formats change every 3-8 years. The April 2025 Mega Millions overhaul is a recent example ($2→$5, bonus range 25→24, Megaplier retired).

**Monitoring approach:**
- Automated range anomaly detection in update script
- Weekly `check-new-datasets.ts` scans SODA catalog for new games
- Google Alerts for "Powerball rule change" and "Mega Millions rule change"
- Quarterly manual fact-check against official lottery websites
- Document all verified facts in this file (see Verified Information section below)

---

## Phase Roadmap (Updated February 2026)

### Phase 1: Core MVP (COMPLETE)
- [x] Next.js 16 + TypeScript + Tailwind CSS
- [x] Powerball & Mega Millions data from SODA API
- [x] Analysis engine (frequency, hot/cold, overdue, gaps, pairs)
- [x] Recommendation engine (3 strategies)
- [x] 74 static pages + 1 serverless API route
- [x] 8 seed blog posts + daily auto-generated posts
- [x] SEO (sitemap, robots, JSON-LD, metadata)
- [x] GitHub Actions daily data update + blog generation
- [x] Legal pages (About, Privacy, Terms, Disclaimer)
- [x] Contact form with Resend auto-reply email
- [x] Google Analytics (G-5TW1TM399X)
- [x] Google Search Console verified + sitemap submitted
- [x] Custom domain (mylottostats.com via Porkbun)
- [x] Vercel deployment with auto-deploy on push

### Phase 2 Priority 1: High-Impact Expansion (COMPLETE — 173 pages)
- [x] **Tax/payout calculator** — all 50 states + DC, lump sum vs annuity, local taxes (NYC/Yonkers/Baltimore)
- [x] **3 additional games** — Cash4Life, NY Lotto, Take 5 (each with overview, numbers, results, statistics, year archives)
- [x] **Top 10 state lottery hubs** — CA, TX, FL, NY, PA, OH, IL, MI, GA, NC (expanded to 46 states in Phase 2 Priority 2)
- [x] **No-bonus game support** — Take 5 (bonusNumber.count === 0) handled across all layers
- [x] **Midday/evening draw support** — Take 5's twice-daily draws with drawTime field
- [x] **Data validation** — range, schedule, duplicate, record count guards in update script
- [x] **Enhanced blog generator** — 14-topic rotation, all 5 games, tax/state topics
- [x] **Auto-detect new SODA datasets** — weekly GitHub Actions + auto-creates Issues
- [x] **Auto-update tax rates** — quarterly via Claude API
- [x] **Responsible gambling** — helpline in footer, NCPG link
- [x] **Navigation overhaul** — Lotteries dropdown, Tools dropdown (Tax Calculator first), States link

### Phase 2 Priority 2: SEO Authority Building (COMPLETE — 585 pages)
- [x] **Per-number analysis pages** — ~410 individual pages (main-N, bonus-N) with frequency, hot/cold, gap analysis, common pairings, recent appearances
- [x] **Ticket/number checker tool** — user enters numbers + draw date, checks against historical data (last 365 days)
- [x] **Triplet & quadruplet analysis** — expanded pair analysis to triplets (top 15) and quadruplets (top 10) on statistics pages
- [x] **FAQ sections on all pages** — structured FAQPage JSON-LD schema + collapsible FAQ sections on 13+ page types

### Phase 2 Priority 3: Content Depth
- [ ] **20+ manual quality blog posts** targeting long-tail keywords
- [ ] **Jackpot tracker/history page** — current + historical jackpots with progression charts
- [ ] **Enhanced disclaimer page** — full unofficial status, discrepancy clause, data source attribution
- [ ] **Methodology page** — explain how statistical analyses are calculated (E-E-A-T signal)

### Phase 2 Priority 4: SEO Optimization
- [ ] **Intent-first title tags** on all pages
- [ ] **"Last updated" timestamps** displayed on all results/statistics pages
- [ ] **"Verify with official lottery" links** on every results table
- [ ] **Increase internal linking** between results, statistics, and blog posts
- [ ] Apply for Google AdSense (after 2-4 weeks of organic traffic)

### Phase 3: Full Coverage & Monetization (Target: 1000+ pages)
- [ ] All 45 state hubs + state-specific game pages
- [ ] Pick 3/Pick 4/daily game coverage (daily draws = massive page multiplication)
- [ ] Millionaire for Life (replacing Cash4Life, launching Feb 22, 2026)
- [ ] AdSense integration
- [ ] Monthly archive pages (in addition to yearly)
- [ ] "Share your numbers" social feature
- [ ] Enhanced analysis (streaks, patterns, bell curve visualization)
- [ ] Email newsletter / jackpot alerts

### Phase 4: Growth Optimization
- [ ] A/B test ad placements
- [ ] PWA features (push notifications for draw results)
- [ ] Faster data updates (post-draw triggers, not just daily cron)
- [ ] Multi-language support (Spanish)
- [ ] Embeddable widgets for other sites (with attribution links)
- [ ] Migrate to Mediavine at 50K sessions/mo
- [ ] Consider freemium membership model

---

## Daily Data Update Flow

Two separate GitHub Actions workflows run daily:

### Workflow 1: Fetch Lottery Data (`fetch-lottery-data.yml`, 6 AM UTC)
1. Checkout repo → Install dependencies
2. Fetch all 5 lottery datasets from SODA API with validation (retry on failure)
3. Check for stale data → write `.stale-warning` if any game exceeds threshold
4. If stale data detected → create/update GitHub Issue
5. If data changed: verify build succeeds → commit data + push → Vercel auto-deploys
6. On failure → create/update GitHub Issue with `automation-failure` label

### Workflow 2: Generate Blog (`generate-blog.yml`, triggered after Workflow 1)
1. Triggered automatically when Fetch Lottery Data workflow completes
2. Generate daily blog post via Claude Haiku (14-topic rotation, all 5 games, retry on failure)
3. If blog changed: verify build succeeds → commit blog + push → Vercel auto-deploys
4. On failure → create/update GitHub Issue with `automation-failure` label

**Cost: $0** (GitHub Actions free for public repos, Vercel rebuilds free, SODA API free)

### Draw Schedule

| Day | What's Fetched | Games With New Draws |
|---|---|---|
| Mon 6AM UTC | Cash4Life, Take 5 (2x) | Cash4Life (Sun 9 PM), Take 5 (Sun midday + evening) |
| Tue 6AM UTC | Powerball, Cash4Life, Take 5 (2x) | Powerball (Mon 10:59 PM), Cash4Life (Mon 9 PM), Take 5 |
| Wed 6AM UTC | Mega Millions, Cash4Life, Take 5 (2x) | Mega Millions (Tue 11 PM), Cash4Life, Take 5 |
| Thu 6AM UTC | Powerball, NY Lotto, Cash4Life, Take 5 (2x) | Powerball (Wed 10:59 PM), NY Lotto (Wed 8:15 PM), Cash4Life, Take 5 |
| Fri 6AM UTC | Cash4Life, Take 5 (2x) | Cash4Life (Thu 9 PM), Take 5 |
| Sat 6AM UTC | Mega Millions, Cash4Life, Take 5 (2x) | Mega Millions (Fri 11 PM), Cash4Life, Take 5 |
| Sun 6AM UTC | Powerball, NY Lotto, Cash4Life, Take 5 (2x) | Powerball (Sat 10:59 PM), NY Lotto (Sat 8:15 PM), Cash4Life, Take 5 |

---

## State Lottery Hubs

46 state hub pages at `/states/[state]`:

| State | Slug | Tax Rate | Games | Notes |
|---|---|---|---|---|
| California | `california` | 0% | PB, MM | No state tax on lottery winnings |
| Texas | `texas` | 0% | PB, MM | No state income tax |
| Florida | `florida` | 0% | PB, MM, C4L | No state income tax |
| New York | `new-york` | 10.9% | PB, MM, C4L, NYL, T5 | Highest state tax; NYC adds 3.876%, Yonkers 1.959% |
| Pennsylvania | `pennsylvania` | 3.07% | PB, MM, C4L | Low flat rate |
| Ohio | `ohio` | 4.0% | PB, MM | — |
| Illinois | `illinois` | 4.95% | PB, MM | Flat rate |
| Michigan | `michigan` | 4.25% | PB, MM, C4L | — |
| Georgia | `georgia` | 5.49% | PB, MM, C4L | Funds HOPE Scholarship |
| North Carolina | `north-carolina` | 4.5% | PB, MM | — |

---

## Tax Calculator

- **Page:** `/tools/tax-calculator`
- **Component:** `src/components/tools/TaxCalculator.tsx` (client component)
- **Data:** `src/data/state-tax-rates.ts` (all 50 states + DC, auto-updated quarterly)
- **Features:**
  - Jackpot amount input with quick-pick buttons ($10M, $100M, $500M, $1B)
  - State selector (all 50 states + DC)
  - Lump sum vs annuity toggle
  - Local tax support (NYC 3.876%, Yonkers 1.959%, Baltimore 3.2%)
  - Detailed breakdown: federal withholding (24%) + additional to 37% + state + local
  - Side-by-side lump sum vs annuity comparison table
- **Federal rates:** 24% withholding, 37% top marginal, ~50% lump sum factor

---

## Contact Form

- **API route:** `src/app/api/contact/route.ts` (serverless on Vercel)
- **Email service:** Resend (`RESEND_API_KEY` in Vercel env vars + `.env.local`)
- **From address:** `My Lotto Stats <onboarding@resend.dev>`
- **Owner email:** `rottery0.kr@gmail.com`
- **Flow:** User submits form → owner gets notification email → sender gets auto-reply confirmation
- **Env var:** `RESEND_API_KEY` must be set in Vercel project settings for production

---

## AdSense Setup

### Prerequisites Before Applying
- Live website with original, quality content (173+ pages — exceeds threshold)
- Legal pages present: About, Privacy, Terms, Disclaimer
- Informational only — no ticket sales or gambling promotion
- 500+ words on key pages (blog posts meet this)
- Site should be 1-3 months old with some organic traffic
- **Wait 2-4 weeks** after launch for Google to index and traffic to build

### After Approval
1. Set `NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX` in Vercel
2. Add AdSense script to `src/app/layout.tsx` `<head>`
3. Add `<AdUnit slot="..." />` components to pages
4. Update `public/ads.txt` with publisher ID
5. Redeploy

### Compliance Rules
- Position as **lottery information & statistics** — never transactional
- Never link to ticket purchase sites
- Use "statistical analysis," "frequency trends," "insights" — never "prediction," "guaranteed," or "winning strategy"
- Keep disclaimer on every recommendation page

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

#### Cash4Life — VERIFIED
| Fact | Status | Sources |
|---|---|---|
| Format: 5/60 + 1/4 | CORRECT | nylottery.ny.gov |
| Draw: Daily 9:00 PM ET | CORRECT | nylottery.ny.gov |
| Ticket price: $2 | CORRECT | nylottery.ny.gov |
| Top prize: $1,000/day for life | CORRECT | nylottery.ny.gov |
| Jackpot odds: 1 in 21,846,048 | CORRECT | nylottery.ny.gov |
| Retiring: Feb 21, 2026 | CORRECT | Official announcement |

#### NY Lotto — VERIFIED
| Fact | Status | Sources |
|---|---|---|
| Format: 6/59 + 1/59 bonus | CORRECT | nylottery.ny.gov |
| Draw: Wed, Sat 8:15 PM ET | CORRECT | nylottery.ny.gov |
| Ticket price: $1 | CORRECT | nylottery.ny.gov |
| Jackpot odds: ~1 in 45,057,474 | CORRECT | nylottery.ny.gov |

#### Take 5 — VERIFIED
| Fact | Status | Sources |
|---|---|---|
| Format: 5/39, no bonus | CORRECT | nylottery.ny.gov |
| Draw: Daily, midday 2:30 PM + evening 10:30 PM ET | CORRECT | nylottery.ny.gov |
| Ticket price: $1 | CORRECT | nylottery.ny.gov |
| Top prize odds: 1 in 575,757 | CORRECT | nylottery.ny.gov |

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

**Next scheduled fact-check:** May 2026 (quarterly)

---

## Key Design Decisions

1. **Hybrid rendering** — Static pages for all content + serverless `/api/contact` for email. Enables free Vercel hosting with maximum CDN performance
2. **JSON data files** — No database needed; data updated via git commits from GitHub Actions
3. **Client-side number generator** — Uses `crypto.getRandomValues()` for true randomness, zero server load
4. **Client-side tax calculator** — All calculations in browser, zero server load, instant results
5. **Blog as TypeScript module + auto-generated JSON** — `src/lib/blog.ts` for seed posts, `content/blog/` for daily auto-generated posts
6. **AdSense-ready but not active** — All legal pages present, `AdUnit` component renders only when env var is set
7. **"AI-Powered" branding** — Refers to the statistical analysis algorithms; legitimate and distinctive positioning
8. **Resend for email** — Free tier sufficient for contact form volume; auto-reply builds trust
9. **Porkbun for domain** — Consistent pricing, no renewal markup, free WHOIS privacy
10. **No-bonus game abstraction** — `bonusNumber.count === 0` pattern used throughout config, parser, analysis, and UI to cleanly support Take 5 without special-casing
11. **Midday/evening draw support** — `drawTime` field on DrawResult allows Take 5's twice-daily draws without schema changes
12. **State tax as TypeScript file** — Allows auto-updates via Claude API while keeping type safety; imported directly by components
13. **Self-sufficient automation** — Daily data + blog, weekly dataset monitoring, quarterly tax updates — all zero-touch after initial setup
14. **Shared retry utility** — `scripts/lib/retry.ts` provides exponential backoff for all API calls; centralized so behavior is consistent
15. **Centralized automation constants** — `scripts/lib/constants.ts` exports `CLAUDE_MODEL`, `MIN_DRAWS`, `MIN_PAGES`, `LOTTERY_DATA_FILES`, etc. so thresholds and config only need one change
16. **Failure notifications via GitHub Issues** — All workflows create/comment on issues with `automation-failure` label; deduplication prevents spam
17. **Stale data detection** — Per-game staleness thresholds with `.stale-warning` marker file; retired games (e.g., Cash4Life) are automatically excluded
18. **Tax rate sanity bounds** — Rejects Claude-suggested rates > 15% or changes > 3pp to guard against hallucinations; line-based file editing replaces brittle regex
19. **SVG favicon + Apple touch icon** — `src/app/icon.svg` slot machine with blue-purple gradient (matches 🎰 header branding); `src/app/apple-icon.png` 180x180 PNG for iOS; Next.js auto-serves both via file convention
