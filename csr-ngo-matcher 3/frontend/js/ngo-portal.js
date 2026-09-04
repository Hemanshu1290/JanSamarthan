const API_BASE = "";
const ACTIVE_NGO_KEY = "csrmatch_active_ngo_id";

function formatCurrency(n) {
  if (!n && n !== 0) return "N/A";
  return "₹" + Number(n).toLocaleString("en-IN");
}

function getActiveNgoId() {
  return localStorage.getItem(ACTIVE_NGO_KEY) || "";
}
function setActiveNgoId(id) {
  localStorage.setItem(ACTIVE_NGO_KEY, id);
}

let allNgos = [];

// ---------- Active NGO selector ----------
async function loadNgoSelector() {
  const select = document.getElementById("activeNgoSelect");
  try {
    const res = await fetch(`${API_BASE}/api/ngos`);
    allNgos = await res.json();

    if (allNgos.length === 0) {
      select.innerHTML = `<option value="">No NGOs registered yet — register below</option>`;
      return;
    }

    select.innerHTML = allNgos
      .map((n) => `<option value="${n.id}">${n.name}</option>`)
      .join("");

    const savedId = getActiveNgoId();
    if (savedId && allNgos.some((n) => n.id === savedId)) {
      select.value = savedId;
    } else {
      setActiveNgoId(select.value);
    }

    renderActiveBadge();
    renderProfile();
  } catch (err) {
    select.innerHTML = `<option value="">Could not load NGOs</option>`;
    console.error(err);
  }
}

function renderActiveBadge() {
  const ngo = allNgos.find((n) => n.id === getActiveNgoId());
  const badgeEl = document.getElementById("activeNgoBadge");
  if (!ngo) {
    badgeEl.innerHTML = "";
    return;
  }
  badgeEl.innerHTML = `<span class="trust-badge ${ngo.trustBand}">${ngo.trustBand} Trust · ${ngo.trustScore}/100</span>`;
}

document.getElementById("activeNgoSelect").addEventListener("change", (e) => {
  setActiveNgoId(e.target.value);
  renderActiveBadge();
  renderProfile();
});

// ---------- Profile ----------
function renderProfile() {
  const card = document.getElementById("profileCard");
  const ngo = allNgos.find((n) => n.id === getActiveNgoId());

  if (!ngo) {
    card.innerHTML = `<div class="empty-state">Register your NGO below, or select one above, to see its profile here.</div>`;
    return;
  }

  const photosHTML = (ngo.geotaggedPhotos || [])
    .slice()
    .reverse()
    .map(
      (p) => `
      <div class="photo-thumb">
        <img src="${p.imageDataUrl}" alt="${p.caption || "NGO field photo"}" />
        <div class="photo-caption">${p.caption || ""}<br><small>📍 ${p.lat.toFixed(3)}, ${p.lng.toFixed(3)}</small></div>
      </div>`
    )
    .join("");

  const storiesHTML = (ngo.experienceStories || [])
    .slice()
    .reverse()
    .map(
      (s) => `
      <div class="story-item">
        <div class="story-title">${s.title} ${s.year ? `<span class="story-year">${s.year}</span>` : ""}</div>
        ${s.category ? `<span class="tag">${s.category}</span>` : ""}
        <p>${s.story}</p>
      </div>`
    )
    .join("");

  card.innerHTML = `
    <div class="card">
      <div class="ngo-card-header">
        <div>
          <div class="ngo-name">${ngo.name}</div>
          <div class="ngo-location">${ngo.location?.city || ""}${ngo.location?.city && ngo.location?.state ? ", " : ""}${ngo.location?.state || ""}</div>
        </div>
        <span class="trust-badge ${ngo.trustBand}">${ngo.trustBand} Trust</span>
      </div>

      <div class="ngo-tags">${ngo.category.map((c) => `<span class="tag">${c}</span>`).join("")}</div>

      <div class="score-bar-wrap">
        <div class="score-bar-label"><span>Trust Score</span><span>${ngo.trustScore}/100</span></div>
        <div class="score-bar-track"><div class="score-bar-fill" style="width:${ngo.trustScore}%"></div></div>
      </div>

      <div class="breakdown-panel open" style="margin-top:16px;">
        <div class="breakdown-row"><span>Legal Compliance (25)</span><strong>${ngo.trustBreakdown.legalCompliance}</strong></div>
        <div class="breakdown-row"><span>Experience (15)</span><strong>${ngo.trustBreakdown.experience}</strong></div>
        <div class="breakdown-row"><span>Project Track Record (25)</span><strong>${ngo.trustBreakdown.projectTrackRecord}</strong></div>
        <div class="breakdown-row"><span>Financial Transparency (15)</span><strong>${ngo.trustBreakdown.financialTransparency}</strong></div>
        <div class="breakdown-row"><span>Impact Documentation (10)</span><strong>${ngo.trustBreakdown.impactDocumentation}</strong></div>
        <div class="breakdown-row"><span>Corporate Feedback (10)</span><strong>${ngo.trustBreakdown.corporateFeedback}</strong></div>
      </div>
    </div>

    <div class="card" style="margin-top:20px;">
      <h4 style="margin-bottom:14px;">📸 Field Photos (${(ngo.geotaggedPhotos || []).length})</h4>
      <div class="photo-grid">${photosHTML || `<p class="empty-inline">No photos uploaded yet.</p>`}</div>
    </div>

    <div class="card" style="margin-top:20px;">
      <h4 style="margin-bottom:14px;">📝 Past Experience Stories (${(ngo.experienceStories || []).length})</h4>
      ${storiesHTML || `<p class="empty-inline">No stories added yet.</p>`}
    </div>
  `;
}

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
      lastAuditYear: document.getElementById("regAudited").checked ? new Date().getFullYear() : 0,
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
    feedback.textContent = `✅ ${data.name} registered! Initial trust score: ${data.trustScore}/100 (${data.trustBand}).`;
    document.getElementById("registerForm").reset();

    setActiveNgoId(data.id);
    await loadNgoSelector();
  } catch (err) {
    feedback.style.color = "#dc2626";
    feedback.textContent = "Could not reach backend server.";
    console.error(err);
  }
});

// ---------- Geolocation ----------
document.getElementById("useLocationBtn").addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Geolocation isn't supported in this browser. Enter coordinates manually.");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      document.getElementById("photoLat").value = pos.coords.latitude.toFixed(6);
      document.getElementById("photoLng").value = pos.coords.longitude.toFixed(6);
    },
    () => alert("Couldn't get your location. Enter coordinates manually.")
  );
});

// ---------- Photo Upload ----------
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

document.getElementById("photoForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const feedback = document.getElementById("photoFeedback");
  feedback.textContent = "";

  const ngoId = getActiveNgoId();
  if (!ngoId) {
    feedback.style.color = "#dc2626";
    feedback.textContent = "Select or register an NGO first.";
    return;
  }

  const file = document.getElementById("photoFile").files[0];
  if (!file) {
    feedback.style.color = "#dc2626";
    feedback.textContent = "Choose a photo to upload.";
    return;
  }

  try {
    const imageDataUrl = await fileToDataUrl(file);
    const res = await fetch(`${API_BASE}/api/ngos/${ngoId}/photos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageDataUrl,
        caption: document.getElementById("photoCaption").value,
        lat: document.getElementById("photoLat").value,
        lng: document.getElementById("photoLng").value,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      feedback.style.color = "#dc2626";
      feedback.textContent = data.error || "Upload failed.";
      return;
    }

    feedback.style.color = "#16a34a";
    feedback.textContent = "✅ Photo uploaded.";
    document.getElementById("photoForm").reset();
    await loadNgoSelector();
  } catch (err) {
    feedback.style.color = "#dc2626";
    feedback.textContent = "Something went wrong uploading the photo.";
    console.error(err);
  }
});

// ---------- Story Form ----------
document.getElementById("storyForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const feedback = document.getElementById("storyFeedback");
  feedback.textContent = "";

  const ngoId = getActiveNgoId();
  if (!ngoId) {
    feedback.style.color = "#dc2626";
    feedback.textContent = "Select or register an NGO first.";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/ngos/${ngoId}/stories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: document.getElementById("storyTitle").value,
        story: document.getElementById("storyText").value,
        year: document.getElementById("storyYear").value ? Number(document.getElementById("storyYear").value) : null,
        category: document.getElementById("storyCategory").value || null,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      feedback.style.color = "#dc2626";
      feedback.textContent = data.error || "Could not add story.";
      return;
    }

    feedback.style.color = "#16a34a";
    feedback.textContent = "✅ Story added.";
    document.getElementById("storyForm").reset();
    await loadNgoSelector();
  } catch (err) {
    feedback.style.color = "#dc2626";
    feedback.textContent = "Something went wrong adding the story.";
    console.error(err);
  }
});

// ---------- Open Requirements Search ----------
function requirementCardHTML(req) {
  const posterEmoji = req.postedBy === "Government" ? "🏛️" : "🏢";
  return `
    <div class="ngo-card">
      <div class="ngo-card-header">
        <div>
          <div class="ngo-name">${posterEmoji} ${req.orgName}</div>
          <div class="ngo-location">${req.location?.city || ""}${req.location?.city && req.location?.state ? ", " : ""}${req.location?.state || ""}</div>
        </div>
        <span class="trust-badge ${req.postedBy === "Government" ? "Medium" : "High"}">${req.postedBy}</span>
      </div>
      <div class="ngo-tags"><span class="tag">${req.category}</span></div>
      ${req.budget ? `<p style="font-size:0.9rem; margin-bottom:8px;"><strong>Budget:</strong> ${formatCurrency(req.budget)}</p>` : ""}
      ${req.minTrustBand ? `<p style="font-size:0.9rem; margin-bottom:8px;"><strong>Requires:</strong> ${req.minTrustBand}+ trust NGOs</p>` : ""}
      ${req.description ? `<p style="font-size:0.9rem; color:var(--text-muted);">${req.description}</p>` : ""}
      <p style="font-size:0.75rem; color:var(--text-muted); margin-top:10px;">Posted ${new Date(req.datePosted).toLocaleDateString()}</p>
    </div>
  `;
}

async function loadRequirements() {
  const grid = document.getElementById("requirementsGrid");
  grid.innerHTML = `<div class="empty-state">Loading requirements...</div>`;

  const category = document.getElementById("filterCategory").value;
  const postedBy = document.getElementById("filterPostedBy").value;

  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (postedBy) params.set("postedBy", postedBy);

  try {
    const res = await fetch(`${API_BASE}/api/requirements?${params.toString()}`);
    const requirements = await res.json();

    if (requirements.length === 0) {
      grid.innerHTML = `<div class="empty-state">No open requirements match this filter yet.</div>`;
      return;
    }
    grid.innerHTML = requirements.map(requirementCardHTML).join("");
  } catch (err) {
    grid.innerHTML = `<div class="empty-state">Could not load requirements.</div>`;
    console.error(err);
  }
}

document.getElementById("filterCategory").addEventListener("change", loadRequirements);
document.getElementById("filterPostedBy").addEventListener("change", loadRequirements);

// ---------- Init ----------
loadNgoSelector();
loadRequirements();
