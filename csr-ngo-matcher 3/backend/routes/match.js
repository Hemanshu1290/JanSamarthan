const express = require("express");
const router = express.Router();
const { readNGOs } = require("../utils/db");
const { matchNGOs } = require("../utils/matcher");

// POST /api/match
// body: { category, location: {state, city}, budget, minTrustBand }
router.post("/", (req, res) => {
  const requirement = req.body || {};

  if (!requirement.category) {
    return res.status(400).json({ error: "category is required to match NGOs" });
  }

  const ngos = readNGOs();
  const results = matchNGOs(requirement, ngos);

  res.json({
    requirement,
    totalMatches: results.length,
    results,
  });
});

module.exports = router;
