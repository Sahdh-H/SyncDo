# Playwright E2E Tests for SyncDo

This directory contains the end-to-end (E2E) tests for the SyncDo application, powered by [Playwright](https://playwright.dev/).

## 📋 What's Tested
The test suite consists of **20 comprehensive tests** covering:
- **Authentication**: Login, Signup, Logout, and Validation.
- **Task Management**: Creating, Toggling Done, and Deleting tasks.
- **Prioritization**: High, Medium, and Low priority task colors and badges.
- **Real-time Stats**: Ensuring the "To Do" and "Finished" counters update instantly.
- **Persistence**: Verifying tasks remain after page refreshes.

## 🚀 How to Run the Tests

### 1. Prerequisites
Ensure both the **Backend** and **Frontend** servers are running:
- **Backend**: `uv run python main.py` (Default: http://localhost:8000)
- **Frontend**: `npm run dev` (Default: http://localhost:5173)

### 2. Run Tests (Headless)
To run all tests in the background (Default Recommended):
```bash
npx playwright test
```

### 3. Run Tests (Headed Mode)
To see the browser automate the tests in real-time (Optional):
```bash
npx playwright test --headed
```

### 4. Open Test Report
After running tests, view the interactive HTML report:
```bash
npx playwright show-report
```

## 🛠 Configuration
The configuration for Playwright can be found in `frontend/playwright.config.js`. It is set up to use **Chromium** and targets `http://localhost:5173` as the `baseURL`.
