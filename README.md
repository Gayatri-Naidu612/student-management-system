# Student Management System

A full-stack web application designed to manage student records performing complete CRUD (Create, Read, Update, Delete) operations with real-time dynamic search, server status monitoring, and live statistics dashboard.

## Features
- **Add & Edit Student Records:** Register and update records with validation.
- **Status Badges & Hyperlinks:** Live Pass/Fail/Distinction badges and clickable phone links.
- **Server Status Bar:** Displays real-time backend connection state.
- **Dynamic Search:** Real-time filtering using JavaScript Fetch API.
- **Stats Dashboard:** Live calculation of Total Students, Average Marks, and Highest Marks.

## Technologies Used
- **Frontend:** HTML5, CSS3, Modern JavaScript (Fetch API, Async/Await)
- **Backend:** Python, Flask, Flask-CORS
- **Database:** SQLite3

## Instructions to Run

1. **Start Backend Server:**
   ```bash
   cd backend
   .\venv\Scripts\python.exe app.py