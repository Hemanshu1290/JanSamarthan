# JanSamarthan.AI 🚀

> **AI-Powered Government & CSR Grant Verification & Real-Time Escrow Disbursement System**

JanSamarthan.AI is an end-to-end platform designed to automate government and CSR grant distribution to grassroots NGOs across India. By replacing manual auditing with real-time EXIF timestamp checking, GPS geofencing telemetry, NITI Aayog Darpan cross-verification, and CAG-logged escrow releases, JanSamarthan.AI guarantees zero unverified payouts and complete budget transparency.

---

## 💡 What It Does & How It Works

### Core Functionality
* **Grassroots Scheme Matching:** Instantly matches government scheme requirements (Food, Clean Water, Literacy, Healthcare) with vetted, NITI Aayog Darpan-registered NGOs.
* **Ground-Proof Fraud Interception:** Analyzes uploaded field photo metadata to catch duplicate claims, off-site uploads, and old photo reuse before funds are released.
* **Automated Escrow Pipeline:** Releases funds in milestone tranches (**30% Advance → 40% Mid-Proof → 30% Final Audit**) tied directly to verified field updates.
* **CAG Audit Trail Generation:** Automatically generates an immutable Comptroller and Auditor General (CAG) reference log (`CAG-2026-XXXX`) for every released grant tranche.

### System Verification Architecture
[1. Scheme Allocation] ──> [2. Field Proof Upload] ──> [3. Integrity Guard Engine] ──> [4. CAG Escrow Release]
       (Darpan ID)              (EXIF + GPS)             (Geofence & Metadata)          (Automated Tranche)

Partner Selection: Officers choose a grassroots partner based on CAG rating, SROI impact cost, and location.

Ground Proof Submission: Field teams submit photo evidence for their active grant milestone.

Automated Verification: The engine validates whether the photo was taken inside the authorized GPS coordinates and within 48 hours.

Grant Disbursement: Validated claims unlock the corresponding escrow percentage with an official CAG audit reference.

🛠 Tech Stack
Framework: Next.js 14+ (App Router, TypeScript)

Styling: Tailwind CSS

State & Forms: React (useState, useEffect) & Web Native FormData

Version Control: Git & GitHub

jansamarthan-ai/
├── app/
│   ├── api/
│   │   └── gov-audit/
│   │       └── route.ts          # Backend POST handler for EXIF verification & CAG logging
│   ├── favicon.ico
│   ├── globals.css               # Tailwind CSS directives & global dark theme styles
│   ├── layout.tsx                # App shell containing top navigation bar
│   └── page.tsx                  # Executive dashboard component integration
├── components/
│   ├── EscrowAuditForm.tsx       # Photo proof submission & escrow tranche authorization form
│   ├── IntegrityStream.tsx       # Real-time fraud detection & geofence alert stream
│   ├── KpiCards.tsx              # Top-level executive metrics overview cards
│   ├── NgoTable.tsx              # Grassroots partner search & allocation table
│   └── TelemetryMap.tsx          # Geo-spatial ground proof visualizer map
├── data/
│   └── ngos.ts                   # Master database array of verified NGOs & preset options
├── lib/
│   ├── audit.ts                  # CAG log reference generator & tranche disbursement logic
│   └── exif.ts                   # EXIF metadata, timestamp & GPS coordinate parser helpers
├── types/
│   └── index.ts                  # Shared TypeScript interfaces (Ngo, AuditResult, FraudLog)
├── public/
│   ├── favicon.png
│   └── markers/                  # Map marker assets
├── .gitignore
├── next.config.js
├── package.json
└── README.md

Clone the Repository:

Bash
git clone [https://github.com/YOUR-USERNAME/jansamarthan-ai.git](https://github.com/YOUR-USERNAME/jansamarthan-ai.git)
cd jansamarthan-ai
Install Dependencies:

Bash
npm install
Start the Development Server:

Bash
npm run dev
Access the Application:
Open your browser and navigate to http://localhost:3000

