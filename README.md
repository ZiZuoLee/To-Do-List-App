# To-Do List App

A modern, full-featured to-do list application with user authentication, teams, tags, priorities, reminders, comments, attachments, sharing, real-time chat, notifications, and more.

---

## 🚀 Features
- User registration & login (JWT authentication)
- Create, edit, delete, and organize todos
- Set priorities, due dates, and tags
- Teams & task sharing with permissions
- Real-time team chat and notifications (Socket.IO)
- Comments, threaded replies, @mentions
- Checklists, attachments, reminders, recurring tasks
- Activity feed, change history, audit logs
- Custom fields, user settings, profile avatars
- Admin dashboard for user/role management
- Responsive, modern Material-UI frontend with light/dark mode
- Accessibility improvements and user-friendly error handling
- In-app and email notifications
- Search/filter for todos, chat, and activity
- Comprehensive Help & Getting Started page

---

## 🆘 Help & Getting Started
- Access the in-app help page at [`/help`](http://localhost:3000/help) for:
  - Quick start guide
  - Feature highlights
  - FAQ
  - Contact & support
  - Resources & feedback
- The help page is also available via the settings page or directly in the browser.

---

## 🛠 Tech Stack
- **Frontend:** React, Material-UI
- **Backend:** Node.js, Express, MySQL, Socket.IO
- **Database:** MySQL (with SQL schema)

---

## ⚙️ Setup Instructions

### 1. Clone the Repository
```bash
# Clone the repo
git clone <your-repo-url>
cd To-Do-List-App
```

### 2. Setup the Database
- Ensure you have MySQL installed and running.
- Create the database and tables:
  ```bash
  # In MySQL CLI or a GUI, run:
  source backend/database.sql
  ```

### 3. Configure Environment Variables
- Copy `.env.example` to `.env` in the `backend/` directory and fill in your MySQL credentials and JWT secret:
  ```env
  DB_HOST=localhost
  DB_USER=your_mysql_user
  DB_PASSWORD=your_mysql_password
  DB_NAME=todo_app
  JWT_SECRET=your_jwt_secret
  SMTP_HOST=your_smtp_host
  SMTP_USER=your_smtp_user
  SMTP_PASS=your_smtp_pass
  SMTP_PORT=your_smtp_port
  SMTP_SECURE=false
  ```

### 4. Install Dependencies
```bash
# Backend
yarn install # or npm install
cd ../frontend
# Frontend
yarn install # or npm install
```

### 5. Run the App
```bash
# In one terminal, start the backend
cd backend
npm run dev
# In another terminal, start the frontend
cd ../frontend
npm start
```
- The backend runs on `http://localhost:5000`
- The frontend runs on `http://localhost:3000`

---

## 📚 API Documentation
See [`API_DOC.md`](./API_DOC.md) for a full list of endpoints and usage examples.

---

## ✨ Credits
- Built with [React](https://reactjs.org/) and [Material-UI](https://mui.com/)
- Backend powered by [Express](https://expressjs.com/) and [MySQL](https://www.mysql.com/)
- Real-time features by [Socket.IO](https://socket.io/)

---

## 📝 License
MIT