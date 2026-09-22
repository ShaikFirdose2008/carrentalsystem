# ApexDrive - Online Car Rental & Fleet Management System
### SDC Project Review–1 (Topic #11: Car Rental System)

> **Technologies Used:** Strictly **HTML5, CSS3, and Vanilla JavaScript (ES6+)**  
> **Persistence Engine:** Browser `localStorage`  
> **Layout Model:** Modern CSS Grid & CSS Flexbox  
> **Design Polish:** Amazon / E-Commerce caliber with distinct User and Admin portals

---

## 1. Problem Statement & System Understanding

Modern car rental operations often struggle with fragmented booking processes, lack of real-time inventory visibility, manual reservation tracking, and poor customer checkout experiences. 

**ApexDrive** is an end-to-end digital mobility platform that bridges customers and fleet managers:
- **For Customers (Users):** Provides an intuitive, responsive catalog to search, filter, and reserve luxury, sports, electric, and SUV vehicles with real-time rental cost calculations, interactive payment simulation, and instant downloadable/printable booking vouchers.
- **For Fleet Operators (Admins):** Delivers a centralized executive command dashboard to monitor key performance indicators (KPIs), perform CRUD (Create, Read, Update, Delete) actions on vehicle inventory, handle reservation statuses (Approve, Complete, Cancel), and schedule vehicle maintenance.

---

## 2. Identified Business System & Modules

The platform is partitioned into two primary modules with distinct user flows and dedicated authentication interfaces:

```
                          ┌───────────────────────────┐
                          │   ApexDrive Core Engine   │
                          └─────────────┬─────────────┘
                                        │
                 ┌──────────────────────┴──────────────────────┐
                 ▼                                             ▼
       ┌────────────────────┐                        ┌────────────────────┐
       │    USER MODULE     │                        │    ADMIN MODULE    │
       ├────────────────────┤                        ├────────────────────┤
       │ • User Auth        │                        │ • Admin Auth       │
       │ • Vehicle Search   │                        │ • KPI Dashboard    │
       │ • Category Filters │                        │ • Fleet CRUD       │
       │ • Cost Calculator  │                        │ • Order Approvals  │
       │ • Payment Gateway  │                        │ • Maintenance      │
       │ • Digital Receipt  │                        │ • Telemetry Health │
       │ • My Bookings      │                        └────────────────────┘
       └────────────────────┘
```

### Module 1: Customer / User Module (`index.html`, `user-auth.html`)
1. **Dedicated User Authentication**: Aurora gradient theme with separate Login and Signup forms, form validation, and session preservation.
2. **Dynamic Fleet Catalog**: Built using **CSS Grid** (`repeat(auto-fill, minmax(310px, 1fr))`) and **Flexbox** for vehicle cards, specs pills, ratings, and price badges.
3. **Multi-Attribute Filter Engine**: Search by car name, brand, category pills (*Sports, Luxury, SUV, Electric*), price slider, and transmission.
4. **Interactive Car Specs Modal**: Detailed breakdown of engine transmission, acceleration (0-100 km/h), top speed, seating capacity, and cabin amenities.
5. **Real-Time Rental Cost Calculator**: Calculates base rent based on selected pick-up and return dates, plus optional add-ons (Full Insurance, GPS Hotspot, Child Safety Seat).
6. **Multi-Step Checkout & Simulated Payment Gateway**: Interactive virtual credit card preview with real-time card number and cardholder name syncing, or instant UPI/QR code selection.
7. **Printable Booking Voucher / Receipt**: Formatted invoice with unique Booking ID, driver information, dates, line-item costs, and QR code pass.
8. **"My Bookings" Dashboard**: Customer drawer displaying active and past rentals with the ability to cancel bookings and restore vehicle availability in real time.

### Module 2: Administrator Module (`admin.html`, `admin-auth.html`)
1. **Executive Admin Security Portal**: Dedicated dark cyber-slate interface requiring the **Master Admin Key (`ADMIN2026`)** during registration to prevent unauthorized elevation.
2. **KPI Analytics Telemetry**: Dynamic cards computing **Total Fleet Size**, **Active On-Road Rentals**, **Gross Revenue (₹)**, and **Vehicles Under Maintenance**.
3. **Fleet Inventory Management (Full CRUD)**:
   - **Create**: Add new vehicle modal with live photo URL preview, brand, model, price, transmission, fuel, and seats.
   - **Read**: Tabular inventory view with sorting and search filter.
   - **Update**: Edit modal to modify rental price, specs, and status dropdown (*Available, Rented, Maintenance*).
   - **Delete**: Purge vehicles with confirmation dialogs.
4. **Rental Order Management**: Review customer reservations, with one-click actions to mark orders as **Completed** (returning vehicle to Available) or **Cancelled**.
5. **Fleet Maintenance Scheduler**: Schedule service orders, assign authorized dealer workshops, set estimated completion dates, and track service costs.

---

## 3. LocalStorage Architecture

The application requires zero server installation. All entities are persistently stored in browser `localStorage`:

| LocalStorage Key | Entity Description | Default Seed Example |
| :--- | :--- | :--- |
| `apexdrive_users` | Registered customer and admin accounts | `admin@apex.com` (admin), `demo@apex.com` (user) |
| `apexdrive_cars` | Fleet inventory with technical specs & status | Porsche 911, Tesla Model S, BMW X7, Mustang GT, etc. |
| `apexdrive_bookings` | Customer reservations & invoice details | Active and completed rental records with dates & costs |
| `apexdrive_maintenance`| Fleet service and repair logs | Service center, cost, vehicle ID, schedule dates |
| `apexdrive_current_user`| Active session object for logged-in user | Role-based token simulation (`role: 'user' \| 'admin'`) |

---

## 4. Default Login Credentials (For SDC Review)

To facilitate immediate live demonstration during the viva review:

### Customer (User) Login:
- **URL**: `user-auth.html` (or click "Sign In" on `index.html`)
- **Email**: `demo@apex.com`
- **Password**: `user123`
- *(Auto-Fill button available on the login page)*

### Administrator Login:
- **URL**: `admin-auth.html`
- **Email**: `admin@apex.com`
- **Password**: `admin123`
- **Master Admin Security Key (For New Admin Registration)**: `ADMIN2026`
- *(Auto-Fill button available on the login page)*

### Quick-Demo Floating Switcher:
A floating pill widget (`⚡ SDC Demo`) is anchored at the bottom-right of every page to allow 1-click swapping between the **Customer View** and the **Admin Portal** during the viva presentation.

---

## 5. How to Run Locally

Because this project uses pure HTML5, CSS3, and JavaScript:
1. Navigate to the project folder:
   ```bash
   cd C:\Users\shaik\.gemini\antigravity\scratch\car-rental-system
   ```
2. Double-click `index.html` to open it in Google Chrome, Microsoft Edge, or Mozilla Firefox.
3. *(Optional)* If using VS Code, right-click `index.html` and select **"Open with Live Server"**.

---

## 6. How to Push to GitHub (Requirement #8)

Follow these step-by-step commands in your terminal or command prompt:

```bash
# 1. Navigate to the project directory
cd C:\Users\shaik\.gemini\antigravity\scratch\car-rental-system

# 2. Initialize git repository
git init

# 3. Add all project files
git add .

# 4. Commit files with meaningful message
git commit -m "Initial commit: Complete Car Rental System (SDC Project Review-1)"

# 5. Rename branch to main
git branch -M main

# 6. Link to your GitHub repository (replace URL with your own repo)
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/car-rental-system.git

# 7. Push codebase to GitHub
git push -u origin main
```

---

## 7. Review–1 Viva Voce Questions & Model Answers

### Q1: What is the primary role of `localStorage` in your system?
> **Answer:** `localStorage` acts as our client-side persistent database engine. It allows data such as user credentials, vehicle inventory, rental bookings, and maintenance schedules to survive browser refreshes without requiring an external SQL/NoSQL database, fully complying with the pure HTML/CSS/JS requirement.

### Q2: How did you implement module separation between User and Admin?
> **Answer:** We implemented separate HTML views (`index.html` vs `admin.html`) and distinct authentication portals (`user-auth.html` vs `admin-auth.html`). Each user object contains a `role` property (`'user'` or `'admin'`). In `admin.js`, `ApexAuth.requireRole('admin', 'admin-auth.html')` prevents unauthorized customers or unauthenticated guests from accessing administrative operations.

### Q3: How are CSS Grid and Flexbox utilized?
> **Answer:** 
> - **CSS Grid** is used for macro-layouts: the vehicle catalog (`repeat(auto-fill, minmax(310px, 1fr))`), the auth container split-screen, and the admin KPI metric cards.
> - **Flexbox** is used for micro-components: the sticky navigation bar, category filter pills, car specs pill strips, and modal header/footer button alignments.

### Q4: How does the system handle booking state synchronization?
> **Answer:** When a user confirms a booking in `user.js`, `ApexDB.createBooking()` creates the reservation and simultaneously updates the car's status to `'Rented'`. The catalog immediately marks the car as "Reserved" with disabled booking triggers. When an admin marks the order as "Completed" or a user cancels their rental, the car's status automatically reverts to `'Available'`.
