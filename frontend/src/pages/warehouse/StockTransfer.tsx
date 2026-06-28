import React, { useState, useEffect } from 'react';
import { warehouseApi } from '@/store/api/warehouse.api';
import { inventoryApi } from '@/store/api/inventory.api';
import { transactionApi } from '@/store/api/transaction.api';
import { useDispatch } from 'react-redux';
import { addToast } from '@/store/slices/ui.slice';
import { ArrowRightLeft, Loader2, Save } from 'lucide-react';

const StockTransfer: React.FC = () => {
  const dispatch = useDispatch();
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    fromWarehouseId: '',
    toWarehouseId: '',
    itemId: '',
    quantity: 1,
    remarks: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [whRes, itemRes] = await Promise.all([
          warehouseApi.getAll(),
          inventoryApi.getAll()
        ]);
        if (whRes.success) setWarehouses(whRes.data);
        if (itemRes.success) setItems(itemRes.data);
      } catch (err: any) {
        console.error(err);
        dispatch(addToast({ message: 'Failed to load initial data', type: 'error' }));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.fromWarehouseId === formData.toWarehouseId) {
      return dispatch(addToast({ message: 'Source and destination warehouses must be different', type: 'error' }));
    }
    
    try {
      setSubmitting(true);
      // Execute the transfer as two transactions for demo purposes
      await transactionApi.create({
        type: 'STOCK_ADJUSTMENT_MINUS',
        itemId: formData.itemId,
        quantity: formData.quantity,
        fromWarehouseId: formData.fromWarehouseId,
        remarks: `Transfer to ${warehouses.find(w => w.id === formData.toWarehouseId)?.name}: ${formData.remarks}`,
      });
      await transactionApi.create({
        type: 'STOCK_ADJUSTMENT_PLUS',
        itemId: formData.itemId,
        quantity: formData.quantity,
        toWarehouseId: formData.toWarehouseId,
        remarks: `Transfer from ${warehouses.find(w => w.id === formData.fromWarehouseId)?.name}: ${formData.remarks}`,
      });
      
      dispatch(addToast({ message: 'Stock transferred successfully', type: 'success' }));
      setFormData({ fromWarehouseId: '', toWarehouseId: '', itemId: '', quantity: 1, remarks: '' });
    } catch (err: any) {
      dispatch(addToast({ message: err.message || err.response?.data?.message || 'Failed to transfer stock', type: 'error' }));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
        <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <ArrowRightLeft className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Stock Transfer</h1>
          <p className="text-sm text-gray-500 mt-1">Move inventory items between warehouses or zones.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">From Warehouse</label>
              <select required value={formData.fromWarehouseId} onChange={e => setFormData({...formData, fromWarehouseId: e.target.value})} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
                <option value="">-- Select Source --</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                ))}
              </select>
            </div>

            <div className="hidden md:flex justify-center pt-5">
              <ArrowRightLeft className="w-6 h-6 text-gray-300" />
            </div>

            <div className="space-y-1 md:hidden flex justify-center py-2">
              <ArrowRightLeft className="w-5 h-5 text-gray-300 rotate-90" />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">To Warehouse</label>
              <select required value={formData.toWarehouseId} onChange={e => setFormData({...formData, toWarehouseId: e.target.value})} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
                <option value="">-- Select Destination --</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                ))}
              </select>
            </div>
          </div>

          <hr className="border-gray-100" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Item to Transfer</label>
              <select required value={formData.itemId} onChange={e => setFormData({...formData, itemId: e.target.value})} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
                <option value="">-- Select Item --</option>
                {items.map(item => (
                  <option key={item.id} value={item.id}>{item.itemCode} - {item.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Quantity</label>
              <input type="number" required min="1" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 1})} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Remarks (Optional)</label>
            <textarea value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" rows={3} placeholder="Reason for transfer..."></textarea>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setFormData({ fromWarehouseId: '', toWarehouseId: '', itemId: '', quantity: 1, remarks: '' })} disabled={submitting} className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium">Reset</button>
            <button type="submit" disabled={submitting} className="inline-flex items-center px-5 py-2.5 text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-70 font-medium">
              {submitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
              {submitting ? 'Transferring...' : 'Execute Transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockTransfer;