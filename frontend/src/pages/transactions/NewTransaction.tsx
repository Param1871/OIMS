import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { transactionApi } from '@/store/api/transaction.api';
import { inventoryApi } from '@/store/api/inventory.api';
import { warehouseApi } from '@/store/api/warehouse.api';
import { ArrowLeft, Save, Loader2, AlertCircle } from 'lucide-react';

const NewTransaction: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [items, setItems] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    type: 'RECEIPT', // or ISSUE
    itemId: '',
    quantity: 1,
    warehouseId: '',
    reason: '',
    remarks: ''
  });

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const iRes = await inventoryApi.getAll();
        if (iRes.success) setItems(iRes.data);
        const wRes = await warehouseApi.getAll();
        if (wRes.success) setWarehouses(wRes.data);
      } catch (err) {
        console.error("Failed to load dropdowns", err);
      }
    };
    fetchDropdowns();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      type: formData.type === 'RECEIPT' ? 'MANUAL_RECEIPT' : 'MANUAL_ISSUE',
      itemId: formData.itemId,
      quantity: Number(formData.quantity),
      toWarehouseId: formData.type === 'RECEIPT' ? formData.warehouseId : undefined,
      fromWarehouseId: formData.type === 'ISSUE' ? formData.warehouseId : undefined,
      reason: formData.reason,
      remarks: formData.remarks,
      referenceType: 'MANUAL'
    };

    try {
      const res = await transactionApi.create(payload);
      if (res.success) {
        navigate('/transactions');
      } else {
        setError(res.message || "Failed to process transaction");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/transactions" className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manual Stock Adjustment</h1>
          <p className="text-sm text-gray-500 mt-1">Directly issue or receive stock outside of standard workflows.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center shadow-sm">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
            <div className="flex gap-4">
              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 w-full">
                <input type="radio" name="type" checked={formData.type === 'RECEIPT'} onChange={() => setFormData({...formData, type: 'RECEIPT'})} className="w-4 h-4 text-green-600 focus:ring-green-500" />
                <span className="ml-3 font-medium text-green-700">Receipt (+ Stock)</span>
              </label>
              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 w-full">
                <input type="radio" name="type" checked={formData.type === 'ISSUE'} onChange={() => setFormData({...formData, type: 'ISSUE'})} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                <span className="ml-3 font-medium text-blue-700">Issue (- Stock)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Item *</label>
            <select required value={formData.itemId} onChange={e => setFormData({...formData, itemId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary bg-white">
              <option value="">-- Choose Item --</option>
              {items.map(i => (
                <option key={i.id} value={i.id}>{i.name} ({i.itemCode})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
              <input type="number" min="1" required value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{formData.type === 'RECEIPT' ? 'To Warehouse' : 'From Warehouse'} *</label>
              <select required value={formData.warehouseId} onChange={e => setFormData({...formData, warehouseId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary bg-white">
                <option value="">-- Choose Warehouse --</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason Code</label>
            <input type="text" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" placeholder="e.g. Audit Adjustment, Defect Return" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
            <textarea rows={2} value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" placeholder="Additional details..." />
          </div>
        </div>

        <div className="flex justify-end gap-4 pb-12">
          <button type="button" onClick={() => navigate('/transactions')} className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="inline-flex justify-center items-center px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 transition-all">
            {loading ? 'Processing...' : <><Save className="w-4 h-4 mr-2" /> Submit Transaction</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewTransaction;