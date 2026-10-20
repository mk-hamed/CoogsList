# CoogsList
 
A wishlist app that finds deals on the things you want, so friends and family can buy gifts without spoiling the surprise.
 
## What it does
 
- **Create wishlists** and add items by URL or manually.
- **Share lists** with friends or by link. Gifters don't need an account to view a list.
- **Claim items** so nobody double-buys. The list owner never sees what has been claimed.
- **Track prices** across retailers and get alerts when something drops, including a target price or percent drop you choose.
- **Follow a friend's list** and see deals on it.
What sets it apart: gifting and price tracking live in one product, and prices are judged in context ("lowest in 6 months"), not just reported.
 
## Project status
 
CoogsList is an academic-year team project, currently in early development.
 
| When | Milestone |
| :---- | :---- |
| Mid to late November 2026 | Showcase: sign up, create and share a wishlist, claim an item |
| May 2027 | Final presentation |
 
For the full plan, scope, and decisions, see the [project context](./docs/wishlist_project_context.md).
 
## Tech stack
 
| Layer | Technology |
| :---- | :---- |
| Frontend | React, Vite, TypeScript, Tailwind CSS |
| Hosting | Vercel |
| Backend | Supabase (auth, Postgres, row-level security, edge functions) |
| Email | Resend |
| Price data | Retailer and affiliate APIs |
 
The frontend talks directly to Supabase, and permissions are enforced in the database with row-level security.
 
## Getting started
 
New to the team? Follow these in order:
 
1. **[Development Quickstart Guide](./docs/QUICKSTART.md)**: get the app running on your machine.
2. **[Contributing Guide](./docs/CONTRIBUTING.md)**: how we use branches, pull requests, and code review.
3. **[Project Context](./docs/wishlist_project_context.md)**: what we're building and the decisions behind it.
## Team workflow
 
- Tickets are tracked in Jira: [link to Jira board].
- Day-to-day communication happens in [channel].
- Questions are always welcome. If you're stuck, ask.
## Security
 
Never commit secrets or API keys. If you think you've exposed one, tell [name] right away. See the [Contributing Guide](./docs/CONTRIBUTING.md#permissions-and-security) for details.
 
## Contributors
 
[Add team members here, or link to a contributors page.]
 
