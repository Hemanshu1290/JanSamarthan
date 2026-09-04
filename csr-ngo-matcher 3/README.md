# CSR-NGO Match

A CSR-to-NGO matching platform with **two separate portals**:

- **Organization Portal** (`organization.html`) — for Corporates and Government bodies to post a
  CSR requirement, browse the verified NGO directory, and get matched by sector + trust score.
- **NGO Portal** (`ngo-portal.html`) — for NGOs to register, upload geotagged photos of their
  field work, write up past funding/experience stories, and search open requirements posted by
  corporates and government bodies.

Every NGO is scored on a transparent **Trust Score** built from real track record — not just
category/location matching.

## Folder structure

```
csr-ngo-matcher/
├── backend/
│   ├── server.js              # Express app entry point
│   ├── package.json
│   ├── data/
│   │   ├── ngos.json          # 42 seeded NGOs across all 9 sectors
│   │   └── requirements.json  # Posted CSR requirements (starts empty)
│   ├── routes/
│   │   ├── ngos.js            # NGO CRUD + photo upload + story upload
│   │   ├── match.js           # POST matching endpoint
│   │   └── requirements.js    # Corporates/Govt post & NGOs search requirements
│   └── utils/
│       ├── db.js              # generic JSON read/write
│       ├── trustScore.js      # trust score calculation engine
│       ├── matcher.js         # requirement + trust -> ranked match list (hard-filters by sector)
│       └── categoryWeights.js # per-activity trust multipliers
└── frontend/
    ├── index.html              # Landing page — choose your portal
    ├── organization.html        # Corporate/Government portal
    ├── ngo-portal.html          # NGO portal
    ├── css/style.css
    └── js/
        ├── organization.js
        └── ngo-portal.js
```

## How to run (VS Code)

1. Open the `csr-ngo-matcher` folder in VS Code.
2. Open a terminal **inside `backend/`** — this is important, `package.json` lives there, not in
   the project root:
   ```
   cd backend
   npm install
   npm start
   ```
3. Open **http://localhost:5000** in your browser — the backend also serves the frontend.

If port 5000 is blocked (common on macOS due to AirPlay Receiver using it), run:
```
PORT=5050 npm start
```
and open `http://localhost:5050` instead — or turn off AirPlay Receiver in
System Settings → General → AirDrop & Handoff.

## What's in each portal

### Organization Portal (`organization.html`)
- Toggle: posting as **Corporate** or **Government**.
- Fill in focus area, location, budget, minimum trust band, and a description.
- Submitting both (a) instantly ranks matching NGOs, and (b) **persists the requirement** so it
  shows up in the NGO Portal's "Open Requirements" search.
- Browse the full NGO directory with live trust scores.

### NGO Portal (`ngo-portal.html`)
- **Register** your NGO (name, focus areas, location, years of operation, legal registration
  checkboxes, budget range, audit status).
- **Active NGO selector** at the top — since there's no login system, you pick which NGO you're
  acting as (remembered in the browser via `localStorage`).
- **Upload a geotagged photo**: choose a file, add a caption, and either enter lat/lng manually or
  click "Use My Current Location" (uses the browser's Geolocation API). Stored as base64 directly
  in `ngos.json` — no separate file storage needed for this scale.
- **Add a past experience story**: title, free-text story, year, related focus area.
- **Search open requirements**: filter by focus area and by Corporate/Government, see what's been
  posted by organizations.

Every photo and story you add feeds into that NGO's live Trust Score (Impact Documentation
component), so the score grows as the NGO documents more of its real work.

## Why every sector now shows different NGOs

Two bugs from the first version are fixed:

1. **`matcher.js` now hard-filters by category first.** Previously it scored every NGO regardless
   of sector and just re-sorted them — so all 8 NGOs appeared for every search. Now, if you search
   "Elderly Care", only NGOs whose `category` array includes "Elderly Care" are considered at all.
2. **The seed dataset grew from 8 NGOs (roughly one per sector) to 42**, spread 4-6 per sector, so
   results actually differ meaningfully between searches.

## How the Trust Score works

6 weighted components, 0–100 total (see `backend/utils/trustScore.js`):

| Factor | Max Points | Based on |
|---|---|---|
| Legal Compliance | 25 | 12A / 80G / FCRA registration |
| Years of Operation | 15 | 1 point per year, capped at 15 |
| Project Track Record | 25 | % of past projects completed, weighted by activity-category risk |
| Financial Transparency | 15 | Audited reports + how recent |
| Impact Documentation | 10 | Uploaded photos + published impact reports + beneficiaries reached |
| Corporate Feedback | 10 | Average rating from past CSR partners |

**Bands:** High (≥80), Medium (50–79), Low (<50).

`backend/utils/categoryWeights.js` applies a different trust multiplier per focus area to the
Project Track Record component only — e.g. Education/Healthcare sit at 1.0 (established
accountability norms), Disaster Relief at 0.75, Animal Welfare at 0.7 (harder to verify,
urgency-driven). Tune these freely in that one file.

## API Reference

- `GET /api/ngos` — list all NGOs with live-calculated trust scores.
- `GET /api/ngos/:id` — single NGO detail.
- `POST /api/ngos` — register a new NGO.
- `POST /api/ngos/:id/photos` — upload a geotagged photo. Body: `{ imageDataUrl, caption, lat, lng }`.
- `POST /api/ngos/:id/stories` — add a past experience story. Body: `{ title, story, year, category }`.
- `POST /api/match` — rank NGOs against a requirement (hard-filtered by category). Body:
  `{ category, location: {state, city}, budget, minTrustBand }`.
- `GET /api/requirements?category=X&postedBy=Corporate|Government` — search open requirements.
- `POST /api/requirements` — post a new requirement. Body:
  `{ postedBy: "Corporate"|"Government", orgName, category, location, budget, minTrustBand, description }`.

## Extending this

- Swap `data/*.json` for a real database (MongoDB/Postgres) by only rewriting `utils/db.js` —
  every route and the scoring/matching engine stay untouched.
- Add real authentication instead of the localStorage "active NGO" selector.
- Add a route for corporates to leave a rating on a completed project — that rating feeds directly
  into the Corporate Feedback trust component.
- Store uploaded photos as actual files (e.g. with `multer`) instead of base64-in-JSON once photo
  volume grows.
