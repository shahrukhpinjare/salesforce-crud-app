# Salesforce CRUD App

A full-stack app for managing Salesforce **Account**, **Opportunity**, **Lead**, **Contact**, and **Case** records. Sign in with Salesforce OAuth 2.0, then view, create, update, and delete records through a React dashboard.

## Architecture

- **Frontend:** React and Vite. Displays the login screen, dashboard, dynamic forms, and paginated records table.
- **Backend:** Node.js and Express. Handles Salesforce OAuth, manages sessions, validates requests, and proxies Salesforce REST API calls.
- **Database:** MongoDB with Mongoose. Stores app users, OAuth tokens, field configuration, audit logs, and Express sessions. CRM records remain in Salesforce.

## Features

- Salesforce OAuth 2.0 login with state validation and PKCE.
- CRUD operations for five standard Salesforce objects.
- Configurable field metadata, with default definitions seeded into MongoDB.
- Paginated record loading and infinite scrolling.
- OAuth token refresh and session-based authentication.
- Audit logging for login, logout, and record operations.

## Requirements

- Node.js 18 or later
- MongoDB local instance or MongoDB Atlas cluster
- A Salesforce org and an OAuth-enabled Connected App (or External Client App)

## Setup

### 1. Configure Salesforce OAuth

Create or configure a Salesforce OAuth app with these local development values:

- Callback URL: `http://localhost:3000/api/auth/callback`
- OAuth scopes: `api`, `refresh_token`, and `offline_access`

### 2. Configure environment variables

Create `backend/.env`:

```env
PORT=3000
SESSION_SECRET=replace-with-a-long-random-secret
MONGODB_URI=mongodb://127.0.0.1:27017/salesforce_crud
FRONTEND_URL=http://localhost:5173

SF_CLIENT_ID=your-salesforce-client-id
SF_CLIENT_SECRET=your-salesforce-client-secret
SF_CALLBACK_URL=http://localhost:3000/api/auth/callback
SF_LOGIN_URL=https://login.salesforce.com
SF_API_VERSION=59.0
```

For a Salesforce sandbox, use `https://test.salesforce.com` for `SF_LOGIN_URL`.

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

Keep real credentials private. The `.env` files are ignored by Git; do not commit secrets or put the Salesforce client secret in frontend variables.

### 3. Install dependencies

Run these commands from the repository root:

```bash
npm install --prefix database
npm install --prefix backend
npm install --prefix frontend
```

### 4. Start the app

Start MongoDB, then run the backend and frontend in separate terminals from the repository root:

```bash
npm --prefix backend run dev
```

```bash
npm --prefix frontend run dev
```

Open `http://localhost:5173`. The backend is available at `http://localhost:3000`.

The backend seeds default field configurations on startup if they are missing. To seed them manually:

```bash
npm --prefix backend run seed
```

## API Overview

| Method   | Endpoint                                                         | Purpose                             |
| -------- | ---------------------------------------------------------------- | ----------------------------------- |
| `GET`    | `/health`                                                        | Backend and database health status  |
| `GET`    | `/api/auth/login`                                                | Start Salesforce OAuth login        |
| `GET`    | `/api/auth/callback`                                             | Handle Salesforce OAuth callback    |
| `GET`    | `/api/auth/me`                                                   | Check current authentication status |
| `POST`   | `/api/auth/logout`                                               | Clear the current session           |
| `GET`    | `/api/salesforce/objects`                                        | List supported Salesforce objects   |
| `GET`    | `/api/salesforce/objects/:objectName/fields`                     | Get configured fields for an object |
| `GET`    | `/api/salesforce/objects/:objectName/records?page=0&pageSize=20` | Fetch a page of records             |
| `GET`    | `/api/salesforce/objects/:objectName/records/:id`                | Fetch one record                    |
| `POST`   | `/api/salesforce/objects/:objectName/records`                    | Create a record                     |
| `PATCH`  | `/api/salesforce/objects/:objectName/records/:id`                | Update a record                     |
| `DELETE` | `/api/salesforce/objects/:objectName/records/:id`                | Delete a record                     |

Salesforce API routes require an authenticated session. The frontend sends the session cookie with API requests.

## Production Build

Build the frontend with:

```bash
npm --prefix frontend run build
```

For deployment, set production environment variables in the hosting provider, update the Salesforce callback URL, set `FRONTEND_URL` and `VITE_API_URL` to the deployed origins, and configure secure session cookies for HTTPS. Never commit production secrets.

## Package Documentation

- [Backend setup and API details](backend/README.md)
- [Database collections and seed data](database/README.md)
- [Frontend setup and features](frontend/README.md)
