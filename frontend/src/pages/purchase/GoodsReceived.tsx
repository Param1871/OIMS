import React, { useState, useEffect } from 'react';
import { purchaseApi } from '@/store/api/purchase.api';
import { warehouseApi } from '@/store/api/warehouse.api';
import { useDispatch } from 'react-redux';
import { addToast } from '@/store/slices/ui.slice';
import { Plus, Search, Filter, ClipboardCheck, ShieldAlert, PackageCheck, Loader2 } from 'lucide-react';
import Modal from '@/components/common/Modal';
import { formatDistanceToNow } from 'date-fns';

const GoodsReceived: React.FC = () => {
  const dispatch = useDispatch();
  const [grns, setGrns] = useState<any[]>([]);
  const [pos, setPos] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    purchaseOrderId: '', 
    warehouseId: '', 
    challanNumber: '',
    vehicleNumber: '',
    notes: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [grnRes, poRes, whRes] = await Promise.all([
        purchaseApi.getAllGRNs(),
        purchaseApi.getAllOrders(),
        warehouseApi.getAll()
      ]);
      if (grnRes.success) setGrns(grnRes.data);
      if (poRes.success) setPos(poRes.data);
      if (whRes.success) setWarehouses(whRes.data);
    } catch (err: any) {
      console.error(err);
      dispatch(addToast({ message: 'Failed to load data', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.purchaseOrderId || !formData.warehouseId) {
      return dispatch(addToast({ message: 'Please fill all required fields', type: 'error' }));
    }
    
    try {
      setSubmitting(true);
      
      const selectedPO = pos.find(p => p.id === formData.purchaseOrderId);
      if (!selectedPO || !selectedPO.items || selectedPO.items.length === 0) {
        throw new Error('Selected PO has no items');
      }

      // Automatically receive all ordered items for this demo
      const items = selectedPO.items.map((item: any) => ({
        itemId: item.itemId,
        orderedQty: item.orderedQuantity,
        receivedQty: item.orderedQuantity,
        acceptedQty: item.orderedQuantity,
        rejectedQty: 0,
        unitCostInr: item.unitCostInr,
      }));

      await purchaseApi.createGRN({
        purchaseOrderId: formData.purchaseOrderId,
        warehouseId: formData.warehouseId,
        challanNumber: formData.challanNumber || `CH-${Math.floor(Math.random() * 10000)}`,
        vehicleNumber: formData.vehicleNumber,
        notes: formData.notes,
        items
      });
      
      dispatch(addToast({ message: 'GRN created successfully', type: 'success' }));
      setIsModalOpen(false);
      fetchData();
      setFormData({ purchaseOrderId: '', warehouseId: '', challanNumber: '', vehicleNumber: '', notes: '' });
    } catch (err: any) {
      dispatch(addToast({ message: err.message || err.response?.data?.message || 'Failed to create GRN', type: 'error' }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleProcess = async (id: string, action: 'APPROVE' | 'REJECT') => {
    try {
      if (action === 'APPROVE') {
         await purchaseApi.postGRN(id);
         dispatch(addToast({ message: 'GRN Posted to Inventory', type: 'success' }));
      } else {
         dispatch(addToast({ message: 'GRN Rejected (UI Only)', type: 'info' }));
      }
      fetchData();
    } catch (err: any) {
       dispatch(addToast({ message: err.response?.data?.message || 'Failed to process GRN', type: 'error' }));
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Goods Receipt Notes (GRN)</h1>
          <p className="text-sm text-gray-500 mt-1">Process incoming vendor deliveries and manage quality inspection.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
        >
          <Plus className="w-4 h-4 mr-2" /> Create GRN
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input type="text" placeholder="Search by GRN or PO Number..." className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-all" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">GRN Number</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reference PO</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Qty Received</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {grns.map((grn: any) => {
                const totalQty = grn.items?.reduce((sum: number, item: any) => sum + item.receivedQty, 0) || 0;
                
                return (
                <tr key={grn.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">{grn.grnNumber}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{formatDistanceToNow(new Date(grn.createdAt), { addSuffix: true })}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-blue-600">{grn.purchaseOrder?.poNumber || 'N/A'}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{grn.purchaseOrder?.vendor?.name || 'Unknown Vendor'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-sm font-bold text-gray-900">
                      {totalQty}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {grn.status === 'POSTED' && <PackageCheck className="w-4 h-4 text-green-500 mr-2" />}
                      {(grn.status === 'DRAFT' || grn.status === 'QUALITY_PENDING') && <ClipboardCheck className="w-4 h-4 text-amber-500 mr-2" />}
                      {grn.status === 'QUALITY_REJECTED' && <ShieldAlert className="w-4 h-4 text-red-500 mr-2" />}
                      <span className={`text-sm font-medium ${grn.status === 'POSTED' ? 'text-green-700' : grn.status === 'QUALITY_REJECTED' ? 'text-red-700' : 'text-amber-700'}`}>
                        {grn.status.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {grn.status !== 'POSTED' ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleProcess(grn.id, 'APPROVE')} className="text-green-600 hover:text-green-800">Post to Inventory</button>
                      </div>
                    ) : (
                      <span className="text-gray-400">Posted</span>
                    )}
                  </td>
                </tr>
              )})}
              {grns.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No goods received notes found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Receive Goods">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Purchase Order</label>
            <select required value={formData.purchaseOrderId} onChange={e => setFormData({...formData, purchaseOrderId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
              <option value="">-- Select PO --</option>
              {pos.map(po => (
                <option key={po.id} value={po.id}>{po.poNumber} - {po.vendor?.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Receiving Warehouse</label>
            <select required value={formData.warehouseId} onChange={e => setFormData({...formData, warehouseId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
              <option value="">-- Select Warehouse --</option>
              {warehouses.map(wh => (
                <option key={wh.id} value={wh.id}>{wh.code} - {wh.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Challan Number</label>
              <input type="text" value={formData.challanNumber} onChange={e => setFormData({...formData, challanNumber: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" placeholder="Optional" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
              <input type="text" value={formData.vehicleNumber} onChange={e => setFormData({...formData, vehicleNumber: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" placeholder="Optional" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" rows={3}></textarea>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} disabled={submitting} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-70">
              {submitting ? 'Saving...' : 'Save GRN'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default GoodsReceived;