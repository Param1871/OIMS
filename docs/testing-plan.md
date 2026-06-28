# Live Presentation Testing Plan ("The Golden Flow")

This document provides a step-by-step script for demonstrating the HAL Enterprise Inventory Management System during your B.Tech Viva Voce / Capstone Presentation.

Following this "Golden Flow" ensures you showcase all major features in a logical, business-oriented order.

---

## Act I: The Dashboard and Analytics (The "Manager's View")

1.  **Login**: Navigate to `http://localhost:5173/login`. Enter any email/password and click Login. Explain that the system uses JWT-based authentication (mocked for the demo) and Role-Based Access Control (RBAC).
2.  **Dashboard**: You arrive at the Dashboard. Point out the sidebar navigation, explaining that an ERP system is modular.
3.  **Reports & Analytics**: 
    - Click **Reports** in the sidebar.
    - Explain the KPIs (Total Inventory Value).
    - Click on **ABC Analysis**. This is your "wow" factor. Explain the Pareto principle: *"In aerospace, 20% of parts account for 80% of our inventory value. This chart dynamically categorizes them into Class A, B, and C to prioritize our quality control efforts."*

## Act II: Inventory Management (The "Store Keeper's View")

1.  **View Inventory**: Navigate to **Inventory**.
2.  **Search & Filter**: Type "Engine" or "Turbine" into the search bar. Show how instantly the React application filters the table.
3.  **Low Stock Alert**: Point out the red "Low Stock" badges. Explain that the system monitors Minimum Stock Levels and alerts the procurement team automatically.
4.  **Item Details**: Click "View Details" on a specific item (e.g., *Hydraulic Actuator System*). 
    - Show the **Stock Level visual bar** (which turns red if below minimum).
    - Scroll down to the **Recent Transactions** table to prove the system maintains a complete audit trail of item movements.

## Act III: Procurement Lifecycle (The "Purchase Dept View")

1.  **The Problem**: Explain that since an item was low in stock, a department requested more.
2.  **Purchase Requests (PR)**: Navigate to **Purchase -> Requests**. Show the table of PRs. Point out the priority badges (Urgent vs Normal).
3.  **Purchase Orders (PO)**: Navigate to **Purchase -> Orders**. Explain that approved PRs are converted into formal POs sent to vendors. Show the KPI cards at the top ("Active POs", "Pending Delivery").
4.  **Goods Receipt (GRN)**: Navigate to **Purchase -> GRN**. Explain that when the vendor delivers the goods, they must pass Quality Control. Show the statuses (`QUALITY_PENDING` vs `QUALITY_REJECTED`).

## Act IV: Production & Maintenance (The "Shop Floor View")

1.  **Work Orders**: Navigate to **Production -> Work Orders**. Show the progress bars tracking the assembly of things like the "LCA Tejas Fuselage".
2.  **Material Issue**: Navigate to **Production -> Material Issue**. Explain that this is how parts physically move from the Store (Act II) to the Shop Floor (Act IV).
3.  **Calibration Records**: Navigate to **Maintenance -> Calibration**. This is another aerospace-specific "wow" factor. Explain that precision tools (like Micrometers) must be calibrated regularly. Show how the system flags overdue calibrations in red to prevent manufacturing defects.

## Conclusion

End the demonstration by summarizing the architecture:
*"The frontend is built with React 18, Vite, and Tailwind CSS for a modern, responsive UI. It utilizes a modular, Redux-managed state architecture. The system is designed to interface with a Node.js/Prisma backend, representing a full enterprise-grade microservice architecture."*