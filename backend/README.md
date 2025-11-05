# Backend (Node.js + MySQL)

This folder contains the **backend** of the project built with **Node.js** and **Express.js**, connected to a **MySQL** database running on **XAMPP**.

---

## 🚀 Tech Stack
- **Node.js** (Express.js)
- **MySQL** (via XAMPP)
- **dotenv** (for environment variables)
- **Nodemon** (for development auto-restart)

---

## 🧩 Prerequisites

Make sure the following are installed on your system:

- [Node.js](https://nodejs.org/) (v16 or higher)
- [XAMPP](https://www.apachefriends.org/) (for MySQL & Apache)

---

## ⚙️ Setup Instructions

### Start XAMPP Server

1. Open **XAMPP Control Panel**.
2. Start both:
   - **Apache**
   - **MySQL**

> 🟢 These services must be running before you start the backend server.

---

###  Create MySQL Database

1. Open **phpMyAdmin** from XAMPP (http://localhost/phpmyadmin).
2. Click on **Databases**.
3. Create a new database with name **argov_db**:


### Install Dependencies

Navigate to the backend folder and install required npm packages:
```
cd backend
npm install
```