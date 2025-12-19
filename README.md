# 🚛 DriverPay: Fleet & Settlement Management System

A premium, full-stack fleet management solution designed to streamline driver payouts, trip logging, and settlement tracking. Built with a focus on visual excellence and logical robustness.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

---

## ✨ Key Features

### 🔐 Secure Authentication
- **Full Auth Flow**: Integrated Sign Up, Login, and Logout using Supabase Auth.
- **Protected Routes**: Secure access to the dashboard and management tools.
- **User Profiles**: Real-time session management and user identification.

### 📊 Intelligent Dashboard
- **Live Statistics**: Real-time tracking of total drivers, all-time trips, and estimated pending dues.
- **Financial Insights**: Detailed breakdown of lifetime Batta and Salary earnings vs. total paid amounts.
- **Recent Activity**: Glanceable list of the latest trip logs and fleet movements.

### 💸 Resilient Settlement Module
- **Dual Mode Payouts**: Support for **Weekly Batta** and **Monthly Salary** settlement types.
- **Flexible Payment Modes**: Handles `BATTA`, `SALARY`, and `SPLIT` driver payment configurations automatically.
- **Date-Range Logic**: A unique, non-invasive tracking system that identifies pending trips by comparing dates against settlement records, ensuring accuracy even without complex database relationships.

### 🚚 Fleet Management
- **Driver Profiles**: Manage driver information and specific payment modes.
- **Trip Logging**: Easily log trips with automatic payout calculations based on predefined routes.
- **Route Tracking**: View origins, destinations, and fixed payout amounts per trip.

---

## 🚀 Tech Stack

- **Frontend**: React.js 18 with Vite
- **Styling**: Vanilla Tailwind CSS (Custom Design System)
- **Icons**: Lucide React
- **Backend/Database**: Supabase (PostgreSQL)
- **State Management**: React Hooks (useState/useEffect)
- **Routing**: React Router DOM v6

---

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/driverpay.git
   cd driverpay
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   Run the provided `db_schema.sql` in your Supabase SQL Editor to initialize the tables.

5. **Start the development server**
   ```bash
   npm run dev
   ```

---

## 🧠 Core Logic: Date-Range Settlements

One of the most powerful features of this project is its **resilient settlement logic**. Instead of requiring direct foreign key links between every trip and every payment, the system uses **Date-Range Temporal Analytics**:

1. When a settlement is processed, the system identifies the **Min Date** and **Max Date** of the pending trips.
2. A settlement record is saved with this `start_date` and `end_date`.
3. The system dynamically filters the "Pending Dues" by checking if trip dates fall within any existing settlement range for that driver.

This approach ensures that the application remains functional and accurate without over-complicating the database schema.

---

## 🔮 Future Enhancements (Roadmap)

- [ ] **Advanced Route Management**: A dedicated interface to dynamically add, edit, and archive fleet routes with custom payout structures.
- [ ] **Automated PDF Invoices**: Generate professional payment receipts for drivers upon settlement.
- [ ] **Fleet Performance Analytics**: Deep-dive charts showing route profitability and driver efficiency.
- [ ] **Mobile App PWA**: Transform the dashboard into a Progressive Web App for on-the-field logging.

---

Made by Md Salman Nasir
