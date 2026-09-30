# Salesforce CRUD Frontend (React + Vite)

React UI for the CloudVandana-style assignment. Talks to the Express backend only (OAuth and Salesforce API stay on the server).

## Setup

1. Check env file:

```bash
 .env
```

Default API URL: `http://localhost:3000`

2. Start the **backend** first (see `../backend/README.md`), with Connected App callback  
   `http://localhost:3000/api/auth/callback` and CORS origin `http://localhost:5173`.

3. Install and run:

```bash
npm install
npm run dev
```

Open `http://localhost:5173`

## Features

- Login to Salesforce via backend OAuth (`credentials: 'include'` session cookie)
- Dropdown: Account, Opportunity, Lead, Contact, Case
- Dynamic columns from backend field config
- View / Create / Edit / Delete modals
- Infinite scroll: 20 records per page, loads next page at scroll end

## Build

```bash
npm run build
npm run preview
```

Set `VITE_API_URL` to your backend URL when not using localhost.
