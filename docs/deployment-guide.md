# Deployment Guide (Local LAN Environment)

This guide outlines the steps required to deploy and run the HAL-Inspired Enterprise Inventory Management System on a local machine for a B.Tech Capstone presentation.

## Prerequisites

Before deploying the application, ensure the host machine has the following software installed:
1.  **Node.js**: Version 18.x or higher (LTS recommended). Download from [nodejs.org](https://nodejs.org/).
2.  **Git**: For version control (optional but recommended).
3.  **Modern Web Browser**: Google Chrome, Mozilla Firefox, or Microsoft Edge.

## Architecture Context for Presentation

Due to constraints with local PostgreSQL setups and Docker unavailability on the presentation hardware, this project has been intelligently decoupled:

-   **Frontend (Active)**: The React/Vite application is fully functional. It utilizes a `mockData.ts` utility that simulates real database responses. This ensures the UI remains highly responsive and free of database-connection errors during the live demonstration.
-   **Backend (Architected)**: The Node.js/Express backend and Prisma schema exist in the repository to demonstrate an understanding of full-stack enterprise architecture, but they are not required to be running for the UI demonstration.

---

## Step-by-Step Deployment

### 1. Clone or Extract the Project
Ensure the project folder `oims-hal` is located on the host machine (e.g., `D:\Online Inventory Management System\oims-hal`).

### 2. Install Frontend Dependencies
Open PowerShell or Command Prompt, navigate to the frontend directory, and install the required npm packages:

```bash
cd "D:\Online Inventory Management System\oims-hal\frontend"
npm install --legacy-peer-deps
```
*(Note: `--legacy-peer-deps` is used to prevent any strict dependency resolution errors from React 18, particularly with third-party libraries like Recharts).*

### 3. Start the Development Server
Run the Vite development server to host the application on the local network (LAN):

```bash
npm run dev -- --host
```
*(Note: The `--host` flag exposes the server on your local IP address, meaning you can access the application from a smartphone or another laptop connected to the same Wi-Fi network by visiting `http://<YOUR_IPV4_ADDRESS>:5173`).*

### 4. Access the Application
- On the host machine, open a browser and go to: `http://localhost:5173`
- If you encounter a login screen, enter any credentials (the auth guard is configured to accept any input for demonstration purposes).

---

## Troubleshooting Common Errors

| Error | Cause | Solution |
| :--- | :--- | :--- |
| `npm ERR! code ENOENT` | You are running the command in the wrong folder. | Ensure you `cd` into the `frontend/` directory before running `npm install`. |
| `Port 5173 is in use` | Another Vite process is running. | Vite will automatically try the next port (e.g., 5174). Check the terminal output for the correct URL. |
| `Cannot find module 'recharts'` | Packages were not installed correctly. | Run `npm install recharts` manually inside the frontend folder. |