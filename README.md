<p align="center">
  <img src="public/logo.png" alt="Teams Management" width="120">
</p>

<h1 align="center">University Assignments Teams Management</h1>

<p align="center">
  A web platform where university students can browse assignments, form teams, and collaborate through real-time messaging. Built with Rails 8.1 and Hotwire.
</p>

## Features

- **Assignments** — browse, filter by subject/status, and post assignments
- **Teams** — request to join assignments, form teams with other students
- **Real-time messaging** — direct messages and team group chats via ActionCable
- **Typing indicators & read receipts** — live updates in conversations
- **Google OAuth** — sign in with university Google accounts
- **User profiles** — view bios, departments, and contact info

## Tech Stack

- Ruby 4.0.1 / Rails 8.1.2
- SQLite3 (with Solid Cache, Solid Queue, Solid Cable)
- Tailwind CSS 4.4
- Hotwire (Turbo + Stimulus)
- Devise + OmniAuth (Google OAuth2)
- Importmap (no Node.js required)

## Getting Started

### Prerequisites

- Ruby 4.0.1
- SQLite3
- Bundler

### Setup

```bash
bundle install
bin/rails db:prepare
```

Create a `.env` file in the project root with your Google OAuth credentials:

```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

### Run

```bash
bin/dev
```

This starts the Rails server and Tailwind CSS watcher. Visit `http://localhost:3000`.

## Docker

### Build & Run

```bash
docker build -t teams-management .
docker run -d \
  --name teams-management \
  -p 3636:80 \
  -v teams-management-storage:/rails/storage \
  -e RAILS_MASTER_KEY=<your master key> \
  -e GOOGLE_CLIENT_ID=<your client id> \
  -e GOOGLE_CLIENT_SECRET=<your client secret> \
  teams-management:latest
```

The app will be available at `http://localhost:3636`. The named volume persists the SQLite databases across container restarts.

### Stop

```bash
docker stop teams-management && docker rm teams-management
```

## Deployment

Automated deployment via GitHub Actions on push to `master`. The workflow builds a Docker image, transfers it to the server over SSH (proxied through Cloudflare Tunnel), and runs it with a persistent storage volume.

Required GitHub secrets: `RAILS_MASTER_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SERVER_SSH_KEY`, `SERVER_USER`, `CF_SSH_HOSTNAME`, `CF_ACCESS_CLIENT_ID`, `CF_ACCESS_CLIENT_SECRET`

## Tests

```bash
bin/rails test
```
