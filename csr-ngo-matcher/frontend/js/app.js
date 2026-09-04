const API_BASE = ""; // same origin, since backend serves this frontend

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

      ${
        showMatchScore
          ? `<div class="match-score-pill">🎯 ${ngo.matchScore}% Match</div>`
          : ""
      }

      <div class="breakdown-toggle" onclick="document.getElementById('bd_${uid}').classList.toggle('open')">
        View trust score breakdown ▾
      </div>
      <div class="breakdown-panel" id="bd_${uid}">
        ${renderBreakdown(ngo.trustBreakdown)}
        <div class="breakdown-row"><span>Years of Operation</span><strong>${ngo.yearsOfOperation}</strong></div>
        <div class="breakdown-row"><span>Typical Budget Range</span><strong>${formatCurrency(ngo.projectBudgetRange?.min)} - ${formatCurrency(ngo.projectBudgetRange?.max)}</strong></div>
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

  const requirement = {
    category: document.getElementById("reqCategory").value,
    location: {
      state: document.getElementById("reqState").value,
      city: document.getElementById("reqCity").value,
    },
    budget: document.getElementById("reqBudget").value
      ? Number(document.getElementById("reqBudget").value)
      : null,
    minTrustBand: document.getElementById("reqMinTrust").value || null,
  };

  try {
    const res = await fetch(`${API_BASE}/api/match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requirement),
    });
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      resultsEl.innerHTML = `<div class="empty-state">No matching NGOs found. Try loosening your filters.</div>`;
      return;
    }

    resultsEl.innerHTML = data.results.map((n) => ngoCardHTML(n, true)).join("");
  } catch (err) {
    resultsEl.innerHTML = `<div class="empty-state">Something went wrong. Is the backend server running?</div>`;
    console.error(err);
  }
});

// ---------- Register Form ----------
document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const feedback = document.getElementById("registerFeedback");
  feedback.textContent = "";

  const payload = {
    name: document.getElementById("regName").value,
    category: document
      .getElementById("regCategory")
      .value.split(",")
      .map((c) => c.trim())
      .filter(Boolean),
    location: {
      state: document.getElementById("regState").value,
      city: document.getElementById("regCity").value,
    },
    yearsOfOperation: Number(document.getElementById("regYears").value) || 0,
    registrationDetails: {
      is12A: document.getElementById("reg12A").checked,
      is80G: document.getElementById("reg80G").checked,
      isFCRA: document.getElementById("regFCRA").checked,
    },
    projectBudgetRange: {
      min: Number(document.getElementById("regBudgetMin").value) || 0,
      max: Number(document.getElementById("regBudgetMax").value) || 0,
    },
    financialTransparency: {
      hasAuditedReports: document.getElementById("regAudited").checked,
      lastAuditYear: document.getElementById("regAudited").checked
        ? new Date().getFullYear()
        : 0,
    },
    documents: {},
    pastProjects: [],
  };

  try {
    const res = await fetch(`${API_BASE}/api/ngos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      feedback.style.color = "#dc2626";
      feedback.textContent = data.error || "Registration failed.";
      return;
    }

    feedback.style.color = "#16a34a";
    feedback.textContent = `✅ ${data.name} registered! Initial trust score: ${data.trustScore}/100 (${data.trustBand}). Note: score will grow as you add project history.`;
    document.getElementById("registerForm").reset();
    loadDirectory();
  } catch (err) {
    feedback.style.color = "#dc2626";
    feedback.textContent = "Could not reach backend server.";
    console.error(err);
  }
});

// ---------- Init ----------
loadDirectory();
