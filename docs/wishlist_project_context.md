# Project Context: Wishlist \+ Deal Finder App

> Use this file as project instructions (Claude Projects) or save it as `CLAUDE.md` in the repo root (Claude Code). Update it as decisions change. Items marked **\[Decision\]** are settled; items marked **\[Open\]** still need an answer.

## 1\. What we're building

A wishlist app that finds deals on listed items and notifies users. Users can follow another person's wishlist, see deals on it, and coordinate buying gifts without spoiling surprises.

**Core user stories**

- As a list owner, I create wishlists and add items (by URL or manually), and share lists with friends or by link.  
- As a gifter, I open a shared list (account optional), see current best prices, and claim an item so nobody double-buys. The owner never sees what is claimed.  
- As a follower, I get alerts when items on a followed list drop in price.  
- As any user, I set a target price or percent-drop alert on an item.

**Differentiators vs. existing apps**

- Gifting and price tracking in one product (most competitors do one or the other).  
- Cross-retailer price comparison with product matching.  
- Deal judgment ("lowest in 6 months"), not just price-drop pings.  
- Low friction for gifters: no extension or account needed to view and claim.

## 2\. Project setting and timeline **\[Decision\]**

- Academic-year project, designed to give students time to study without stress. Plan for slack, especially around exams and holidays.  
- Team: 7 assigned members. Assume about 5 to 6 will be reliably active week to week. **Plan for that core group; treat the rest as bonus capacity.** If all 7 stay active, that is extra slack, not a reason to add scope.  
- **Showcase:** mid to late November 2026 (demo or progress update).  
- **Final presentation:** March or April 2027\.  
- **Feature freeze:** about 4 weeks before the final presentation. The last weeks go to stability, bug fixing, and presentation prep.

| When | Focus |
| :---- | :---- |
| Oct to late Oct 2026 | Setup, wireframes, price data spike, team onboarding on React and Supabase |
| Late Oct to showcase (mid/late Nov) | Login, database, create and edit lists, basic UI |
| Dec to Jan | Sharing, claiming, add item from URL (light workload around exams) |
| Jan to Feb | One price source, price history, basic alert email |
| Feb to early Mar | Closed beta, bug fixing, feature freeze |
| Mar/Apr 2027 | Final demo prep, with buffer for slips |

**Showcase target:** sign up, create a wishlist, add items, share by link, and (if time allows) claim an item as a gifter. Add a slide on what the price data spike found, and ideally one item showing a real price from one API.

**Capacity warning.** The full plan is about 102 ideal developer-days. At roughly 5 to 6 active members giving 4 to 6 hours a week for about 20 usable weeks, the team has about 400 to 720 hours (about 560 to 840 if all 7 stay fully active), and beginners often take 1.5 to 2 times longer than ideal estimates. These hour figures are assumptions: replace them with real numbers once known. Expect to finish Phases 0 and 1 plus a slim version of Phase 2, not everything.

## 3\. Constraints

- **Budget is tight.** Prefer free tiers and pay-per-use. Cap per-user tracked items to bound costs.  
- **Team is mostly beginners.** Favor managed services, simple patterns, and readable code.  
- **Must be deployable and able to scale** without a rewrite.  
- **Scraping is the main risk.** Retailers block scrapers and many terms forbid scraping. Prefer official APIs and affiliate feeds.  
- Pricing and free-tier limits change often. Verify current terms before relying on them.

## 4\. Tech stack **\[Decision\]**

| Layer | Choice | Role |
| :---- | :---- | :---- |
| Frontend | React \+ Vite, Tailwind CSS | UI, responsive web app |
| Frontend hosting | Vercel (swappable: Netlify, Cloudflare Pages) | Auto-deploy from GitHub |
| Backend | Supabase | Auth, Postgres, row-level security, realtime |
| Server logic | Supabase Edge Functions (TypeScript, run on Deno) | Price checks, alerts, link metadata, affiliate redirects, LLM calls |
| Price data | Retailer/affiliate APIs, plus a search-results API (e.g. SerpApi) | Prices as structured JSON |
| LLM | Small, cheap model (e.g. Claude Haiku) | Product matching/extraction only when structured parsing fails |
| Email | Resend | Price-drop alerts |
| Source control | GitHub | Repo and CI/CD |

**No Express (or other custom API server) between the frontend and Supabase \[Decision\].** The React app uses `supabase-js` to talk to Supabase directly, and row-level security enforces permissions. A proxy server would add routes to maintain and a second permission system to keep consistent.

**Optional: price worker.** If price checking outgrows edge function limits (execution time, resources), or needs a headless browser, move that one job to a small standalone Node/TypeScript service on Fly.io or Railway. It runs on a schedule, calls the same price APIs, writes to the same database, and is never called by the frontend. Nothing else changes. Move to it only when a real limit is hit. It also offers a place for students to write a classic Node service.

**Mobile strategy \[Decision\]:** responsive web app first, then PWA (installable; iOS web push is more limited than Android). Consider React Native/Expo only if users ask for it.

**Later / as needed:** Next.js (richer share-link previews), Upstash Redis (caching), Sentry (errors), Stripe (premium tier).

## 5\. Architecture: where things live

Browser / installed PWA

   React \+ Tailwind (Vercel)

          |

          v   (supabase-js)

      Supabase

   \- Auth          (logins, sessions)

   \- Postgres      (lists, items, prices, shares, claims)  \+ row-level security

   \- Edge Functions (scheduled price checks, alerts)

          |

          \+--\> Price data APIs

          \+--\> LLM API

          \+--\> Resend (email)

   Optional: Node price worker \--\> same APIs, writes to same DB

| Need | Where it runs |
| :---- | :---- |
| Login, list CRUD, sharing, claiming | Frontend calling Supabase directly (RLS enforces permissions) |
| Anything using a secret key (retail APIs, LLM, Resend) | Supabase Edge Functions only |
| Scheduled price checks | pg\_cron triggering an edge function |
| Heavy or long-running scraping | Optional Node worker |

Rules:

- The frontend talks **only** to Supabase. Retailers, the LLM, and email are called from edge functions (or the worker), never the browser. Secrets live in Supabase secrets, never in frontend code or the repo.  
- Permissions are enforced in the database with RLS, not just in the UI.  
- Edge functions run on Deno, not Node. Most TypeScript transfers and many npm packages work, but some will not. They also have time and resource limits: check current limits before relying on them for large batches.

## 6\. Draft data model

Tables (to be refined in ticket T1.1):

- `profiles`: user profile linked to the auth user  
- `lists`: owner, title, visibility (`private` | `link` | `friends`), share token (unguessable)  
- `items`: list, name, url, image, notes, product identifiers (e.g. GTIN)  
- `list_follows`: follower and list  
- `claims`: item, claimer, status (**hidden from list owner**)  
- `price_history`: item, source, price, currency, checked\_at, match confidence  
- `alert_rules`: user, item, type (`target_price` | `percent_drop`), threshold, last\_sent\_at

**Critical rules**

1. A list owner must never be able to read claims on their own items.  
2. A shared list is visible only to permitted users or holders of its share token.  
3. Two gifters cannot claim the same item.  
4. Every RLS rule needs an automated test, and permission changes need a second reviewer.

## 7\. Price pipeline principles

1. Prefer official APIs and affiliate feeds; use scraping services only for gaps.  
2. Put each source behind a small adapter with the same shape (for example `getPrice(item)`), so adding or swapping a retailer touches one file.  
3. Try cheap structured parsing first (JSON-LD, schema.org, OpenGraph) before calling an LLM.  
4. Match products by barcode/GTIN and title similarity with a confidence score; flag low-confidence matches for user confirmation. A wrong match produces a fake deal.  
5. Throttle, cache, and retry. A failing source must not stop other checks.  
6. Log failures and cost per run.  
7. All outbound retailer links go through a redirect function that adds affiliate tags and shows disclosure.

Typical run: wake on schedule, pick items to check (skip recently checked), fetch prices via adapters, match products, save to `price_history`, evaluate alert rules, send emails, log results.

## 8\. LLM guidelines

- The LLM is the **last feature added**, after the team sees which cases simple rules miss.  
- It lives only in a backend function (edge function or worker). Never call it from the browser.  
- Flow: build a short prompt from page text or candidate listings, ask for JSON only, validate the JSON, save the result or confidence to the database. The frontend reads the saved data and never talks to the LLM.  
- Wrap it in one or two small functions (for example `extractProduct(text)`, `isSameProduct(a, b)`).  
- Use a small, inexpensive model, cache results by URL, run slow calls in the background, and set a monthly spend limit plus a per-user cap.

## 9\. Scope tiers

**Must have (final demo):** login, database with permissions, create and edit wishlists, share by link, gift claiming, add item from URL, price data from one source, price history on an item, one basic price-drop email alert, security and privacy pass, beta testing.

**Should have:** following another user's list, affiliate links, basic product matching for one retailer, installable PWA, error monitoring, throttling and caching.

**Could have:** deals feed, LLM-based matching, push notifications, more retailers, premium tier.

**If running behind, cut in this order:** deals feed, LLM matching, push notifications, PWA, affiliate links, additional retailers. Protect the Must tier and the feature freeze date.

## 10\. Plan summary

About 102 ideal developer-days in total (rough estimates; re-estimate with the team). See the project plan PDF for tickets, dependencies, and risks.

| Phase | Goal | Milestone |
| :---- | :---- | :---- |
| 0\. Setup and validation | Environments, wireframes, price data spike | Go/no-go on data source and cost |
| 1\. Core wishlist | Auth, schema, RLS, list CRUD, sharing, claiming | Internal alpha; showcase slice |
| 2\. Price tracking | Pipeline, history UI, alerts, optional matching | Closed beta |
| 3\. Polish and launch | Security pass, monitoring, beta feedback, final prep | Final presentation |

**Highest priority first:** ticket T0.3, the price data spike: test 1 to 2 data sources on about 10 sample products and record coverage, accuracy, and cost per call.

## 11\. Team organization

- **Three squads of 2, plus one flexible member** (frontend; data and permissions; price pipeline; the flexible person covers QA, documentation, test data, and the demo script, and can fill gaps). Pairing means one dropout does not stall an area.  
- **Reliable members take the critical path:** permissions (T1.2) and the price pipeline (T2.1), each with a pair or reviewer.  
- **Less available members take small, independent tasks:** UI components, wireframes, test data, QA, documentation, demo script.  
- **Size tickets to about 4 to 6 hours of someone's spare time.** Split anything larger so a missed week does not block others.  
- **Check in monthly** on who is active; reassign early and without blame.

## 12\. Conventions

- **Language:** TypeScript for frontend and edge functions.  
- **Git:** short-lived feature branches, pull requests required, at least one reviewer.  
- **Environments:** separate staging and production Supabase projects. Never commit secrets.  
- **Database changes:** versioned migrations in the repo, never manual edits in production.  
- **Testing:** automated tests for RLS policies and matching logic at minimum.  
- **UI:** mobile-first, Tailwind utility classes, reusable components.  
- **Code style:** clear and simple over clever. Comment the reason for non-obvious decisions.

## 13\. Legal and compliance

- Review each retailer's terms and robots.txt before using it as a source.  
- Disclose affiliate relationships to users.  
- Provide a privacy policy, terms, account deletion, and data export (wishlists can reveal personal information).  
- Apply to affiliate programs early; approvals can take weeks.

## 14\. Learning goals

Using Supabase and Vercel hides server boilerplate but still teaches database design and SQL, authentication and authorization, serverless functions, third-party API integration, scheduled jobs, CI/CD, and testing. To keep depth:

- Make permissions and database design a core learning area, with code review.  
- Have a small group build the price logic (adapters, matching), and the optional Node worker if it becomes necessary.  
- Consider a short early side exercise, such as building a tiny Express API, so students see what Supabase does for them.

## 15\. Open questions **\[Open\]**

- Which price data sources and retailers for v1? (Decided by the T0.3 spike.)  
- What is the per-user tracked-item cap?  
- Do followers need accounts, or can they follow by link only?  
- Which regions and currencies?  
- Which affiliate programs to apply to first?  
- Social login providers, if any.  
- Exact showcase and final presentation dates, and real weekly hours from each of the 7 members.

## 16\. How the AI assistant should help

- Assume the reader is a beginner; explain briefly why, not just what.  
- Prefer managed services and simple patterns that fit the stack in section 4\. Do not suggest adding an Express layer between the frontend and Supabase.  
- Flag cost implications of any suggestion (LLM calls, API requests, proxies).  
- Never put third-party API keys in frontend code.  
- When writing database code, include RLS policies and tests for them.  
- Keep tickets small enough for a part-time student to finish in a week.  
- When asked about current pricing, limits, or product versions, verify rather than rely on memory.  
- Call out legal or terms-of-service risk when a suggestion involves scraping.  
- Ask before making changes that affect the data model, permissions, or the stack decisions above.