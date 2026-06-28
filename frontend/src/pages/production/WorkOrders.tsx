import React, { useState, useEffect } from 'react';
import { productionApi } from '@/store/api/production.api';
import { inventoryApi } from '@/store/api/inventory.api';
import { useDispatch } from 'react-redux';
import { addToast } from '@/store/slices/ui.slice';
import { Plus, Search, Loader2 } from 'lucide-react';
import Modal from '@/components/common/Modal';
import { formatDistanceToNow } from 'date-fns';

const WorkOrders: React.FC = () => {
  const dispatch = useDispatch();
  const [wos, setWos] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    title: '', 
    plannedQuantity: 1, 
    priority: 'NORMAL',
    materialId: '' // For demo, we select one material
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await productionApi.getWorkOrders();
      if (res.success) setWos(res.data);

      const invRes = await inventoryApi.getAll();
      if (invRes.success) setInventoryItems(invRes.data);
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
    if (!formData.title || !formData.materialId) {
      return dispatch(addToast({ message: 'Please fill all required fields', type: 'error' }));
    }

    try {
      setSubmitting(true);
      
      await productionApi.createWorkOrder({
        title: formData.title,
        plannedQuantity: formData.plannedQuantity,
        priority: formData.priority,
        materials: [{
          itemId: formData.materialId,
          requiredQty: formData.plannedQuantity * 2 // Demo: require 2x raw material per output unit
        }]
      });
      
      dispatch(addToast({ message: 'Work Order created successfully', type: 'success' }));
      setIsModalOpen(false);
      fetchData();
      setFormData({ title: '', plannedQuantity: 1, priority: 'NORMAL', materialId: '' });
    } catch (err: any) {
      dispatch(addToast({ message: err.message || err.response?.data?.message || 'Failed to create WO', type: 'error' }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRelease = async (id: string) => {
    try {
      await productionApi.updateWorkOrderStatus(id, 'RELEASED');
      dispatch(addToast({ message: 'Work Order Released', type: 'success' }));
      fetchData();
    } catch (err: any) {
       dispatch(addToast({ message: err.response?.data?.message || 'Failed to release WO', type: 'error' }));
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Work Orders (WO)</h1>
          <p className="text-sm text-gray-500 mt-1">Manage production jobs and assembly sequences.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
        >
          <Plus className="w-4 h-4 mr-2" /> Create WO
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input type="text" placeholder="Search by WO number..." className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-all" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">WO Details</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Materials Needed</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Progress</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {wos.map((wo: any) => (
                <tr key={wo.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">{wo.woNumber}</div>
                    <div className="text-sm font-medium text-gray-700 mt-0.5">{wo.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{formatDistanceToNow(new Date(wo.createdAt), { addSuffix: true })}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {wo.materials?.map((m: any) => (
                      <div key={m.id} className="text-sm text-gray-900">
                        {m.item?.name} x {m.requiredQty}
                      </div>
                    ))}
                    {(!wo.materials || wo.materials.length === 0) && (
                      <span className="text-sm text-gray-500">No materials</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${wo.status === 'RELEASED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {wo.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className={`h-2 rounded-full ${wo.progress === 100 ? 'bg-green-500' : 'bg-primary'}`} style={{ width: `${wo.progress || 0}%` }}></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 text-right">{wo.progress || 0}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {wo.status === 'DRAFT' ? (
                      <button onClick={() => handleRelease(wo.id)} className="text-primary hover:text-primary/80 font-medium">Release</button>
                    ) : (
                       <span className="text-gray-400">View Only</span>
                    )}
                  </td>
                </tr>
              ))}
              {wos.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No work orders found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Work Order">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assembly Title</label>
            <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Raw Material</label>
            <select required value={formData.materialId} onChange={e => setFormData({...formData, materialId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
              <option value="">-- Select Material --</option>
              {inventoryItems.map(item => (
                <option key={item.id} value={item.id}>{item.itemCode} - {item.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Planned Qty</label>
              <input type="number" required min="1" value={formData.plannedQuantity} onChange={e => setFormData({...formData, plannedQuantity: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} disabled={submitting} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-70">
              {submitting ? 'Saving...' : 'Save WO'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WorkOrders;