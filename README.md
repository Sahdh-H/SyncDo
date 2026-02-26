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

## 🔑 Login
For testing, you can use:
- **Username**: `admin`
- **Password**: `admin`

## 🛠 Tech Stack
- **Frontend**: React, Vite, Framer Motion, Lucide Icons.
- **Backend**: FastAPI, SQLAlchemy (SQLite), JWT Authentication.
- **Design**: Friendly-Minimalism (Vanilla CSS).
