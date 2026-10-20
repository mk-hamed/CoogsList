# Contributing to CoogsList
 
Thanks for helping build CoogsList! This guide explains how we work so everyone can contribute without stepping on each other. If anything here is unclear, ask in [team-2 channel](https://discord.com/channels/1289776673453117480/1559728261251080325). Questions are always welcome.
 
New here? Start with the [Development Quickstart Guide](./QUICKSTART.md) to get the app running first.

## The short version
 
1. Check Jira for the ticket assigned to you. Team Leads assigns all tickets.
2. Create a branch from `main`.
3. Make small, focused changes.
4. Open a pull request (PR) and get one review.
5. Merge after approval, then delete your branch.
## Working on tickets
 
- Every change starts from a Jira ticket. Team Leads assigns tickets, so work on the ones assigned to you rather than picking up unassigned tickets. This keeps two people from doing the same work.
- Finished early or want more to do? Ask a Team Lead in [team-2 channel](https://discord.com/channels/1289776673453117480/1559728261251080325) and you'll be given something.
- If you spot something that needs doing and there's no ticket, create one (leave it unassigned) and mention it in [team-2 channel](https://discord.com/channels/1289776673453117480/1559728261251080325). Don't start work on it until it's assigned.
- Tickets are sized for roughly **4 to 6 hours** of work. If yours is turning out much bigger, say so and we'll split it.
- Move your ticket through the board as you go: **To Do → In Progress → In Review → Done**.
- **Stuck or busy?** Post in [team-2 channel](https://discord.com/channels/1289776673453117480/1559728261251080325) or comment on the ticket. Being blocked or missing a week is normal (exams happen!). Just tell us early so the work can be reassigned without blame.
## Branches
 
- Never commit directly to `main`. It is protected.
- Branch from an up-to-date `main`:
      git checkout main
      git pull
      git checkout -b your-name/PROJ-123-short-description
 
- Keep branches **short-lived** (ideally merged within a few days). Long-lived branches cause painful merge conflicts.
- One ticket per branch, one purpose per PR.
## Commits
 
- Commit often with clear messages that say what and why:
      Add claim button to shared list page (PROJ-123)
 
- Start with a verb ("Add", "Fix", "Update", "Remove"). Include the ticket key.
- Don't commit commented-out code, debug logging, or unrelated formatting changes.
## Pull requests
 
1. Push your branch and open a PR against `main`.
2. Fill in the PR template (checklist below). Link the Jira ticket.
3. Keep PRs small. Under about 300 changed lines is much easier to review.
4. A Vercel preview link is posted on each PR. Click it and check your change works.
5. Request at least **one reviewer**. You can't approve your own PR.
6. Address feedback by pushing more commits to the same branch.
7. Once approved and checks pass, merge (squash merge preferred), then delete the branch.
### PR checklist
 
- [ ] The app builds and runs locally
- [ ] Tests pass, and I added tests for new logic
- [ ] No secrets, keys, or `.env` files are committed
- [ ] No third-party API keys in frontend code
- [ ] If I changed the database: I added a migration (see below)
- [ ] If I changed permissions or RLS: I added or updated RLS tests and requested a **second reviewer**
- [ ] I tested on a phone-sized screen (we are mobile-first)
## Code reviews
 
Reviews are how we learn from each other, so be kind and specific.
 
**As an author:** explain what you changed and why, and point out anything you're unsure about.
 
**As a reviewer:**
- Review within about **48 hours**. If you can't, tell the author so they can find someone else.
- Ask questions instead of giving orders ("What happens if the list is empty?").
- Explain the *why* behind suggestions. Many of us are still learning.
- Separate must-fix problems from optional nitpicks (prefix nitpicks with "nit:").
- Check that the code is understandable, not just that it works.
## Code style
 
- **TypeScript** for the frontend and edge functions. It's JavaScript with types, which catches many mistakes (like a misspelled field name or a missing value) while you write the code instead of after it breaks. Using one language across the whole project also means anyone can work on either side.
- **Tailwind** utility classes for styling, built from reusable components.
- Design **mobile-first**: build the phone layout first, then add styles for larger screens. Most people will open shared wishlist links from a text or chat message on their phone, and we plan to ship as an installable web app (PWA). Tailwind is built this way too: unprefixed classes apply to phones, and prefixes like `md:` and `lg:` add changes for bigger screens.
- Prefer **clear and simple over clever**. Someone new should be able to read it.
- Comment the *reason* for non-obvious decisions, not what the code obviously does.
- Run the linter and formatter before pushing:
      npm run lint
      npm run format
 
  [Update these commands to match package.json.]
## Database changes
 
- **Never edit the database by hand in production.** All changes go through versioned migration files in the repo.
- Create migrations with the Supabase CLI and commit them with your PR.
- Test migrations against **staging** before they reach production.
- Don't rename or delete columns without discussing it first. Other people's work may depend on them.
## Permissions and security
 
Permissions are the most important part of this app. Wishlists reveal personal information, and gift claims must stay secret from the list owner.
 
- Permissions are enforced with **row-level security (RLS)** in the database, not just hidden in the UI.
- **Every RLS policy needs an automated test.** Any change to permissions needs a **second reviewer**.
- The rules that must never break:
  1. A list owner can never read claims on their own items.
  2. A shared list is visible only to permitted users or holders of its share token.
  3. Two gifters cannot claim the same item.
### Secrets
 
- **Never commit secrets.** `.env` is git-ignored. Only `.env.example` (placeholders only) is committed.
- **Never put API keys in frontend code.** Anything prefixed `VITE_` ships to the browser and is public.
- Retailer, LLM, and email (Resend) keys live in **Supabase secrets** and are used only inside edge functions.
- The Supabase **service role key** bypasses RLS. Never put it in a frontend `.env` or share it in chat.
- **If you accidentally commit a secret, tell a Team Lead right away.** Deleting it in a later commit does not remove it from Git history, so the key has to be replaced (rotated). Nobody gets in trouble for reporting a mistake quickly.
## Architecture rules
 
- The frontend talks **only to Supabase** (via `supabase-js`). Don't add a separate Express/API server between them.
- Anything that calls a retailer API, the LLM, or email goes in a **Supabase Edge Function**.
- Edge functions run on **Deno**, not Node, so some npm packages won't work.
- Each price source goes behind a small adapter with the same shape so retailers can be swapped easily.
- Ask before changing the data model or the tech stack. Open a discussion or ticket first.
## Testing
 
- RLS policies and product-matching logic **must** have automated tests.
- Add tests for any new logic that's easy to get wrong.
- Run tests before opening a PR:
      npm test
 
  [Update to match your test setup.]
## Legal and terms of service
 
- Don't scrape a retailer (automatically pulling data from its web pages) unless the team has reviewed its terms and `robots.txt`. Many retailers forbid it and block scrapers.
- Prefer **official APIs and affiliate feeds** instead. An affiliate feed is a stream of product data (names, prices, images, links) that a retailer provides to partners in its affiliate program. We get legitimate price data this way, and we earn a small commission when someone buys through our links.
- All outbound retailer links go through the affiliate redirect function so disclosure is consistent.
## Getting help
 
- Questions or blockers: [team-2 channel](https://discord.com/channels/1289776673453117480/1559728261251080325)
- Bugs or ideas: create a Jira ticket
- Security concerns: message a Team Lead directly rather than posting publicly
Thanks for contributing!
 
