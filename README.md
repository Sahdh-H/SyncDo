# SyncDo - Easy Task Management

A super-friendly task management app built with FastAPI (Python) and React (Vite).

## 🚀 How to Run Locally

Follow these simple steps to get the app running on your machine.

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+**

### 2. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
python3 main.py
```
The backend will run at `http://localhost:8000`.

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
The frontend will run at `http://localhost:5173`.

### 4. Running E2E Tests (Playwright)
Ensure both the backend and frontend are running, then:
```bash
cd frontend
npx playwright test --headed
```
You can view the detailed HTML report with `npx playwright show-report`.

## 🔑 Login
For testing, you can use:
- **Username**: `admin`
- **Password**: `admin` (or `admin` in both fields)

## 🛠 Tech Stack
- **Frontend**: React, Vite, Framer Motion, Lucide Icons, **Playwright (E2E Testing)**.
- **Backend**: FastAPI, SQLAlchemy (SQLite), JWT Authentication, **uv (Package Management)**.
- **Design**: Friendly-Minimalism (Vanilla CSS).
