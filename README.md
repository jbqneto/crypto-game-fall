# 🎮 CryptoFall Arena

**CryptoFall Arena** is a small real-time style click game built as a **frontend-first prototype** focused on **animation, UX, and game feel**, while keeping the architecture ready for future backend and WebSocket integration.

This project was intentionally designed to allow backend and real-time logic to be developed separately.

---

## 🖥️ Development

Back-end: Java + Springboot + Websocket
Front-end: React + Crypto wallet connect on EVM (wagmi + viem)

The idea of this project is to play arround a little bit with game development aside with crypto, with
the main focus on the backend and real time communication, while the front-end will done in pair programming
with Chat-GPT to make things faster for me and because I lack experience on the front-end.

v1 - Something playable on the front-end
v2 - Front-end + backend with basic features
v3 - backend features improvement
v4 - front-end improvement
v5 - front-end code refactor (right now is basically GPT code with some review from my side)

---

## 🕹️ Game Concept

CryptoFall Arena is a **competitive click game** where items fall from the top of the screen and the player must click them before they hit the ground.

The goal is simple: **score as many points as possible before time runs out**.

---

## 🎯 Core Gameplay Mechanics

- Items fall vertically from the top of the arena
- The player clicks items while they are falling
- Each item can be clicked only once
- Items disappear when they reach the ground

### Item Types

| Item  | Effect |
|------|-------|
| 🪙 Bitcoin (BTC) | Increases score |
| 💣 Bomb | Decreases score |

---

## ⏱️ Timer & Game Flow

- Each match has a **countdown timer** (e.g. 30 or 60 seconds)
- The remaining time is displayed at the top of the screen
- When the timer reaches zero:
  - No new items spawn
  - The game ends
  - The final score is displayed

---

## 🎨 Visual & UX Design

- Dark theme inspired by modern casual games
- Flat and clean UI
- Smooth falling animations using `requestAnimationFrame`
- Visual feedback when clicking a bomb:
  - Red overlay effect that fades out gradually
- Canvas-based rendering for better performance and simpler layout

### Assets
- `btc.png` → Bitcoin coin (transparent background)
- `bomb.png` → Cartoon-style bomb (transparent background)

---

## 🧩 Technical Scope (Current Version)

### Included
- React + HTML5 Canvas
- Local state management
- Mocked game data
- Falling animations and hit detection
- Score system
- Countdown timer
- Visual effects (screen flash, glow, easing)

### Explicitly NOT included (yet)
- WebSocket communication
- Backend logic
- Multiplayer support
- Authentication
- Blockchain integration

> These parts are intentionally excluded and planned for future iterations.

---

## 🧠 Architecture Philosophy

This project follows a **separation of concerns** approach:

- **Frontend** handles:
  - Rendering
  - Animations
  - User interactions
  - Visual feedback

- **Backend (future)** will handle:
  - Game state authority
  - Real-time synchronization
  - Anti-cheat logic
  - Player ranking
  - Blockchain interactions

This makes CryptoFall Arena ideal as:
- a frontend playground for animation and UX
- a foundation for a real-time multiplayer backend

---

## 🚀 Project Goals

- Build a visually pleasing click game with minimal UI overhead
- Focus on smooth animations and game feel
- Keep the codebase simple, readable, and extendable
- Prepare the frontend to be easily connected to:
  - WebSockets
  - Server-authoritative game logic
  - Blockchain-based identity or rewards

---

## 🧪 How to Run

1. Install dependencies
```bash
npm install
```

2. Start the development server
```bash
npm run dev
```

3. Open your browser at
```
http://localhost:5173
```

---

## 🔮 Future Developments

- WebSocket-based real-time multiplayer
- Server-authoritative match logic
- Player leaderboard synced across clients
- Wallet-based authentication
- Blockchain-powered rewards

---

## 📜 License

This project is for learning and prototyping purposes.

---

**CryptoFall Arena**  
*Click fast. Avoid the bombs. Beat the clock.*