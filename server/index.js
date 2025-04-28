const express = require("express");
const path = require("path");
const {
  initializeReader,
  getLatestUID,
  getScanHistory,
  clearHistory,
  refreshReaderLCD,
  getTapCounter,
  getUniqueUIDs,
  getUniqueUIDsCount,
} = require("../services/reader");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "../frontend")));

// API routes
app.get("/uid", (req, res) => {
  res.json({ uid: getLatestUID() });
});

app.get("/history", (req, res) => {
  res.json({ history: getScanHistory() });
});

app.post("/clear-history", (req, res) => {
  clearHistory();
  res.json({ message: "History cleared" });
});

app.post("/rescan", async (req, res) => {
  await refreshReaderLCD();
  res.json({ message: "Reader reset" });
});

app.get("/tap-counter", (req, res) => {
  res.json({ taps: getTapCounter() });
});

app.get("/unique-uids", (req, res) => {
  res.json({ unique: getUniqueUIDsCount(), list: getUniqueUIDs() });
});

// CSV Export route
app.get("/export-csv", (req, res) => {
  const uids = getUniqueUIDs();

  if (!uids.length) {
    return res.status(404).send("No UIDs available to export.");
  }

  const csvContent = "UID\n" + uids.join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="uids_export.csv"'
  );
  res.send(csvContent);
});

// Start server and reader
async function start() {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });

  await initializeReader();
}

start();
