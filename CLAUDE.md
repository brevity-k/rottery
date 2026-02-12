# My Lotto Stats - AI-Powered Lottery Number Insights & Statistics

## Project Overview

My Lotto Stats is a free, SEO-optimized lottery information website that provides statistical analysis and number recommendations for US lotteries. Revenue model: Google AdSense (Phase 2+). Hybrid rendering: static pages + serverless API routes on Vercel.

**Live site:** https://mylottostats.com
**Live repo:** https://github.com/brevity-k/lottery
**Domain registrar:** Porkbun
**Hosting:** Vercel (auto-deploys on push)
**Google Analytics:** G-5TW1TM399X
**Google Search Console:** Verified + sitemap submitted

---

## Architecture

```
[Build Time]  SODA API JSON files ──> Next.js SSG ──> Static HTML ──> Vercel CDN
[Runtime]     Client-side: number generator, chart interactions
[Runtime]     Serverless: /api/contact (Resend email)
[Daily Cron]  GitHub Action fetches latest data + generates blog ──> git push ──> Vercel rebuild
```

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, hybrid: static + serverless) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| Charts | Recharts 3 |
| Email | Resend (contact form auto-reply) |
| Data source | NY Open Data SODA API (free, no key) |
| Data storage | JSON files in `src/data/` |
| Blog generation | Claude Haiku via Anthropic API (daily, automated) |
| Hosting | Vercel free tier |
| DNS | Porkbun → Vercel (A: 76.76.21.21, CNAME: cname.vercel-dns.com) |

---

## Project Structure

```
rottery/
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Root layout (Header + Footer + GA + Search Console)
│   │   ├── page.tsx                  # Homepage: lottery grid + hero
│   │   ├── sitemap.ts               # Dynamic sitemap
│   │   ├── robots.ts                # robots.txt generator
│   │   ├── [lottery]/               # /powerball, /mega-millions
│   │   │   ├── page.tsx             # Lottery overview + latest results + FAQ
│   │   │   ├── numbers/page.tsx     # Recommendations + random generator
│   │   │   ├── results/page.tsx     # Full results history
│   │   │   ├── results/[year]/      # Results by year (2002-2026)
│   │   │   └── statistics/page.tsx  # Frequency charts, hot/cold, overdue, pairs
│   │   ├── api/contact/route.ts     # Serverless: Resend email API
│   │   ├── contact/page.tsx         # Contact form page
│   │   ├── tools/
│   │   │   ├── number-generator/    # Crypto-random number generator
│   │   │   └── odds-calculator/     # Lottery odds breakdown
│   │   ├── blog/                    # Blog index + article pages
│   │   │   └── [slug]/page.tsx
│   │   ├── about/page.tsx           # Required for AdSense
│   │   ├── privacy/page.tsx         # Required for AdSense
│   │   ├── terms/page.tsx           # Required for AdSense
│   │   └── disclaimer/page.tsx      # Required for AdSense
│   ├── components/
│   │   ├── layout/    Header, Footer, Breadcrumbs
│   │   ├── lottery/   LotteryCard, LotteryBall, ResultsTable, JackpotDisplay
│   │   ├── numbers/   NumberGenerator, HotColdChart, RecommendedNumbers
│   │   ├── contact/   ContactForm (client component)
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
│       ├── powerball.json           # ~1,900 draws (2010-02-03 to present)
│       └── mega-millions.json       # ~2,474 draws (2002-05-17 to present)
├── scripts/
│   ├── update-data.ts               # SODA API fetcher (run via `npx tsx`)
│   └── generate-blog-post.ts        # Claude-powered daily blog generation
├── .github/workflows/
│   └── update-lottery-data.yml      # Daily cron at 6 AM UTC
├── content/blog/                    # Auto-generated daily blog posts (JSON)
├── public/
│   └── ads.txt                      # AdSense placeholder
└── .env.local                       # RESEND_API_KEY (not committed)
```

---

## Commands

```bash
# Development
npm run dev                    # Start dev server (http://localhost:3000)
npm run build                  # Build for production
npm run start                  # Serve production build

# Data updates
npx tsx scripts/update-data.ts          # Fetch latest draws from SODA API
npx tsx scripts/generate-blog-post.ts   # Generate daily blog post (needs ANTHROPIC_API_KEY)

# Lint
npm run lint                   # ESLint check
```

---

## Environment Variables

| Variable | Required | Where Set | Description |
|---|---|---|---|
| `RESEND_API_KEY` | Yes | Vercel + `.env.local` | Resend API key for contact form emails |
| `ANTHROPIC_API_KEY` | No | GitHub Secrets | For auto blog generation in GitHub Actions |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | No (Phase 2) | Vercel | Google AdSense publisher ID |

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
| Multi-state game results | 240+ games | 2 games | HIGH |
| State lottery hubs (50 states) | All majors have it | None | HIGH |
| Tax/payout calculator | USAMega, LotteryUSA, Powerball.net | None | HIGH |
| Ticket/number checker | LotteryUSA, Powerball.net, LotteryValley | None | MEDIUM |
| Per-number analysis pages | Powerball.net, LottoNumbers | None | MEDIUM |
| Triplet/quadruplet analysis | LottoNumbers, Powerball.net | None | MEDIUM |
| Pick 3/4 daily games | LotteryUSA, LottoStrategies, LotteryCorner | None | MEDIUM |
| Community/forums | LotteryPost, LotteryUSA | None | LOW |
| Scratch-off analysis | LotteryValley | None | LOW |

### Our Competitive Advantages

1. **Zero operating cost** — static pages, free APIs, free hosting
2. **Modern tech stack** — Next.js 16, Tailwind v4, clean responsive UI
3. **AI-powered analysis branding** — unique positioning vs. competitors
4. **Multi-strategy recommendation engine** — most competitors lack this
5. **Automated daily blog generation** — builds content and SEO authority automatically
6. **Full SEO infrastructure** — JSON-LD, sitemap, robots, per-page metadata

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

**Tier 2 — Educational/guide content:**
- "how to pick powerball numbers statistically"
- "powerball vs mega millions which is better"
- "how does power play work"
- "powerball odds of winning each prize"

**Tier 3 — Tool-based traffic:**
- "powerball number generator"
- "lottery probability calculator"
- "mega millions tax calculator by state"
- "check my powerball numbers"

**Tier 4 — State-specific long tail (future):**
- "powerball winners in [state]"
- "lottery tax rate [state]"
- "mega millions results [state]"

### SEO Best Practices

- **Intent-first title tags:** "Powerball Results Today [Date] | Winning Numbers & Statistics" (not brand-first)
- **Featured snippet optimization:** Answer queries in 40-60 words directly after H2 headings
- **Table snippets:** Clean HTML tables for odds, prize charts (Google pulls these)
- **FAQ schema:** FAQPage JSON-LD on every game overview page with 8-10 high-search-volume questions
- **Internal linking:** Every results page links to statistics, numbers, and blog posts
- **Content freshness:** Results updated daily via GitHub Actions; timestamp displayed on pages

### E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)

This site falls under **YMYL (Your Money Your Life)** — Google applies higher standards:

- **Experience:** Show real calculations, methodology transparency, interactive tools
- **Expertise:** Cite data sources, mathematical rigor, never claim "prediction"
- **Authoritativeness:** Comprehensive coverage, regular publishing, linkable data visualizations
- **Trustworthiness:** Legal pages, disclaimers, "verify with official lottery" language, responsible gambling messaging

---

## Data Validation & Credibility

### Current Data Source

NY Open Data SODA API (government source):
- Powerball: `data.ny.gov/resource/d6yy-54nr.json`
- Mega Millions: `data.ny.gov/resource/5xaw-6ayf.json`

### Required Validation Rules

**Structural validation (automated in update script):**
- Number ranges match game format (1-69 main, 1-26 bonus for Powerball; 1-70 main, 1-24 bonus for Mega Millions)
- Correct number of balls per draw (5 main + 1 bonus)
- Draw dates align with expected schedule (Mon/Wed/Sat for PB, Tue/Fri for MM)
- No duplicate draw dates
- Record count never decreases between updates

**Temporal validation:**
- Draws appear in chronological order
- No missing draw dates (gaps in expected schedule)
- No future-dated draws

**Cross-referencing (recommended for Phase 2):**
- Validate against a secondary source (official lottery website or second API)
- Flag discrepancies for manual review before publishing

### Required Disclaimers

Every results page and analysis page must include:
1. **Unofficial status:** "This website is not affiliated with or endorsed by Powerball, Mega Millions, MUSL, or any state lottery commission"
2. **Official numbers control:** "In the event of a discrepancy, official winning numbers as certified by the Multi-State Lottery Association shall control"
3. **Verification directive:** "Always verify results with your official state lottery"
4. **Entertainment only:** All analysis is for informational and entertainment purposes
5. **No prediction claims:** Statistical analysis examines historical patterns but does not predict future outcomes
6. **Data source attribution:** "Results sourced from NY Open Data (data.ny.gov)"
7. **Responsible gambling:** National Council on Problem Gambling helpline: 1-800-522-4700

### Format Change Monitoring

Lottery game formats change every 3-8 years. The April 2025 Mega Millions overhaul is a recent example ($2→$5, bonus range 25→24, Megaplier retired).

**Monitoring approach:**
- Automated range anomaly detection in update script
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

### Phase 2: High-Impact Content Expansion (Target: 300+ pages)

**Priority 1 — Highest traffic impact:**
- [ ] **Tax/payout calculator tool** — federal + state tax by state, lump sum vs annuity comparison (captures "mega millions after tax" queries — one of the highest-intent keywords)
- [ ] **3 additional multi-state games** — Lucky for Life, Cash4Life, Lotto America (each adds overview, results, statistics, numbers, year archives = ~25 pages per game)
- [ ] **Top 10 state lottery hubs** — CA, TX, FL, NY, PA, OH, IL, MI, GA, NC (each state page: available games, tax rates, claim procedures, where to buy = 10+ pages)

**Priority 2 — SEO authority building:**
- [ ] **Per-number analysis pages** — individual pages for each number (1-69 main + 1-26 bonus for Powerball = 95 pages; similar for MM). Each shows: frequency, last drawn, avg gap, most paired with
- [ ] **Ticket/number checker tool** — user enters numbers + draw date, system checks against historical data (drives repeat visits)
- [ ] **Triplet analysis** — expand pair analysis to triplets and quadruplets
- [ ] **FAQ sections on all pages** — structured FAQPage schema for featured snippet eligibility

**Priority 3 — Content depth:**
- [ ] **20+ manual quality blog posts** targeting long-tail keywords: "powerball vs mega millions odds comparison", "lottery tax by state guide", "biggest lottery winners 2026"
- [ ] **Jackpot tracker/history page** — current + historical jackpots with progression charts
- [ ] **Enhanced disclaimer page** — add unofficial status, discrepancy clause, data source attribution, responsible gambling helpline
- [ ] **Methodology page** — explain how statistical analyses are calculated (E-E-A-T signal)

**Priority 4 — SEO optimization:**
- [ ] **Intent-first title tags** on all pages
- [ ] **"Last updated" timestamps** displayed on all results/statistics pages
- [ ] **"Verify with official lottery" links** on every results table
- [ ] **Responsible gambling notice** in site footer
- [ ] **Increase internal linking** between results, statistics, and blog posts
- [ ] Apply for Google AdSense (after 2-4 weeks of organic traffic)

### Phase 3: Full Coverage & Monetization (Target: 500+ pages)
- [ ] All 45 state hubs + state-specific game pages
- [ ] Pick 3/Pick 4/daily game coverage (daily draws = massive page multiplication)
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

The GitHub Actions workflow runs daily at 6 AM UTC:

1. Checkout repo → Install dependencies
2. Fetch latest lottery data from SODA API
3. Generate daily blog post via Claude Haiku (if ANTHROPIC_API_KEY set)
4. Check if data/blog files changed
5. If changed: verify build succeeds → commit + push → Vercel auto-deploys
6. All static pages regenerated with fresh data

**Cost: $0** (GitHub Actions free for public repos, Vercel rebuilds free, SODA API free)

### Draw Schedule

| Day | What's Fetched | Draw That Occurred |
|---|---|---|
| Mon 6AM UTC | Nothing new (no Sun draw) | — |
| Tue 6AM UTC | Powerball Mon draw | Powerball (Mon 10:59 PM ET) |
| Wed 6AM UTC | Mega Millions Tue draw | Mega Millions (Tue 11 PM ET) |
| Thu 6AM UTC | Powerball Wed draw | Powerball (Wed 10:59 PM ET) |
| Fri 6AM UTC | Nothing new (no Thu draw) | — |
| Sat 6AM UTC | Mega Millions Fri draw | Mega Millions (Fri 11 PM ET) |
| Sun 6AM UTC | Powerball Sat draw | Powerball (Sat 10:59 PM ET) |

---

## Contact Form

- **API route:** `src/app/api/contact/route.ts` (serverless on Vercel)
- **Email service:** Resend (`RESEND_API_KEY` in Vercel env vars + `.env.local`)
- **From address:** `My Lotto Stats <onboarding@resend.dev>`
- **Owner email:** `brevity1s.wos@gmail.com`
- **Flow:** User submits form → owner gets notification email → sender gets auto-reply confirmation
- **Env var:** `RESEND_API_KEY` must be set in Vercel project settings for production

---

## AdSense Setup

### Prerequisites Before Applying
- Live website with original, quality content (74+ pages — meets threshold)
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
4. **Blog as TypeScript module + auto-generated JSON** — `src/lib/blog.ts` for seed posts, `content/blog/` for daily auto-generated posts
5. **AdSense-ready but not active** — All legal pages present, `AdUnit` component renders only when env var is set
6. **"AI-Powered" branding** — Refers to the statistical analysis algorithms; legitimate and distinctive positioning
7. **Resend for email** — Free tier sufficient for contact form volume; auto-reply builds trust
8. **Porkbun for domain** — Consistent pricing, no renewal markup, free WHOIS privacy
