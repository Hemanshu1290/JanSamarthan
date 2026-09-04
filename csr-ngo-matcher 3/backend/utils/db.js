const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");

function readJSON(fileName) {
  const filePath = path.join(DATA_DIR, fileName);
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw || "[]");
}

function writeJSON(fileName, data) {
  const filePath = path.join(DATA_DIR, fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// Convenience wrappers kept for existing NGO code
const readNGOs = () => readJSON("ngos.json");
const writeNGOs = (data) => writeJSON("ngos.json", data);

module.exports = { readJSON, writeJSON, readNGOs, writeNGOs };
