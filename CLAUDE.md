# My Lotto Stats - AI-Powered Lottery Number Insights & Statistics

## Developer Identity Policy

**STRICT:** Never disclose the developer's real name, personal email, or any GitHub accounts other than `brevity-k` in any code, commits, comments, PRs, issues, documentation, or AI-generated content. The only public identity for this project is `brevity-k`.

## Project Overview

Free, SEO-optimized lottery statistics website for US lotteries. Hybrid rendering: static SSG pages + serverless API on Vercel. Revenue model: Google AdSense.

- **Live site:** https://mylottostats.com
- **Repo:** https://github.com/brevity-k/lottery
- **Hosting:** Vercel (auto-deploys on push) | **DNS:** Porkbun
- **Analytics:** GA G-5TW1TM399X | **Search Console:** Verified
- **Pages:** ~700+ static + 1 serverless API route

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, SSG + serverless) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| Charts | Recharts 3 |
| Email | Resend (contact form) |
| Data source | NY Open Data SODA API (free, no key) — 6 games |
| Data storage | JSON files in `src/data/` |
| Blog | Claude Haiku via Anthropic API (daily, 14-topic rotation) |
| Social | twitter-api-v2 (daily auto-post to X) |

## Lottery Games

| Game | Slug | Format | Bonus | Draw Schedule | SODA ID |
|---|---|---|---|---|---|
| Powerball | `powerball` | 5/69 + 1/26 | Powerball | Mon, Wed, Sat 10:59 PM ET | `d6yy-54nr` |
| Mega Millions | `mega-millions` | 5/70 + 1/24 | Mega Ball | Tue, Fri 11:00 PM ET | `5xaw-6ayf` |
| Cash4Life | `cash4life` | 5/60 + 1/4 | Cash Ball | Retired Feb 21, 2026 | `kwxv-fwze` |
| NY Lotto | `ny-lotto` | 6/59 + 1/59 | Bonus | Wed, Sat 8:15 PM ET | `6nbc-h7bj` |
| Take 5 | `take5` | 5/39 | **None** | Daily 2:30 PM & 10:30 PM ET | `dg63-4siq` |
| Millionaire for Life | `millionaire-for-life` | 5/58 + 1/5 | Millionaire Ball | Daily 11:15 PM ET | `a4w9-a3tp` |

**Key patterns:**
- Take 5: no bonus (`bonusNumber.count === 0`), two draws/day (`drawTime: 'midday' | 'evening'`)
- Cash4Life: retired Feb 21, 2026 — historical data only, stale checks skipped
- Millionaire for Life: launched Feb 22, 2026 replacing Cash4Life — SODA dataset `a4w9-a3tp`

**Known historical anomalies (expected warnings):**
- Powerball bonus was 1-35 before Oct 2015 (now 1-26)
- Mega Millions bonus was 1-25 before April 2025 (now 1-24), ticket $2→$5, Megaplier retired

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                    # Root layout (Header + Footer + GA + AdSense)
│   ├── page.tsx                      # Homepage
│   ├── sitemap.ts, robots.ts         # SEO
│   ├── [lottery]/                    # /powerball, /mega-millions, etc.
│   │   ├── page.tsx                  # Overview + latest results + FAQ
│   │   ├── numbers/page.tsx          # Recommendations + generator
│   │   ├── numbers/[numberSlug]/     # Per-number analysis (~410 pages)
│   │   ├── results/page.tsx          # Full history
│   │   ├── results/[year]/           # Year archives
│   │   └── statistics/page.tsx       # Frequency, hot/cold, pairs, triplets
│   ├── states/                       # 46 state hub pages
│   ├── tools/                        # tax-calculator, number-generator, odds-calculator, ticket-checker
│   ├── blog/[slug]/                  # Blog articles
│   ├── api/contact/route.ts          # Serverless email (Resend)
│   └── about, privacy, terms, disclaimer, methodology, contact
├── components/
│   ├── layout/   Header, Footer, Breadcrumbs
│   ├── lottery/  LotteryCard, LotteryBall, ResultsTable
│   ├── numbers/  NumberGenerator, HotColdChart, RecommendedNumbers
│   ├── tools/    TaxCalculator, TicketChecker
│   ├── ads/      AdUnit (renders when ADSENSE_CLIENT_ID set)
│   ├── seo/      JsonLd, FAQSection
│   └── ui/       Button, Card, Tabs
├── lib/
│   ├── lotteries/  config.ts, types.ts (supports optional bonus, drawsPerDay)
│   ├── states/     config.ts (48 states with tax, games, claims)
│   ├── data/       fetcher.ts, parser.ts
│   ├── analysis/   frequency, hotCold, overdue, gaps, pairs, triplets, recommendations
│   ├── seo/        metadata.ts, structuredData.ts, faqContent.ts
│   ├── blog.ts     Seed posts + getters
│   └── utils/      formatters.ts, constants.ts
├── data/           *.json (lottery draws), state-tax-rates.ts
scripts/
├── lib/            retry.ts (shared backoff), constants.ts (thresholds, topics)
├── update-data.ts, generate-blog-post.ts, post-to-x.ts
├── check-new-datasets.ts, cleanup-stale-issues.ts
├── update-tax-rates.ts, generate-state-configs.ts
├── validate-build.ts, seo-health-check.ts, sync-claude-md.ts
└── onboard-new-game.ts, generate-methodology.ts
.github/workflows/
├── fetch-lottery-data.yml    # Daily 6 AM UTC
├── generate-blog.yml         # After data fetch
├── post-to-x.yml             # After blog generation
└── weekly-maintenance.yml    # Weekly checks + quarterly tax updates
content/blog/                 # Auto-generated daily blog posts (JSON)
```

## Commands

```bash
npm run dev / build / start / lint
npx tsx scripts/update-data.ts              # Fetch 6 games from SODA API
npx tsx scripts/generate-blog-post.ts       # Daily blog (needs ANTHROPIC_API_KEY)
npx tsx scripts/post-to-x.ts               # Post to X (needs X API keys)
npx tsx scripts/check-new-datasets.ts       # Scan for new SODA datasets
npx tsx scripts/update-tax-rates.ts         # Quarterly tax update (needs ANTHROPIC_API_KEY)
npx tsx scripts/validate-build.ts           # Post-build validation
npx tsx scripts/onboard-new-game.ts <id>    # Onboard new game from SODA dataset
npx tsx scripts/sync-claude-md.ts           # Sync stats after build
```

## Environment Variables

| Variable | Required | Where | Purpose |
|---|---|---|---|
| `RESEND_API_KEY` | Yes | Vercel + `.env.local` | Contact form emails |
| `ANTHROPIC_API_KEY` | No | GitHub Secrets | Blog gen + tax updates |
| `CONTACT_EMAIL` | No | Vercel | Contact form recipient |
| `X_CONSUMER_KEY` | No | GitHub Secrets | X API OAuth 1.0a |
| `X_SECRET_KEY` | No | GitHub Secrets | X API OAuth 1.0a |
| `X_API_ACCESS_TOKEN` | No | GitHub Secrets | X API OAuth 1.0a |
| `X_API_ACCESS_TOKEN_SECRET` | No | GitHub Secrets | X API OAuth 1.0a |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | No | Vercel | AdSense (pub-7561681382580308) |
| `GITHUB_TOKEN` | Auto | GitHub Actions | Issue creation |

## Automation

The site runs itself with zero manual intervention:

- **Daily:** Fetch lottery data → generate blog → post to X (chained GitHub Actions)
- **Weekly:** Scan SODA catalog for new datasets, security audit, SEO health check
- **Quarterly:** Auto-update state tax rates via Claude API (sanity bounds: reject >15% or >3pp change)
- **All scripts** use `withRetry()` from `scripts/lib/retry.ts` for exponential backoff
- **All workflows** create GitHub Issues on failure (label: `automation-failure`, deduplicated)
- **Build verification** runs before every automated commit (broken builds don't get pushed)
- **False positive datasets:** Add ID to `IGNORED_DATASET_IDS` in `scripts/lib/constants.ts`

## Required Disclaimers

Every results/analysis page must include:
1. Unofficial status — not affiliated with Powerball, Mega Millions, MUSL, or state commissions
2. Official numbers control — certified numbers shall control in discrepancies
3. Verify with official state lottery
4. Entertainment/informational purposes only
5. No prediction claims — historical patterns don't predict future outcomes
6. Data source: NY Open Data (data.ny.gov)
7. Responsible gambling: NCPG helpline 1-800-522-4700 (in footer)

## AdSense Compliance

- Position as **lottery information & statistics** — never transactional
- Never link to ticket purchase sites
- Use "statistical analysis," "frequency trends," "insights" — never "prediction," "guaranteed," or "winning strategy"
- Disclaimer on every recommendation page
- AdSense script in layout.tsx (conditional on `NEXT_PUBLIC_ADSENSE_CLIENT_ID`)
- ads.txt configured: pub-7561681382580308

## SEO Guidelines

- **YMYL site** — E-E-A-T standards apply: cite sources, show methodology, no prediction claims
- Intent-first title tags (not brand-first)
- FAQPage JSON-LD on game overview and state hub pages
- Internal linking between results, statistics, numbers, and blog
- Featured snippet optimization: answer queries in 40-60 words after H2

## Key Design Decisions

1. **Hybrid SSG + serverless** — static for all content, serverless only for `/api/contact`
2. **JSON data files** — no database; updated via git commits from GitHub Actions
3. **Client-side tools** — number generator (`crypto.getRandomValues`), tax calculator — zero server load
4. **No-bonus abstraction** — `bonusNumber.count === 0` pattern handles Take 5 throughout
5. **State tax as TypeScript** — `src/data/state-tax-rates.ts` enables Claude API auto-updates with type safety
6. **Centralized constants** — `scripts/lib/constants.ts` for all automation thresholds and config
7. **Blog: seed + auto-generated** — `src/lib/blog.ts` (seed), `content/blog/` (daily JSON)

## Pending Roadmap

**Phase 2 P3 — Content Depth:**
- [ ] 20+ manual quality blog posts for long-tail keywords
- [ ] Jackpot tracker/history page with progression charts
- [ ] Enhanced disclaimer page

**Phase 2 P4 — SEO Optimization:**
- [ ] Intent-first title tags on all pages
- [ ] "Last updated" timestamps on results/statistics pages
- [ ] "Verify with official lottery" links on results tables
- [ ] Increase internal linking
- [ ] Apply for Google AdSense

**Phase 3 — Full Coverage & Monetization (target: 1000+ pages):**
- [ ] All 50 state hubs (currently 48)
- [ ] Pick 3/Pick 4/daily games
- [x] Millionaire for Life (onboarded — SODA dataset `a4w9-a3tp`)
- [ ] Monthly archive pages
- [ ] Enhanced analysis (streaks, bell curves)
- [ ] Email newsletter / jackpot alerts

**Phase 4 — Growth:** A/B ad testing, PWA, post-draw triggers, Spanish, Mediavine at 50K sessions/mo

## Verified Facts Reference

See `docs/verified-facts.md` for the full fact-check report (Powerball, Mega Millions, Cash4Life, NY Lotto, Take 5, biggest jackpots). Last verified: February 2026. Next check: May 2026.
