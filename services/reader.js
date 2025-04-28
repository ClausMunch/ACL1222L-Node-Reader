// reader.js
const reader = require("acr1222l");
const util = require("util");
const child_process = require("child_process");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

let latestUID = null;
let lastUID = null;
let lastUIDTime = 0;
let tapCounter = 0;
let readerConnected = false;
let connectedReaderName = "Unknown Reader";

let uniqueUIDs = new Set();
const uniqueUIDsPath = path.join(__dirname, "../unique_uids.json");
let scanHistory = [];
const historyPath = path.join(__dirname, "../history.json");

// Setup keypress listener immediately
setupKeypressListener();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function setupKeypressListener() {
  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }

  console.log('Press "q" or "x" to quit anytime.');

  process.stdin.on("keypress", (str, key) => {
    if (
      key.name === "q" ||
      key.name === "x" ||
      (key.ctrl && key.name === "c")
    ) {
      console.log("Exiting gracefully...");
      process.exit(0);
    }
  });
}

function saveUniqueUIDs() {
  try {
    fs.writeFileSync(uniqueUIDsPath, JSON.stringify([...uniqueUIDs], null, 2));
  } catch (err) {
    console.error("Error saving unique UIDs:", err);
  }
}

function loadUniqueUIDs() {
  if (fs.existsSync(uniqueUIDsPath)) {
    try {
      const data = fs.readFileSync(uniqueUIDsPath);
      const arr = JSON.parse(data);
      uniqueUIDs = new Set(arr);
      console.log("Loaded unique UIDs:", uniqueUIDs.size);
    } catch (err) {
      console.error("Error loading unique UIDs:", err);
    }
  }
}

function saveHistory() {
  try {
    fs.writeFileSync(historyPath, JSON.stringify(scanHistory, null, 2));
  } catch (err) {
    console.error("Error saving history:", err);
  }
}

function loadHistory() {
  if (fs.existsSync(historyPath)) {
    try {
      const data = fs.readFileSync(historyPath);
      scanHistory = JSON.parse(data);
      if (scanHistory.length > 0) {
        latestUID = scanHistory[0].uid;
        console.log("Loaded previous UID:", latestUID);
      }
    } catch (err) {
      console.error("Error loading history:", err);
    }
  }
}

function addToHistory(uid) {
  scanHistory.unshift({
    uid,
    timestamp: new Date().toISOString(),
  });
  if (scanHistory.length > 10) {
    scanHistory = scanHistory.slice(0, 10);
  }
  saveHistory();
}

function clearHistory() {
  scanHistory = [];
  saveHistory();
  console.log("Scan history cleared.");
}

async function beepReader() {
  const beepCommand = Buffer.from([0xff, 0x00, 0x52, 0x00, 0x00]);
  try {
    await reader.transmitControl(beepCommand);
  } catch (err) {
    console.error("Beep error:", err);
  }
}

async function refreshReaderLCD() {
  try {
    await reader.clearLCD();
    await reader.writeToLCD("Waiting for", "card...");
  } catch (err) {
    console.error("Error resetting LCD:", err);
  }
}

async function initializeReader() {
  const MAX_RETRIES = 60; // Retry for up to 5 minutes
  let retries = 0;

  async function tryInitialize() {
    try {
      await reader.initialize((err) => {
        if (err) {
          console.error("❌ Reader initialization error:", err.message || err);
        }
      }, false);

      await sleep(300);

      if (!reader || typeof reader.readUUID !== "function") {
        readerConnected = false;
        throw new Error("Reader not ready");
      }

      readerConnected = true;
      connectedReaderName = reader.readerName || "Unknown NFC Reader";
      console.log("✅ NFC Reader initialized:", connectedReaderName);

      await reader.turnOnBacklight();
      await reader.clearLCD();
      await reader.writeToLCD("Waiting for", "card...");

      loadHistory();
      loadUniqueUIDs();

      listenForCards();
    } catch (err) {
      retries++;
      readerConnected = false;
      connectedReaderName = "Unknown Reader";
      console.error(
        `⚠️ Reader not available (Attempt ${retries}/${MAX_RETRIES})`
      );

      if (retries >= MAX_RETRIES) {
        console.error("❌ Unable to connect to NFC Reader after 5 minutes.");
        console.error(
          "🔌 Please check connection and restart the application."
        );
        process.exit(1);
      }

      console.log("🔄 Retrying in 5 seconds...");
      setTimeout(tryInitialize, 5000);
    }
  }

  await tryInitialize();
}

async function listenForCards() {
  while (true) {
    try {
      console.log("Waiting for card...");
      const uuid = await reader.readUUID();
      const scannedUID = uuid.toString("hex").toUpperCase();
      const now = Date.now();

      console.log("UID:", scannedUID);

      if (scannedUID === lastUID && now - lastUIDTime < 3000) {
        console.log("Same UID within 3 seconds, ignoring.");
        await sleep(500);
        continue;
      }

      lastUID = scannedUID;
      lastUIDTime = now;

      if (scannedUID !== latestUID) {
        tapCounter++;
        console.log("Tap count:", tapCounter);
      }

      latestUID = scannedUID;
      addToHistory(scannedUID);

      if (!uniqueUIDs.has(scannedUID)) {
        uniqueUIDs.add(scannedUID);
        saveUniqueUIDs();
        console.log("New unique UID detected.");
      }

      await beepReader();
      await reader.writeToLCD("Card UID:", scannedUID);

      child_process.spawn("clip").stdin.end(scannedUID);

      await sleep(2000);

      await reader.clearLCD();
      await reader.writeToLCD("Waiting for", "card...");

      await reader.stopReadUUID();
    } catch (err) {
      console.error("Error while scanning:", err);
      console.log("Resetting reader state...");
      await sleep(500);
      await refreshReaderLCD();
    }
  }
}

function getLatestUID() {
  return latestUID || "Waiting for scan...";
}

function getScanHistory() {
  return scanHistory;
}

function getTapCounter() {
  return tapCounter;
}

function getUniqueUIDs() {
  return [...uniqueUIDs];
}

function getUniqueUIDsCount() {
  return uniqueUIDs.size;
}

function isScannerConnected() {
  return readerConnected;
}

function getConnectedReaderName() {
  return connectedReaderName;
}

module.exports = {
  initializeReader,
  getLatestUID,
  getScanHistory,
  clearHistory,
  refreshReaderLCD,
  getTapCounter,
  getUniqueUIDs,
  getUniqueUIDsCount,
  isScannerConnected,
  getConnectedReaderName,
};
