/**
 * CATEGORY WEIGHTS
 * ------------------------------------------------------------------
 * Every CSR focus area carries a different baseline "trust multiplier".
 * This reflects real-world accountability standards for that sector:
 *  - Education / Healthcare have long-established audit & reporting norms
 *    -> higher trust ceiling
 *  - Disaster Relief / Animal Welfare are harder to verify in the field,
 *    funds move fast under emotional urgency, so they start lower
 *    unless the NGO proves a strong track record.
 *
 * These multipliers are applied to the "Project Track Record" component
 * of the trust score (see trustScore.js), NOT to the whole score —
 * so a disaster-relief NGO with a flawless record can still score High,
 * it just needs to earn it more explicitly.
 * ------------------------------------------------------------------
 */

const CATEGORY_WEIGHTS = {
  "Education": 1.0,
  "Healthcare": 1.0,
  "Skill Development": 0.95,
  "Child Welfare": 0.95,
  "Women Empowerment": 0.9,
  "Environment": 0.85,
  "Elderly Care": 0.85,
  "Disaster Relief": 0.75,
  "Animal Welfare": 0.7,
};

const DEFAULT_WEIGHT = 0.8;

function getCategoryWeight(category) {
  return CATEGORY_WEIGHTS[category] ?? DEFAULT_WEIGHT;
}

module.exports = { CATEGORY_WEIGHTS, getCategoryWeight };
