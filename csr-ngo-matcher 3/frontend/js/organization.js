const API_BASE = ""; // same origin

// ---------- Helpers ----------
function formatCurrency(n) {
  if (!n && n !== 0) return "N/A";
  return "₹" + Number(n).toLocaleString("en-IN");
}

function renderBreakdown(breakdown) {
  const labels = {
    legalCompliance: "Legal Compliance (25)",
    experience: "Experience (15)",
    projectTrackRecord: "Project Track Record (25)",
    financialTransparency: "Financial Transparency (15)",
    impactDocumentation: "Impact Documentation (10)",
    corporateFeedback: "Corporate Feedback (10)",
  };
  return Object.entries(breakdown)
    .map(
      ([key, val]) =>
        `<div class="breakdown-row"><span>${labels[key] || key}</span><strong>${val}</strong></div>`
    )
    .join("");
}

function ngoCardHTML(ngo, showMatchScore = false) {
  const uid = ngo.id + "_" + Math.random().toString(36).slice(2, 7);
  return `
    <div class="ngo-card">
      <div class="ngo-card-header">
        <div>
          <div class="ngo-name">${ngo.name}</div>
          <div class="ngo-location">${ngo.location?.city || ""}${ngo.location?.city && ngo.location?.state ? ", " : ""}${ngo.location?.state || ""}</div>
        </div>
        <span class="trust-badge ${ngo.trustBand}">${ngo.trustBand} Trust</span>
      </div>

      <div class="ngo-tags">
        ${ngo.category.map((c) => `<span class="tag">${c}</span>`).join("")}
      </div>

      <div class="score-bar-wrap">
        <div class="score-bar-label"><span>Trust Score</span><span>${ngo.trustScore}/100</span></div>
        <div class="score-bar-track"><div class="score-bar-fill" style="width:${ngo.trustScore}%"></div></div>
      </div>

      ${showMatchScore ? `<div class="match-score-pill">🎯 ${ngo.matchScore}% Match</div>` : ""}

      <div class="breakdown-toggle" onclick="document.getElementById('bd_${uid}').classList.toggle('open')">
        View trust score breakdown ▾
      </div>
      <div class="breakdown-panel" id="bd_${uid}">
        ${renderBreakdown(ngo.trustBreakdown)}
        <div class="breakdown-row"><span>Years of Operation</span><strong>${ngo.yearsOfOperation}</strong></div>
        <div class="breakdown-row"><span>Typical Budget Range</span><strong>${formatCurrency(ngo.projectBudgetRange?.min)} - ${formatCurrency(ngo.projectBudgetRange?.max)}</strong></div>
        ${ngo.experienceStories && ngo.experienceStories.length ? `<div class="breakdown-row"><span>Past Experience Stories</span><strong>${ngo.experienceStories.length}</strong></div>` : ""}
        ${ngo.geotaggedPhotos && ngo.geotaggedPhotos.length ? `<div class="breakdown-row"><span>Field Photos Uploaded</span><strong>${ngo.geotaggedPhotos.length}</strong></div>` : ""}
      </div>
    </div>
  `;
}

// ---------- Directory ----------
async function loadDirectory() {
  const grid = document.getElementById("directoryGrid");
  grid.innerHTML = `<div class="empty-state">Loading NGOs...</div>`;
  try {
    const res = await fetch(`${API_BASE}/api/ngos`);
    const ngos = await res.json();
    document.getElementById("statNgoCount").textContent = ngos.length;

    if (ngos.length === 0) {
      grid.innerHTML = `<div class="empty-state">No NGOs registered yet.</div>`;
      return;
    }
    grid.innerHTML = ngos
      .sort((a, b) => b.trustScore - a.trustScore)
      .map((n) => ngoCardHTML(n, false))
      .join("");
  } catch (err) {
    grid.innerHTML = `<div class="empty-state">Could not load NGOs. Is the backend server running?</div>`;
    console.error(err);
  }
}

// ---------- Match Form ----------
document.getElementById("matchForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const resultsEl = document.getElementById("matchResults");
  resultsEl.innerHTML = `<div class="empty-state">Finding your best matches...</div>`;

  const posterType = document.querySelector('input[name="posterType"]:checked').value;

  const requirement = {
    postedBy: posterType,
    orgName: document.getElementById("reqOrgName").value,
    category: document.getElementById("reqCategory").value,
    location: {
      state: document.getElementById("reqState").value,
      city: document.getElementById("reqCity").value,
    },
    budget: document.getElementById("reqBudget").value
      ? Number(document.getElementById("reqBudget").value)
      : null,
    minTrustBand: document.getElementById("reqMinTrust").value || null,
    description: document.getElementById("reqDescription").value,
  };

  try {
    // 1. Get an instant ranked match
    const matchRes = await fetch(`${API_BASE}/api/match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requirement),
    });
    const data = await matchRes.json();

    if (!data.results || data.results.length === 0) {
      resultsEl.innerHTML = `<div class="empty-state">No matching NGOs found in this sector yet. Try a different focus area, or check back later.</div>`;
    } else {
      resultsEl.innerHTML = data.results.map((n) => ngoCardHTML(n, true)).join("");
    }

    // 2. Persist this as an open requirement so NGOs can discover & respond to it
    await fetch(`${API_BASE}/api/requirements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requirement),
    });
  } catch (err) {
    resultsEl.innerHTML = `<div class="empty-state">Something went wrong. Is the backend server running?</div>`;
    console.error(err);
  }
});

// ---------- Init ----------
loadDirectory();
