# Development Quickstart Guide

Follow these steps to get the project running on your machine.

## Prerequisites
- [Git](https://git-scm.com/downloads)
- [Node.js](https://nodejs.org) (LTS version)
- A code editor (we recommend VS Code)
- A GitHub account with access to this repository

## 1. Clone the repository
Open a terminal (Terminal on Mac, Git Bash or PowerShell on Windows), go to
the folder where you keep your projects, and run:

    git clone https://github.com/mk-hamed/CoogsList.git
    cd CoogsList

Git creates the `CoogsList` folder for you, so you don't need to make one first.

## 2. Install dependencies
    npm install

## 3. Set up environment variables
    cp .env.example .env

Ask a Team Lead for the Supabase dev keys and paste them into `.env`.
Never commit this file.

## 4. Run the app
    npm run dev

Open the URL shown in the terminal (usually http://localhost:5173).

## 5. Make your first change
    git checkout -b your-name/first-change

See CONTRIBUTING.md for how to open a pull request.

## Stuck?
Post in [team-2 channel](https://discord.com/channels/1289776673453117480/1559728261251080325) with the error message and which step you were on.
