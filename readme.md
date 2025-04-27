# 🎴 Card Scanner Dashboard

An offline-first Node.js + NFC project to scan NFC cards using an **ACR1222L Reader**.  
It displays live UID readings, keeps track of tap history, counts unique UIDs scanned, and more — all inside a beautiful modern dashboard.

---

## 📦 Features

- ✨ **Modern dashboard** built with **Tailwind CSS**
- 🎴 **Live UID scan** via NFC Reader
- 📋 **Clipboard auto-copy** of UID
- 🧠 **History** of last 10 scanned cards
- 🧮 **Tap Counter** (total taps this session)
- 🆔 **Unique UID Counter** (persisted across restarts)
- 💾 **Offline Storage** (`history.json` and `unique_uids.json`)
- 🔄 **Clear History** and **Rescan LCD** buttons
- 🚪 **Clean exit** with `q`, `x`, or `Ctrl+C`
- ⚡ **Very fast** and **resilient** NFC reader loop

---

## 🚀 Technologies Used

- Node.js (backend)
- Express.js (API server)
- [acr1222l](https://www.npmjs.com/package/acr1222l) NFC reader library
- TailwindCSS (frontend design)
- Pure HTML + JavaScript (no frameworks!)

---

## 🛠 Installation

1. Clone the repository:

```bash
git clone https://github.com/YOUR-USERNAME/cardscan-dashboard.git
cd cardscan-dashboard
```

2. Install dependencies:

```bash
npm install
```

3. Run the project:

```bash
npm run start
```

4. Open your browser:

```bash
http://localhost:3000
```

---

## 🖥 Project Structure

| Folder | Purpose |
|:---|:---|
| `/server` | Express server and API routes |
| `/services` | NFC reader logic (`reader.js`) |
| `/frontend` | Static frontend dashboard (HTML + Tailwind) |
| `/node_modules` | npm dependencies |

| File | Purpose |
|:---|:---|
| `history.json` | Stores last 10 scanned UIDs |
| `unique_uids.json` | Stores all-time unique UIDs |

---

## 📋 Available API Endpoints

| Method | URL | Description |
|:---|:---|:---|
| GET | `/uid` | Get the latest scanned UID |
| GET | `/history` | Get history of last 10 scans |
| POST | `/clear-history` | Clear scan history |
| POST | `/rescan` | Refresh LCD to "Waiting for card..." |
| GET | `/tap-counter` | Get total taps in current session |
| GET | `/unique-uids` | Get total unique UIDs ever scanned |

---

## 🎨 Dashboard Overview

- **Big UID Display**: Shows scanned UID immediately
- **Tap & Unique Counters**: Updated live every second
- **History List**: Last 10 scans shown with timestamps
- **Buttons**:
  - **Clear History**: Clears scans
  - **Rescan Reader**: Refreshes LCD

Responsive design, works on desktop, tablet, or mobile.

---

## 🔥 Hot Features

- **Duplicate UID Prevention**: Same card won't be double-counted if tapped quickly.
- **Timeout Handling**: Ignores the same card if scanned again within 3 seconds.
- **Offline Persistence**: History and unique cards survive even if server is restarted.
- **Clipboard Copy**: UID automatically copied to system clipboard.
- **Beep + LCD**: Reader beeps and shows UID when scanned.

---

## 📢 Important Notes

- Tested with **ACS ACR1222L NFC Reader**.
- Make sure **drivers** for your reader are installed (PCSC service).
- **Windows**, **Linux**, **MacOS** supported (wherever PC/SC is supported).

---

## 🧹 To-Do (Optional Future Improvements)

- 🔔 Add "ding" browser sound on card scan (ACR1222L sounds a beep, should be able to disable that via. code)
- 📄 Export UID history as downloadable CSV
- 🔥 Real-time WebSocket updates (instant dashboard without polling)

---

## 🙌 Thanks
Big shoutout to all open-source libraries that made this project possible!