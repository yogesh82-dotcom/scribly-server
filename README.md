# 🧠 Scribly Server

This is the backend server for **Scribly** - a full-stack MERN web app designed for simple and efficient note-taking, inspired by Google Keep. 
Users can sign up, log in and create, edit or delete individual notes. Each user's notes are stored securely and separately in the backend database (Mongo DB).
The server is live and deployed on Railway, handling authentication, user managment, and note operation securely.

## ✨ Features

- User Signup & Login
- Unique database entries for each user
- CRUD operations
- CORS support for frontend integration
- express routes and middleware setup

## 🛠️ API Endpoints

- POST /signup - Register a new user
- POST /login  - Logging in user
- GET  /worklogs/:userId - Fetch all data of the particular user
- POST /worklogs - Add new note
- PUT /worklogs/:id - Edit a note
- DELETE /worklogs/:id - Delete a note

