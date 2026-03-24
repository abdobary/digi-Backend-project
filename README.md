# 🛠️ Digi Backend Project

## 📌 Overview

This is the backend of a full-stack e-commerce application. It provides RESTful APIs for user authentication, profile management, and wishlist functionality. The server is deployed and live, allowing real-time interaction with the frontend.

---

## 🚀 Features

* 🔐 User Authentication (Register & Login)
* 🔑 Password Hashing for security
* 👤 User Profile Management (update name, address, password)
* ❤️ Wishlist system (add, fetch, delete products)
* 🔍 User validation and verification
* 🌐 Deployed backend (ready for production use)

---

## 🧰 Tech Stack

* **Node.js** – runtime environment
* **Express.js** – backend framework
* **MongoDB** – NoSQL database
* **Mongoose** – ODM for MongoDB
* **JWT (JSON Web Token)** – authentication
* **bcrypt** – password hashing
* **Vercel** – deployment platform

---

## 📡 API Endpoints

### 🔐 Authentication

* `POST /api/register`
  Create a new user account

* `POST /api/login`
  Login and receive JWT token

---

### 👤 User

* `GET /api/email/:email`
  Get user details by email

* `PUT /api/edit-user/:email`
  Update user profile

* `POST /api/verify-password`
  Verify current password before updating

---

### ❤️ Wishlist / Products

* `GET /api/products`
  Get all wishlisted products

* `POST /api/products`
  Add product to wishlist

* `DELETE /api/products/:id`
  Remove product from wishlist

---

## 🔐 Authentication Flow

1. User logs in → receives JWT
2. Token is sent in protected requests
3. Backend verifies token before allowing access

---

## 🗄️ Database

* MongoDB Atlas (cloud database)
* Stores:

  * Users (email, password, address, etc.)
  * Wishlisted products

---

## ⚙️ Installation & Setup

```bash
# Clone repository
git clone https://github.com/abdobary/digi-Backend-project

# Navigate to project
cd digi-Backend-project

# Install dependencies
npm install

# Run server
npm start
```

---

## 🌍 Deployment

The backend is deployed on **Vercel** and is accessible via:

```
https://digi-backend-project.vercel.app
```

---

## 🧠 Key Concepts Implemented

* Secure authentication using JWT
* Password hashing with bcrypt
* RESTful API design
* Middleware-based request handling
* CRUD operations with MongoDB

---

## 📌 Future Improvements

* Add cart & order system
* Improve error handling
* Add rate limiting & security layers
* Implement role-based access

---

## 👨‍💻 Author

Developed by **Abdelrahman Tarek**
