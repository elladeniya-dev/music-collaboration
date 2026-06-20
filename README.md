# 🎵 HarmoniX - Music Collaboration & Freelance Marketplace

HarmoniX is a comprehensive, enterprise-grade full-stack platform designed specifically for musicians, producers, vocalists, and audio engineers. It serves as both a freelance marketplace (similar to Fiverr/Upwork) and a social collaboration hub, allowing artists to buy/sell audio services, post job listings, and connect with other creatives.

---

## 🏗️ Technology Stack

### **Frontend (Client)**
* **Framework:** React.js (Vite)
* **Styling & UI:** Material UI (MUI), Custom CSS (Glassmorphism, Dark Mode aesthetics)
* **Routing:** React Router DOM
* **HTTP Client:** Axios (with custom interceptors for JWT injection)
* **Charting:** Recharts (for analytics dashboard)
* **Icons:** Material UI Icons

### **Backend (Server)**
* **Framework:** Java Spring Boot (Spring Web, Spring Security)
* **Database:** MongoDB (Spring Data MongoDB)
* **Authentication:** JWT (JSON Web Tokens) with BCrypt Password Encoding
* **Media Storage:** Cloudinary SDK (Direct cloud media/image uploads)
* **Build Tool:** Maven

---

## ✨ Core Features & Functionality

### 1. 🔐 Security & Authentication (`AuthController` / `JwtFilter`)
* **Registration & Login:** Users can create accounts securely. Passwords are encrypted using BCrypt before hitting MongoDB.
* **JWT Authorization:** Upon login, the server generates an encrypted JWT. The frontend stores this token and attaches it to the `Authorization` header of every subsequent Axios request. 
* **Route Protection:** The backend `JwtFilter` intercepts incoming requests, validates the token, and extracts the `userId` to ensure users can only modify their own data.

### 2. 👤 User Profiles & Portfolios (`UserController`)
* **Custom Profiles:** Users can set their bio, primary role (e.g., Vocalist, Producer), and hourly rates.
* **Portfolio Uploads:** Users can dynamically upload profile pictures and audio tracks. The Spring Boot backend securely streams `multipart/form-data` directly to Cloudinary, returning a persistent CDN URL that is saved to the user's database document.

### 3. 🏪 The Marketplace (`ServiceController`)
* **Service Creation:** Sellers can list freelance services (e.g., "Professional Vocal Tuning", "Mixing & Mastering") defining the price, delivery time, and attaching a cover image or audio preview.
* **Browsing:** Buyers can scroll through a beautifully designed, responsive grid of available services and view seller details.

### 4. 📦 End-to-End Order Management (`OrderController` & `Orders.jsx`)
The platform supports a full transactional lifecycle for gigs:
* **Create Order:** A buyer purchases a service. The order enters the `PENDING` state.
* **Accept Order:** The seller sees the order on their dashboard and accepts it, moving it to `IN_PROGRESS`.
* **Deliver Work:** The seller completes the gig and uses the **Delivery Modal**. They can type a message and securely upload the final deliverables (MP3, WAV, ZIP) directly from their computer. The backend handles the multipart upload to Cloudinary. The order becomes `DELIVERED`.
* **Complete & Approve:** The buyer receives the files, reviews the work, and clicks Approve. The order is officially `COMPLETED`.
* **Cancellation:** Both buyers and sellers have the ability to explicitly cancel and delete an order from the database to handle disputes or clean up data.

### 5. ⭐ Review & Rating System (`ReviewController`)
* Once an order is `COMPLETED`, the buyer's UI unlocks a Review Form.
* Buyers can leave a 1-5 Star rating and a text review.
* These reviews are saved to the database and dynamically calculate the Seller's overall average rating on their public profile and service cards.

### 6. 📊 Analytics Dashboard (`DashboardController`)
* **Data Aggregation:** The backend parses the user's entire order history. It calculates metrics like "Total Earnings" (for sellers), "Total Spent" (for buyers), and counts Active vs. Completed orders.
* **Historical Grouping:** The Spring Boot service dynamically groups orders by `Month` (converting legacy Dates to Java 8 Instants).
* **Interactive UI Chart:** The frontend uses Recharts to render a beautiful Area Chart. It intelligently switches visual themes (Green for Seller Earnings, Red for Buyer Expenses) based on the user's viewing mode.

### 7. 🤝 Job Board & Collab Requests (`JobPostController` & `CollaborationRequestController`)
* **Job Board:** Users looking to hire or collaborate can post detailed job listings (e.g., "Need a bassist for an Indie track"). Listings define required skills, collaboration type (Paid/Free), and allow image attachments.
* **Dynamic Filtering:** The frontend allows users to search and instantly filter jobs by specific roles (e.g., "Show me only 'Producer' jobs").
* **Collab Requests:** A streamlined feed where artists can pitch quick ideas and look for instant feedback or jam partners.

---

## 🚀 How to Run the Project Locally

### 1. Prerequisites
* Java 17+ installed
* Node.js & npm installed
* MongoDB running locally (default port `27017`)
* Cloudinary API Credentials

### 2. Backend Setup
1. Navigate to the `/backend` directory.
2. Open `src/main/resources/application.properties` and add your Cloudinary credentials:
   ```properties
   cloudinary.cloud-name=YOUR_CLOUD_NAME
   cloudinary.api-key=YOUR_API_KEY
   cloudinary.api-secret=YOUR_API_SECRET
   ```
3. Run the Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```
   *The backend will start on `http://localhost:8080`*

### 3. Frontend Setup
1. Navigate to the `/frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will start on `http://localhost:5173`*

---

## 🎨 UI/UX Philosophy
HarmoniX was built with a strict adherence to modern, premium aesthetics. The UI features:
* Deep, rich dark-mode backgrounds (`#0a0a0f`)
* Vibrant, glowing gradients and interactive hover states (Purple, Emerald, Sky Blue accents)
* Extensive use of Glassmorphism (translucent backgrounds with subtle borders)
* Seamless micro-animations for card hovers, modal popups, and page transitions.

---
*Built with ❤️ for the music creator community.*
