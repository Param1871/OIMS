import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';

// Layouts
import RootLayout from './components/layout/RootLayout';

// Pages
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import InventoryList from './pages/inventory/InventoryList';
import InventoryAdd from './pages/inventory/InventoryAdd';
import InventoryEdit from './pages/inventory/InventoryEdit';
import InventoryDetail from './pages/inventory/InventoryDetail';
import VendorList from './pages/vendors/VendorList';
import TransactionList from './pages/transactions/TransactionList';
import NewTransaction from './pages/transactions/NewTransaction';
import PurchaseRequests from './pages/purchase/PurchaseRequests';
import PurchaseOrders from './pages/purchase/PurchaseOrders';
import GoodsReceived from './pages/purchase/GoodsReceived';
import WorkOrders from './pages/production/WorkOrders';
import MaterialIssue from './pages/production/MaterialIssue';
import MaintenanceList from './pages/maintenance/MaintenanceList';
import CalibrationRecords from './pages/maintenance/CalibrationRecords';
import ReportsDashboard from './pages/reports/ReportsDashboard';
import InventoryReport from './pages/reports/InventoryReport';
import PurchaseReport from './pages/reports/PurchaseReport';
import ABCAnalysis from './pages/reports/ABCAnalysis';
import WarehouseList from './pages/warehouse/WarehouseList';
import EmployeeList from './pages/employees/EmployeeList';
import EmployeeDetail from './pages/employees/EmployeeDetail';
import Settings from './pages/settings/Settings';
import TaskList from './pages/tasks/TaskList';
import NotificationCenter from './pages/notifications/NotificationCenter';

function App() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} 
      />

      {/* Protected Routes */}
      <Route 
        path="/" 
        element={isAuthenticated ? <RootLayout /> : <Navigate to="/login" replace />}
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="tasks" element={<TaskList />} />
        <Route path="notifications" element={<NotificationCenter />} />
        
        {/* Inventory Module */}
        <Route path="inventory">
          <Route index element={<InventoryList />} />
          <Route path="add" element={<InventoryAdd />} />
          <Route path=":id" element={<InventoryDetail />} />
          <Route path=":id/edit" element={<InventoryEdit />} />
        </Route>
        
        {/* Vendors Module */}
        <Route path="vendors" element={<VendorList />} />
        
        {/* Transactions Module */}
        <Route path="transactions">
          <Route index element={<TransactionList />} />
          <Route path="new" element={<NewTransaction />} />
        </Route>
        
        {/* Purchase Module */}
        <Route path="purchase">
          <Route index element={<Navigate to="requests" replace />} />
          <Route path="requests" element={<PurchaseRequests />} />
          <Route path="orders" element={<PurchaseOrders />} />
          <Route path="grn" element={<GoodsReceived />} />
        </Route>
        
        {/* Production Module */}
        <Route path="production">
          <Route index element={<Navigate to="work-orders" replace />} />
          <Route path="work-orders" element={<WorkOrders />} />
          <Route path="material-issue" element={<MaterialIssue />} />
        </Route>

        {/* Maintenance Module */}
        <Route path="maintenance">
          <Route index element={<Navigate to="schedule" replace />} />
          <Route path="schedule" element={<MaintenanceList />} />
          <Route path="calibration" element={<CalibrationRecords />} />
        </Route>

        {/* Reports Module */}
        <Route path="reports">
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ReportsDashboard />} />
          <Route path="inventory" element={<InventoryReport />} />
          <Route path="purchase" element={<PurchaseReport />} />
          <Route path="abc-analysis" element={<ABCAnalysis />} />
        </Route>
        
        {/* Missing Pages */}
        <Route path="warehouse" element={<WarehouseList />} />
        <Route path="employees">
          <Route index element={<EmployeeList />} />
          <Route path=":id" element={<EmployeeDetail />} />
        </Route>
        <Route path="settings" element={<Settings />} />
        
        {/* We will add other routes here in later phases */}
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;