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

let uniqueUIDs = new Set();
const uniqueUIDsPath = path.join(__dirname, "../unique_uids.json");
let scanHistory = [];

const historyPath = path.join(__dirname, "../history.json");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

async function beepReader() {
  const beepCommand = Buffer.from([0xff, 0x00, 0x52, 0x00, 0x00]);
  try {
    await reader.transmitControl(beepCommand);
    // Beep silently (no console output)
  } catch (err) {
    console.error("Beep error:", err);
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

async function refreshReaderLCD() {
  try {
    await reader.clearLCD();
    await reader.writeToLCD("Waiting for", "card...");
  } catch (err) {
    console.error("Error resetting LCD:", err);
  }
}

async function initializeReader() {
    try {
        await reader.initialize((err) => {
            if (err) {
                console.error('❌ Reader initialization error:', err.message || err);
            }
        }, debug = false);

        await sleep(300);

        // Try-catch around reader status check
        if (!reader || typeof reader.readUUID !== 'function') {
            console.error('❌ No NFC Reader connected or not ready.');
            console.error('🔌 Please connect a valid reader and restart.');
            process.exit(1);
        }

        console.log('✅ NFC Reader initialized and ready.');

        await reader.turnOnBacklight();
        await reader.clearLCD();
        await reader.writeToLCD('Waiting for', 'card...');

        loadHistory();
        loadUniqueUIDs();

        setupKeypressListener();
        listenForCards();

    } catch (err) {
        console.error('❌ Failed to initialize NFC Reader.');
        console.error('🔌 Please ensure the reader is connected.');
        console.error('Error details:', err.message || err);
        process.exit(1);
    }
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

function setupKeypressListener() {
  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }

  console.log('Press "q" or "x" to quit.');

  process.stdin.on("keypress", (str, key) => {
    if (
      key.name === "q" ||
      key.name === "x" ||
      (key.ctrl && key.name === "c")
    ) {
      console.log("Exiting...");
      process.exit(0);
    }
  });
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

module.exports = {
  initializeReader,
  getLatestUID,
  getScanHistory,
  clearHistory,
  refreshReaderLCD,
  getTapCounter,
  getUniqueUIDs,
  getUniqueUIDsCount,
};
