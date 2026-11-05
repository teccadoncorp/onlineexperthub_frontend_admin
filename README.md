# Online Expert Hub admin

Admin desk for shops, experts, service requests, the ledger, news, and tutorials. It is a separate Next.js app from the public site and shop desk.

English is the default language. Bengali is served under `/bn`.

## Run locally

```bash
cp .env.example .env
npm install
npm run dev
```

Open `http://localhost:3001`.

| Variable | Purpose |
|---|---|
| `API_URL` | Backend base URL: `https://api-onlineexpert.teccadon.com`. |
| `AUTH_SECRET` | Must match the backend and the shop frontend. |
| `SHOP_URL` | Shop site origin. Non-admin sessions are sent here. |

Sign in with the admin phone configured on the API. Do not commit `.env`.

## Scripts

- `npm run dev` starts the dev server on port 3001
- `npm run build` builds the production app
- `npm start` serves the production build on port 3001
