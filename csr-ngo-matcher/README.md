# CSR-NGO Match

A CSR-to-NGO matching platform. Corporates describe their CSR requirement (focus area, location,
budget, minimum trust level) and the engine ranks NGOs by a combination of **requirement fit** and
a **Trust Score** computed from each NGO's real track record.

## Folder structure

```
csr-ngo-matcher/
├── backend/
│   ├── server.js              # Express app entry point
│   ├── package.json
│   ├── data/
│   │   └── ngos.json          # NGO data store (flat JSON file, 8 seeded NGOs)
│   ├── routes/
│   │   ├── ngos.js            # GET/POST NGO endpoints
│   │   └── match.js           # POST matching endpoint
│   └── utils/
│       ├── db.js              # read/write ngos.json
│       ├── trustScore.js      # trust score calculation engine
│       ├── matcher.js         # requirement + trust -> ranked match list
│       └── categoryWeights.js # per-activity trust multipliers
└── frontend/
    ├── index.html
    ├── css/style.css
    └── js/app.js               # plain JS, calls the backend API via fetch
```

## How to run (VS Code)

1. Open the `csr-ngo-matcher` folder in VS Code.
2. Open a terminal in `backend/`:
   ```
   cd backend
   npm install
   npm start
   ```
3. Open your browser at **http://localhost:5000** — the backend also serves the frontend, so
   there's nothing separate to run for the UI.

The server listens on port 5000 by default (set `PORT` env var to change it).

## How the Trust Score works

Each NGO gets a 0–100 score from 6 weighted components (see `backend/utils/trustScore.js`):

| Factor | Max Points | Based on |
|---|---|---|
| Legal Compliance | 25 | 12A / 80G / FCRA registration |
| Years of Operation | 15 | 1 point per year, capped at 15 |
| Project Track Record | 25 | % of past projects completed, weighted by activity-category risk |
| Financial Transparency | 15 | Audited reports + how recent |
| Impact Documentation | 10 | Published impact reports + beneficiaries reached |
| Corporate Feedback | 10 | Average rating from past CSR partners |

**Bands:** High (≥80), Medium (50–79), Low (<50).

### Why some activities score differently

`backend/utils/categoryWeights.js` defines a trust multiplier per focus area, applied to the
Project Track Record component only:

- **Education / Healthcare** → 1.0 (established audit & reporting norms)
- **Skill Development / Child Welfare** → 0.95
- **Women Empowerment** → 0.9
- **Environment / Elderly Care** → 0.85
- **Disaster Relief** → 0.75 (urgency-driven, harder to verify)
- **Animal Welfare** → 0.7

An NGO isn't penalized just for working in a "harder to verify" category — it just needs a cleaner
completion record to reach the same score. Tune these numbers freely in that one file.

## API Reference

- `GET /api/ngos` — list all NGOs with live-calculated trust scores.
- `GET /api/ngos/:id` — single NGO detail.
- `POST /api/ngos` — register a new NGO. Body: `{ name, category[], location, yearsOfOperation, registrationDetails, projectBudgetRange, financialTransparency, documents, pastProjects[] }`.
- `POST /api/match` — rank NGOs against a requirement. Body: `{ category, location: {state, city}, budget, minTrustBand }`.

## Extending this

- Swap `data/ngos.json` for a real database (MongoDB/Postgres) by only rewriting `utils/db.js` —
  every route and the scoring/matching engine stay untouched.
- Add authentication for corporates/NGOs before allowing writes.
- Add a route for corporates to leave a rating on a completed project — that rating feeds directly
  into the Corporate Feedback trust component.
