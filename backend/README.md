# Salesforce CRUD Backend (Node.js + Express)

OAuth 2.0 login and REST proxy for Salesforce standard objects: **Account**, **Opportunity**, **Lead**, **Contact**, and **Case**.

## Setup

1. Start **MongoDB** locally or set `MONGODB_URI` to MongoDB Atlas.

2. Check environment file and fill in Connected App credentials:

```bash
 .env
```

3. Seed field metadata (optional if backend auto-seeds on first start):

```bash
npm run seed
```

4. In Salesforce Setup, create an **External Client App** (Connected App):
   - Callback URL: `http://localhost:3000/api/auth/callback`
   - OAuth scopes: `api`, `refresh_token`, `offline_access` (or full access as allowed by your org)

5. Install and run:

```bash
npm install
npm run dev
```

Server: `http://localhost:3000`

## API

| Method | Path                                                             | Auth    | Description                       |
| ------ | ---------------------------------------------------------------- | ------- | --------------------------------- |
| GET    | `/health`                                                        | No      | Health check                      |
| GET    | `/api/auth/login`                                                | Session | Redirect to Salesforce OAuth      |
| GET    | `/api/auth/callback`                                             | Session | OAuth callback (browser)          |
| GET    | `/api/auth/me`                                                   | Session | `{ authenticated, instanceUrl? }` |
| POST   | `/api/auth/logout`                                               | Session | Clear session                     |
| GET    | `/api/salesforce/objects`                                        | Yes     | List object names                 |
| GET    | `/api/salesforce/objects/:objectName/fields`                     | Yes     | Field metadata (5–10 per object)  |
| GET    | `/api/salesforce/objects/:objectName/records?page=0&pageSize=20` | Yes     | Paginated list                    |
| GET    | `/api/salesforce/objects/:objectName/records/:id`                | Yes     | Single record                     |
| POST   | `/api/salesforce/objects/:objectName/records`                    | Yes     | Create                            |
| PATCH  | `/api/salesforce/objects/:objectName/records/:id`                | Yes     | Update                            |
| DELETE | `/api/salesforce/objects/:objectName/records/:id`                | Yes     | Delete                            |

Use `credentials: 'include'` from the frontend so the session cookie is sent.

## Notes

- **MongoDB** (`../database`): OAuth tokens, users, field UI config, audit logs, and Express sessions (`connect-mongo`).
- CRM **records** live in Salesforce, not in MongoDB.
- Pagination uses SOQL `LIMIT` / `OFFSET` with default **20** records per page.

See `../database/README.md` for collection details.
