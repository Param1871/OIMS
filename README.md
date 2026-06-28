# HAL OIMS - Enterprise Inventory Management System

**A comprehensive, realistic Enterprise Resource Planning (ERP) and Inventory Management System designed for aerospace and defense manufacturing, inspired by the operational workflows of Hindustan Aeronautics Limited (HAL).**

---

## 🚀 Features Overview

This system is built as a highly modular, scalable web application tailored for enterprise environments. It covers the complete supply chain lifecycle:

1.  **Inventory Management:** Track active stock, view ABC Analysis, monitor critical aerospace assets, and receive automated low-stock alerts.
2.  **Purchase & Procurement:** Manage Vendor lifecycles, issue Purchase Requests (PR), send Purchase Orders (PO), and handle Goods Receipt Notes (GRN).
3.  **Production floor Integration:** Manage Work Orders (WO) and Material Issue Slips to bridge the gap between stores and the manufacturing floor.
4.  **Maintenance & Calibration:** Track preventive/corrective maintenance for heavy machinery and monitor strict calibration expiries for precision tools.
5.  **Reports & Analytics:** A dedicated dashboard utilizing the Pareto principle (ABC Analysis) and dynamic charts (Recharts) to track KPIs.

## 🛠 Tech Stack

### Frontend
- **Framework:** React 18 (Vite)
- **Language:** TypeScript
- **State Management:** Redux Toolkit
- **Styling:** Tailwind CSS + Shadcn UI (Lucide Icons)
- **Data Visualization:** Recharts

### Backend (Architecture Defined)
- **Runtime:** Node.js + Express
- **ORM:** Prisma Client
- **Database:** Designed for PostgreSQL (Local testing via SQLite)

> *Note: For the purpose of the B.Tech Capstone presentation, the frontend is configured to run independently using comprehensive Mock Data arrays, ensuring 100% uptime and a seamless demonstration without requiring a local database server.*

## ⚙️ Quick Start (Presentation Mode)

To run the application locally for your presentation:

1. Ensure **Node.js (v18+)** is installed on your Windows machine.
2. Open a terminal (PowerShell or Command Prompt).
3. Navigate to the frontend directory:
   ```bash
   cd oims-hal/frontend
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Start the Vite development server:
   ```bash
   npm run dev
   ```
6. Open your browser and navigate to the Local URL provided in the terminal (usually `http://localhost:5173`).
7. Enter any credentials at the `/login` screen to access the Super Admin Dashboard.

## 📚 Documentation

Detailed documentation for the project report can be found in the `docs/` folder:
- [Deployment Guide](./docs/deployment-guide.md)
- [Testing & Presentation Plan](./docs/testing-plan.md)
- [System Architecture](./docs/architecture.md)