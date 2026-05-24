# 🎨 Skribbl Clone

A realtime multiplayer drawing and guessing game inspired by Skribbl.io built using React.js, Node.js, Express.js, Socket.io, and Canvas API.

---

## 🚀 Live Demo

### Frontend (Vercel)
https://skribble-clone-assignment.vercel.app

### Backend (Render)
https://skribble-clone-assignment.onrender.com

---
---

# 🏗️ Architecture Overview

## Frontend (React.js)

The frontend is built using React.js and Canvas API.

### Responsibilities:
- Render game UI
- Handle drawing on canvas
- Capture mouse events
- Send drawing coordinates using Socket.io
- Display realtime chat messages
- Show scores, timer, and rounds

---

## Backend (Node.js + Express.js)

The backend manages:
- Room creation
- Player management
- Game state
- Word selection
- Round timer
- Score tracking
- Socket communication

---

## WebSocket Communication (Socket.io)

Socket.io enables realtime bidirectional communication between frontend and backend.

### Events Used:
- `create_room`
- `join_room`
- `start_game`
- `choose_word`
- `select_word`
- `draw`
- `send_guess`
- `correct_guess`
- `timer_update`
- `round_ended`
- `game_over`

---

## Canvas Integration

Canvas API is used for realtime drawing.

### Flow:
1. Drawer draws on canvas
2. Mouse coordinates captured
3. Coordinates emitted through Socket.io
4. Backend broadcasts drawing data
5. Other players render drawing instantly

---

## Game Logic Flow

### Game Start
1. Player creates room
2. Other players join
3. Host starts game
4. Random drawer selected

### During Round
1. Drawer selects word
2. Timer starts
3. Drawer draws
4. Other players guess using chat
5. Correct guesses update score

### Round End
1. Timer reaches zero
2. Next drawer selected
3. New round begins
4. Game ends after max rounds
5. Winner announced

## 📌 Features

- 🎮 Realtime multiplayer gameplay
- ✏️ Live collaborative drawing
- 💬 Realtime guessing chat
- ⏳ Round timer system
- 🏆 Score tracking
- 🔄 Automatic next rounds
- 🎨 Multiple drawing colors
- 🧹 Clear canvas functionality
- 🌐 Socket.io realtime communication
- 📱 Responsive UI

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Canvas API
- Socket.io Client
- CSS

### Backend
- Node.js
- Express.js
- Socket.io

### Deployment
- Vercel (Frontend)
- Render (Backend)

---

## 📂 Project Structure

```bash
skribble_clone_assignment/
│
├── frontend/
│
├── backend/
│
└── README.md
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/nadeemahmed12/skribble_clone_assignment.git
```

---

## Backend Setup

```bash
cd backend
npm install
npm start
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🌍 Environment Variables

Create `.env` file inside backend:

```env
PORT=3000
```

---


## 👨‍💻 Author

**Nadeem Ahmed**

GitHub:
https://github.com/nadeemahmed12

---

## ⭐ Future Improvements

- Private rooms
- Mobile responsive UI
- Word difficulty levels
- Drawing brush size
- Leaderboard
- Authentication system
