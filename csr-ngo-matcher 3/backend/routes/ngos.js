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
    geotaggedPhotos: [],
    experienceStories: [],
  };

  ngos.push(newNGO);
  writeNGOs(ngos);

  const trust = calculateTrustScore(newNGO);
  res.status(201).json({ ...newNGO, trustScore: trust.score, trustBand: trust.band, trustBreakdown: trust.breakdown });
});

// POST /api/ngos/:id/photos - upload a geotagged photo (base64 image + lat/lng + caption)
router.post("/:id/photos", (req, res) => {
  const ngos = readNGOs();
  const ngo = ngos.find((n) => n.id === req.params.id);
  if (!ngo) return res.status(404).json({ error: "NGO not found" });

  const { imageDataUrl, caption, lat, lng } = req.body || {};
  if (!imageDataUrl) {
    return res.status(400).json({ error: "imageDataUrl is required" });
  }
  if (lat === undefined || lng === undefined || lat === null || lng === null) {
    return res.status(400).json({ error: "lat and lng are required to geotag the photo" });
  }

  if (!ngo.geotaggedPhotos) ngo.geotaggedPhotos = [];
  const photo = {
    id: "photo" + Date.now(),
    imageDataUrl,
    caption: caption || "",
    lat: Number(lat),
    lng: Number(lng),
    uploadedAt: new Date().toISOString(),
  };
  ngo.geotaggedPhotos.push(photo);
  writeNGOs(ngos);

  res.status(201).json(photo);
});

// POST /api/ngos/:id/stories - add a past experience / funding story
router.post("/:id/stories", (req, res) => {
  const ngos = readNGOs();
  const ngo = ngos.find((n) => n.id === req.params.id);
  if (!ngo) return res.status(404).json({ error: "NGO not found" });

  const { title, story, year, category } = req.body || {};
  if (!title || !story) {
    return res.status(400).json({ error: "title and story are required" });
  }

  if (!ngo.experienceStories) ngo.experienceStories = [];
  const entry = {
    id: "story" + Date.now(),
    title,
    story,
    year: year || null,
    category: category || null,
    postedAt: new Date().toISOString(),
  };
  ngo.experienceStories.push(entry);
  writeNGOs(ngos);

  res.status(201).json(entry);
});

module.exports = router;
