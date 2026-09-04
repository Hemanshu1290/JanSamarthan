const fs = require("fs");
const path = require("path");

const NGOS_FILE = path.join(__dirname, "..", "data", "ngos.json");

function readNGOs() {
  const raw = fs.readFileSync(NGOS_FILE, "utf-8");
  return JSON.parse(raw);
}

function writeNGOs(ngos) {
  fs.writeFileSync(NGOS_FILE, JSON.stringify(ngos, null, 2), "utf-8");
}

module.exports = { readNGOs, writeNGOs };
