# 🎴 Card Scanner Dashboard

An offline-first Node.js + NFC project to scan NFC cards using an **ACR1222L Reader**.  
It displays live UID readings, keeps track of tap history, counts unique UIDs scanned, shows reader connection status, supports dark mode, and much more — inside a beautiful modern dashboard.

---

## 📦 Features

- ✨ **Modern TailwindCSS dashboard** with **dark mode**, **light mode**, and **system mode**
- 🎴 **Live UID scan** via NFC Reader
- 📋 **Automatic clipboard copy** of latest scanned UID
- 🧠 **History of last 10 scans** with timestamps
- 🧮 **Tap Counter** (unique scans this session)
- 🔢 **Unique UID Counter** (persisted across restarts)
- 🔥 **Offline Storage** (`history.json`, `unique_uids.json`)
- 🔄 **Clear History**, **Rescan Reader**, and **CSV Export** buttons
- 🛎️ **Animated Toast Notifications** for scanner connect/disconnect, new scans, etc.
- 🚀 **Auto-reconnect** to scanner if unplugged (retry every 5 seconds for up to 5 minutes)
- 🚪 **Exit cleanly** with `q`, `x`, or `Ctrl+C`
- ⚡ **Extremely fast**, resilient, and optimized NFC scanning loop
- 🖥️ **Responsive design** (desktop, tablet, mobile friendly)

---

## 🚀 Technologies Used

- Node.js (backend server)
- Express.js (API endpoints)
- [acr1222l](https://www.npmjs.com/package/acr1222l) library (NFC control)
- Tailwind CSS (modern frontend styling)
- Vanilla JavaScript (frontend logic)

---

## 🛠 Installation

1. Clone the repository:

```bash
git clone https://github.com/clausmunch/ACL1222L-Node-Reader.git
cd ACL1222L-Node-Reader
```

2. Install dependencies:

```bash
npm install
```

3. Start the project:

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
| `/frontend` | Static frontend dashboard (HTML + TailwindCSS) |
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
| GET | `/history` | Get last 10 scans |
| POST | `/clear-history` | Clear scan history |
| POST | `/rescan` | Refresh LCD on reader |
| GET | `/tap-counter` | Get number of taps (this session) |
| GET | `/unique-uids` | Get total unique UIDs ever scanned |
| GET | `/export-csv` | Download unique UIDs as a CSV |
| GET | `/scanner-status` | Get scanner connection status and name |

---

## 🎨 Dashboard Overview

- **Current UID**: Big display for latest UID
- **Tap & Unique Counters**: Updated live
- **Animated Toasts**: Slide-in for events
- **Scan History**: Last 10 UIDs paginated
- **Clear / Rescan / Export CSV** buttons
- **Dark mode toggle**: System, light, dark
- **Connection Status**: Realtime scanner info

Everything auto-refreshes **every second** with super-low overhead.

---

## 📈 Quick Start Demo

> Here's a typical workflow:

1. **Plug in** your ACR1222L Reader
2. **Start** the server with `npm run start`
3. **Open** [http://localhost:3000](http://localhost:3000)
4. **Tap a card** on the reader ➡️ UID appears, beep sounds, LCD updates
5. **Clipboard** is automatically updated with the UID
6. **Dashboard** shows the history, tap counter, and unique UID count

You will see **animated toast notifications** on scans, connection changes, and actions like clear/rescan.

---

## 🔥 Highlights

- **Duplicate UID Prevention**: Same card won’t be counted twice unless physically removed.
- **Timeout Handling**: Ignore same UID if scanned again within 3 seconds.
- **Clipboard Copy**: UID automatically copied to clipboard after successful scan.
- **Offline Persistence**: Unique UID and history persist even after restart.
- **Auto Reconnect**: Will automatically retry if reader becomes unavailable (up to 5 minutes).
- **Reader Beep and LCD Display**: Sound + UID text on LCD for each scan.

---

## 📢 Important Notes

- Works with **ACS ACR1222L** NFC Reader (or compatible PC/SC devices).
- Requires PC/SC drivers installed and smart card service running.
- Windows, Linux, and MacOS supported (with PCSC available).

---

## 📈 Optional Future Enhancements

- 🔔 Play sound in browser on new card scan
- 🌐 Use WebSocket for real-time updates instead of polling
- 🎨 Animate background color flashes on successful scan
- 🖨️ Allow exporting full scan history (not just unique UIDs)

---

## 🙌 Thanks

Huge thanks to:

- **acr1222l** library maintainers
- **Tailwind CSS** creators
- Open source community ❤️