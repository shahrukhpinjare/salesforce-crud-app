# MongoDB database layer

MongoDB stores **app metadata and auth state** for the Salesforce CRUD project. CRM records (Account, Opportunity, etc.) remain in **Salesforce**; this database does not mirror those rows.

## Collections

| Collection           | Purpose                                                          |
| -------------------- | ---------------------------------------------------------------- |
| `users`              | Salesforce user identity (`salesforceUserId`, email, last login) |
| `oauthtokens`        | OAuth access/refresh tokens keyed by Express `sessionId`         |
| `objectfieldconfigs` | Which 5–10 fields to show per standard object                    |
| `auditlogs`          | Login/logout and CRUD audit trail                                |
| `sessions`           | Express sessions (via `connect-mongo`, created by backend)       |

## Setup

1. Install MongoDB locally or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier.

2. Check env:

```bash
 .env
```

Example:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/salesforce_crud_xxxxx
```

3. Install dependencies and seed field metadata:

```bash
npm install
npm run seed
```

The backend uses the same `MONGODB_URI` (set in `backend/.env`).

## Seed data

`npm run seed` upserts field definitions for:

- Account, Opportunity, Lead, Contact, Case

Source: `src/seed/fieldConfigData.js`

## Use from backend

```js
const db = require('../../database/src/index');
await db.connectDatabase(process.env.MONGODB_URI);
await db.repositories.oauthTokenRepository.upsertBySessionId(sessionId, { ... });
```

See `backend/README.md` for full run instructions.
