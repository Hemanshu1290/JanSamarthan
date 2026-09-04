const express = require("express");
const router = express.Router();
const { readNGOs, writeNGOs } = require("../utils/db");
const { calculateTrustScore } = require("../utils/trustScore");

// GET /api/ngos - list all NGOs with trust score attached
router.get("/", (req, res) => {
  const ngos = readNGOs();
  const withScores = ngos.map((ngo) => {
    const trust = calculateTrustScore(ngo);
    return { ...ngo, trustScore: trust.score, trustBand: trust.band, trustBreakdown: trust.breakdown };
  });
  res.json(withScores);
});

// GET /api/ngos/:id - single NGO detail
router.get("/:id", (req, res) => {
  const ngos = readNGOs();
  const ngo = ngos.find((n) => n.id === req.params.id);
  if (!ngo) return res.status(404).json({ error: "NGO not found" });
  const trust = calculateTrustScore(ngo);
  res.json({ ...ngo, trustScore: trust.score, trustBand: trust.band, trustBreakdown: trust.breakdown });
});

// POST /api/ngos - register a new NGO
router.post("/", (req, res) => {
  const ngos = readNGOs();
  const body = req.body;

  if (!body.name || !body.category || !Array.isArray(body.category)) {
    return res.status(400).json({ error: "name and category[] are required" });
  }

  const newNGO = {
    id: "ngo" + Date.now(),
    name: body.name,
    category: body.category,
    location: body.location || {},
    yearsOfOperation: Number(body.yearsOfOperation) || 0,
    registrationDetails: body.registrationDetails || {},
    projectBudgetRange: body.projectBudgetRange || { min: 0, max: 0 },
    financialTransparency: body.financialTransparency || {},
    documents: body.documents || {},
    pastProjects: body.pastProjects || [],
  };

  ngos.push(newNGO);
  writeNGOs(ngos);

  const trust = calculateTrustScore(newNGO);
  res.status(201).json({ ...newNGO, trustScore: trust.score, trustBand: trust.band, trustBreakdown: trust.breakdown });
});

module.exports = router;
