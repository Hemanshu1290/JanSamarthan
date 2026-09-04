const express = require("express");
const cors = require("cors");
const path = require("path");

const ngoRoutes = require("./routes/ngos");
const matchRoutes = require("./routes/match");
const requirementRoutes = require("./routes/requirements");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
// Raised limit so base64-encoded geotagged photo uploads aren't rejected
app.use(express.json({ limit: "15mb" }));

// API routes
app.use("/api/ngos", ngoRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/requirements", requirementRoutes);

// Serve the frontend (plain HTML/CSS/JS, no build step needed)
const FRONTEND_DIR = path.join(__dirname, "..", "frontend");
app.use(express.static(FRONTEND_DIR));

app.get("/", (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, "index.html"));
});

app.listen(PORT, () => {
  console.log(`CSR-NGO Matcher server running at http://localhost:${PORT}`);
});
