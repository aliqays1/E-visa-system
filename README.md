# Somalia E-Visa Portal

Welcome to the Somalia E-Visa Portal! This system allows users to apply for, track, and manage their E-Visas.

## Project Structure

This project is divided into two main parts:
- `/frontend`: The React (Vite) application that users interact with.
- `/backend`: The Node.js/Express server that handles API requests, database interactions (MongoDB), and email sending.

## Prerequisites

- **Node.js** (v16 or higher recommended)
- **MongoDB** (Local or Atlas)
- **Git**

## Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/aliqays1/E-visa-system.git
   cd E-visa-system
   ```

2. **Backend Setup:**
   - Navigate to the backend folder:
     ```bash
     cd backend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Set up your `.env` file (this contains your MongoDB URI, Email credentials, and JWT Secret).
   - Start the backend server:
     ```bash
     npm run dev
     # or npm start
     ```

3. **Frontend Setup:**
   - Open a new terminal window and navigate to the frontend folder:
     ```bash
     cd frontend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Start the frontend development server:
     ```bash
     npm run dev
     ```
   - Open your browser to the URL provided (usually `http://localhost:5173`).

## Environment Variables (.env)
The `.env` file in the `backend` directory should contain the following variables:
- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `EMAIL_USER`, `EMAIL_PASS` (for sending verification emails)
- `FRONTEND_URL`

*Note: For security reasons, never share your actual `.env` passwords with others or commit them to public repositories.*
