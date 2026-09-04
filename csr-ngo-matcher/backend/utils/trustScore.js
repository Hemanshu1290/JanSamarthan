const { getCategoryWeight } = require("./categoryWeights");

/**
 * TRUST SCORE ENGINE
 * ------------------------------------------------------------------
 * Produces a 0-100 score built from 6 weighted components:
 *
 *   1. Legal Compliance        (max 25)  -> 12A / 80G / FCRA registration
 *   2. Years of Operation      (max 15)  -> 1 point per year, capped at 15
 *   3. Project Track Record    (max 25)  -> completion rate, weighted by
 *                                           category risk (categoryWeights.js)
 *   4. Financial Transparency  (max 15)  -> audited reports + recency
 *   5. Impact Documentation    (max 10)  -> impact reports + beneficiaries reached
 *   6. Corporate Feedback      (max 10)  -> average rating from past CSR partners
 *
 * Bands:
 *   High   : score >= 80
 *   Medium : 50 <= score < 80
 *   Low    : score < 50
 * ------------------------------------------------------------------
 */

function scoreLegalCompliance(ngo) {
  const reg = ngo.registrationDetails || {};
  let score = 0;
  if (reg.is12A) score += 8;
  if (reg.is80G) score += 8;
  if (reg.isFCRA) score += 9;
  return Math.min(score, 25);
}

function scoreExperience(ngo) {
  return Math.min(ngo.yearsOfOperation || 0, 15);
}

function scoreTrackRecord(ngo) {
  const projects = ngo.pastProjects || [];
  if (projects.length === 0) return 0;

  const completed = projects.filter((p) => p.completionStatus === "completed").length;
  const completionRate = completed / projects.length;

  const avgCategoryWeight =
    projects.reduce((sum, p) => sum + getCategoryWeight(p.category), 0) / projects.length;

  const raw = completionRate * 25 * avgCategoryWeight;
  return Math.min(raw, 25);
}

function scoreFinancialTransparency(ngo) {
  const ft = ngo.financialTransparency || {};
  let score = 0;
  if (ft.hasAuditedReports) {
    score += 10;
    const yearsSinceAudit = new Date().getFullYear() - (ft.lastAuditYear || 0);
    if (yearsSinceAudit <= 1) score += 5;
    else if (yearsSinceAudit <= 2) score += 3;
    else if (yearsSinceAudit <= 4) score += 1;
  }
  return Math.min(score, 15);
}

function scoreImpactDocumentation(ngo) {
  let score = 0;
  if (ngo.documents && ngo.documents.impactReportUrl) score += 5;

  const totalBeneficiaries = (ngo.pastProjects || []).reduce(
    (sum, p) => sum + (p.beneficiariesReached || 0),
    0
  );
  if (totalBeneficiaries > 10000) score += 5;
  else if (totalBeneficiaries > 1000) score += 3;
  else if (totalBeneficiaries > 0) score += 1;

  return Math.min(score, 10);
}

function scoreCorporateFeedback(ngo) {
  const ratings = (ngo.pastProjects || [])
    .map((p) => p.corporateRating)
    .filter((r) => typeof r === "number");

  if (ratings.length === 0) return 0;
  const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length; // out of 5
  return (avg / 5) * 10;
}

function getBand(score) {
  if (score >= 80) return "High";
  if (score >= 50) return "Medium";
  return "Low";
}

function calculateTrustScore(ngo) {
  const legalScore = scoreLegalCompliance(ngo);
  const experienceScore = scoreExperience(ngo);
  const trackScore = scoreTrackRecord(ngo);
  const financeScore = scoreFinancialTransparency(ngo);
  const impactScore = scoreImpactDocumentation(ngo);
  const feedbackScore = scoreCorporateFeedback(ngo);

  const total = Math.round(
    legalScore + experienceScore + trackScore + financeScore + impactScore + feedbackScore
  );
  const finalScore = Math.min(total, 100);

  return {
    score: finalScore,
    band: getBand(finalScore),
    breakdown: {
      legalCompliance: Math.round(legalScore),
      experience: Math.round(experienceScore),
      projectTrackRecord: Math.round(trackScore),
      financialTransparency: Math.round(financeScore),
      impactDocumentation: Math.round(impactScore),
      corporateFeedback: Math.round(feedbackScore),
    },
  };
}

module.exports = { calculateTrustScore, getBand };
