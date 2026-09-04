const { calculateTrustScore } = require("./trustScore");

/**
 * MATCHING ENGINE
 * ------------------------------------------------------------------
 * Combines "requirement fit" with "trust score" into one matchScore (0-100):
 *
 *   Category match     -> 40 pts (does the NGO work in the requested focus area?)
 *   Location match     -> 20 pts (10 state + 10 city)
 *   Budget fit         -> 15 pts (does requested budget fall in NGO's typical range?)
 *   Trust score        -> 25 pts (scaled from the 0-100 trust score)
 *
 * A minTrustBand filter can hard-exclude NGOs below a chosen trust band,
 * e.g. a corporate can insist on "High" trust NGOs only.
 * ------------------------------------------------------------------
 */

function bandRank(band) {
  if (band === "High") return 3;
  if (band === "Medium") return 2;
  return 1;
}

function matchNGOs(requirement, ngos) {
  const results = ngos.map((ngo) => {
    const trust = calculateTrustScore(ngo);
    let matchScore = 0;

    // Category match (40 pts)
    if (requirement.category && ngo.category.includes(requirement.category)) {
      matchScore += 40;
    }

    // Location match (20 pts)
    if (requirement.location) {
      const reqState = (requirement.location.state || "").toLowerCase().trim();
      const reqCity = (requirement.location.city || "").toLowerCase().trim();
      const ngoState = (ngo.location?.state || "").toLowerCase().trim();
      const ngoCity = (ngo.location?.city || "").toLowerCase().trim();

      if (reqState && reqState === ngoState) matchScore += 10;
      if (reqCity && reqCity === ngoCity) matchScore += 10;
      if (!reqState && !reqCity) matchScore += 20; // no location preference given
    } else {
      matchScore += 20;
    }

    // Budget fit (15 pts)
    if (requirement.budget && ngo.projectBudgetRange) {
      const { min, max } = ngo.projectBudgetRange;
      if (requirement.budget >= min && requirement.budget <= max) {
        matchScore += 15;
      } else {
        matchScore += 5; // partial credit, outside ideal range
      }
    } else {
      matchScore += 10;
    }

    // Trust score contribution (25 pts, scaled)
    matchScore += (trust.score / 100) * 25;

    return {
      ...ngo,
      trustScore: trust.score,
      trustBand: trust.band,
      trustBreakdown: trust.breakdown,
      matchScore: Math.round(matchScore),
    };
  });

  const filtered = requirement.minTrustBand
    ? results.filter((r) => bandRank(r.trustBand) >= bandRank(requirement.minTrustBand))
    : results;

  return filtered.sort((a, b) => b.matchScore - a.matchScore);
}

module.exports = { matchNGOs };
