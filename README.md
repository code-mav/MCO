# 📚 Library Discussion Room Reservation System

A web-based system for managing discussion room reservations efficiently.

## 📌 Prerequisites
Before running the application, make sure you have:

- Node.js (Recommended: latest LTS version)

- MongoDB (Local or MongoDB Atlas cloud database)

---

## 📥 Installation  

### 1️⃣ Install the required packages
```sh
npm install bcrypt dotenv ejs express express-session method-override moment mongoose nodemon  
```
| Package           | Version  |
|------------------|----------|
| `bcrypt`         | 5.1.1    |
| `dotenv`         | 16.4.7   |
| `ejs`            | 3.1.10   |
| `express`        | 4.21.2   |
| `express-session`| 1.18.1   |
| `method-override`| 3.0.0    |
| `moment`         | 2.30.1   |
| `mongoose`       | 8.10.1   |
| `nodemon`        | 3.1.9    |

## 🚀 Running the Application
Start the server using nodemon:
```sh
nodemon app.js
```
If nodemon is not recognized, install it globally:
```sh
npm install -g nodemon
```
Then run:
```sh
nodemon app.js
```
The application will be available at:
🔗 http://localhost:3000/


## ✨ Features

### 👉 Login & Register System
Provides authentication for users and administrators.

Allows users to sign up, log in, and manage their credentials.

Admins have separate login credentials with elevated access to manage the system.

### 👤 User
Sample User for Testing:
email: test123@gmail.com
password: Test!123

#### 📋 Reservation System
Users can browse available rooms based on date and time.

Allows users to book rooms for specified periods.

Users can view, modify, or cancel their reservations.

Displays room availability in real-time.

#### 📝 Personalized Account Management
Users can view and update their personal details.

Tracks reservation history and upcoming bookings.

Displays any warnings or restrictions on reservations if users exceed allowed bookings.

### 👤 Admin 
Sample Admin for Testing:
email: admin@gmail.com
password: Admin!123

#### 📋 Reservation System of all Users
Admins can view and manage reservations for all users.

Admins can create or cancel bookings as necessary.

Allows admins to monitor room usage and availability.

#### 📝 General Account Management
Admins can manage user accounts (e.g., activation, deactivation, or role assignment).

Admins have the ability to reset passwords and resolve user issues.

Provides an overview of user activity and account status.

### 🌟 Additional Features

#### 🌍 Global Reservation Viewing
Allows users and admins to see the current (today and future dates) reservation slots.