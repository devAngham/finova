# Finova Frontend

React + TypeScript frontend for the Finova AI Banking Assistant.

## Tech Stack

- React 18
- TypeScript
- Vite
- React Router v6
- Axios (for API calls)
- Socket.io-client (for real-time notifications)

## Pages

- `/login` — Login page
- `/dashboard` — Main dashboard with balance and transactions
- `/chat` — AI Chat interface

## Getting Started

```bash
cd frontend
npm install
npm run dev
```

App runs on `http://localhost:3001`

Backend must be running on `http://localhost:3000`

## Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   └── ChatPage.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── vite.config.ts
└── package.json
```

## Connect to Backend

Search for `// TODO:` comments in each page to find where to add real API calls.
