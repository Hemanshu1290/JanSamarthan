const express = require("express");
const router = express.Router();
const { readJSON, writeJSON } = require("../utils/db");

const FILE = "requirements.json";

// GET /api/requirements?category=Education&postedBy=Government
router.get("/", (req, res) => {
  let requirements = readJSON(FILE);

  if (req.query.category) {
    requirements = requirements.filter((r) => r.category === req.query.category);
  }
  if (req.query.postedBy) {
    requirements = requirements.filter(
      (r) => r.postedBy.toLowerCase() === req.query.postedBy.toLowerCase()
    );
  }

  requirements = requirements.sort(
    (a, b) => new Date(b.datePosted) - new Date(a.datePosted)
  );

  res.json(requirements);
});

// GET /api/requirements/:id
router.get("/:id", (req, res) => {
  const requirements = readJSON(FILE);
  const item = requirements.find((r) => r.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Requirement not found" });
  res.json(item);
});

// POST /api/requirements - a Corporate or Government body posts a CSR requirement
router.post("/", (req, res) => {
  const body = req.body || {};

  if (!body.category || !body.orgName || !body.postedBy) {
    return res.status(400).json({ error: "orgName, postedBy, and category are required" });
  }
  if (!["Corporate", "Government"].includes(body.postedBy)) {
    return res.status(400).json({ error: "postedBy must be 'Corporate' or 'Government'" });
  }

  const requirements = readJSON(FILE);

  const newRequirement = {
    id: "req" + Date.now(),
    postedBy: body.postedBy,
    orgName: body.orgName,
    category: body.category,
    location: body.location || {},
    budget: body.budget || null,
    minTrustBand: body.minTrustBand || null,
    description: body.description || "",
    datePosted: new Date().toISOString(),
  };

  requirements.push(newRequirement);
  writeJSON(FILE, requirements);

  res.status(201).json(newRequirement);
});

module.exports = router;
