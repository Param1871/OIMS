import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  mockInventoryItems, 
  mockTransactions, 
  mockVendors, 
  mockPurchaseRequests, 
  mockPurchaseOrders, 
  mockGRNs, 
  mockWorkOrders, 
  mockMaterialIssues, 
  mockMaintenanceRecords, 
  mockCalibrationRecords 
} from '@/utils/mockData';

interface DataState {
  inventory: any[];
  transactions: any[];
  vendors: any[];
  purchaseRequests: any[];
  purchaseOrders: any[];
  grns: any[];
  workOrders: any[];
  materialIssues: any[];
  maintenanceRecords: any[];
  calibrationRecords: any[];
}

const initialState: DataState = {
  inventory: [...mockInventoryItems],
  transactions: [...mockTransactions],
  vendors: [...mockVendors],
  purchaseRequests: [...mockPurchaseRequests],
  purchaseOrders: [...mockPurchaseOrders],
  grns: [...mockGRNs],
  workOrders: [...mockWorkOrders],
  materialIssues: [...mockMaterialIssues],
  maintenanceRecords: [...mockMaintenanceRecords],
  calibrationRecords: [...mockCalibrationRecords],
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    // Generic add action
    addItem: (state, action: PayloadAction<{ type: keyof DataState; item: any }>) => {
      const { type, item } = action.payload;
      state[type].unshift(item); // Add to beginning
    },
    // Generic update action
    updateItemStatus: (
      state, 
      action: PayloadAction<{ type: keyof DataState; id: string; status: string; extraFields?: any }>
    ) => {
      const { type, id, status, extraFields } = action.payload;
      const list = state[type] as any[];
      const index = list.findIndex((item) => item.id === id);
      if (index !== -1) {
        list[index] = { ...list[index], status, ...extraFields };
      }
    },
    deleteItem: (
      state,
      action: PayloadAction<{ type: keyof DataState; id: string }>
    ) => {
      const { type, id } = action.payload;
      state[type] = (state[type] as any[]).filter((item) => item.id !== id) as any;
    },
  },
});

export const { addItem, updateItemStatus, deleteItem } = dataSlice.actions;
export default dataSlice.reducer;
