import React, { useState, useEffect } from 'react';
import { productionApi } from '@/store/api/production.api';
import { useDispatch } from 'react-redux';
import { addToast } from '@/store/slices/ui.slice';
import { Plus, Search, Loader2 } from 'lucide-react';
import Modal from '@/components/common/Modal';
import { formatDistanceToNow } from 'date-fns';

const MaterialIssue: React.FC = () => {
  const dispatch = useDispatch();
  const [issues, setIssues] = useState<any[]>([]);
  const [wos, setWos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ workOrderId: '', notes: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [issueRes, woRes] = await Promise.all([
        productionApi.getMaterialIssues(),
        productionApi.getWorkOrders()
      ]);
      if (issueRes.success) setIssues(issueRes.data);
      if (woRes.success) setWos(woRes.data);
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
    if (!formData.workOrderId) {
      return dispatch(addToast({ message: 'Please select a Work Order', type: 'error' }));
    }

    try {
      setSubmitting(true);
      
      const selectedWO = wos.find(w => w.id === formData.workOrderId);
      if (!selectedWO || !selectedWO.materials || selectedWO.materials.length === 0) {
         return dispatch(addToast({ message: 'Selected WO has no materials required.', type: 'error' }));
      }

      const itemsToIssue = selectedWO.materials.map((m: any) => ({
        itemId: m.itemId,
        issuedQty: m.requiredQty
      }));

      await productionApi.createMaterialIssue({
        workOrderId: formData.workOrderId,
        notes: formData.notes,
        items: itemsToIssue
      });
      
      dispatch(addToast({ message: 'Material Issue created successfully', type: 'success' }));
      setIsModalOpen(false);
      fetchData();
      setFormData({ workOrderId: '', notes: '' });
    } catch (err: any) {
      dispatch(addToast({ message: err.message || err.response?.data?.message || 'Failed to create Material Issue', type: 'error' }));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Material Issue Slips</h1>
          <p className="text-sm text-gray-500 mt-1">Manage transfer of parts from Central Stores to Production floor.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
        >
          <Plus className="w-4 h-4 mr-2" /> New Issue Slip
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input type="text" placeholder="Search by Slip ID or WO Ref..." className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-all" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Issue Slip</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">WO Reference</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Items Issued</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {issues.map((issue: any) => (
                <tr key={issue.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">{issue.issueNumber}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-blue-600 cursor-pointer">{issue.workOrder?.woNumber || 'N/A'}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{issue.workOrder?.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {issue.items?.map((m: any) => (
                      <div key={m.id} className="text-sm text-gray-900">
                        {m.item?.name} x {m.issuedQty}
                      </div>
                    ))}
                    {(!issue.items || issue.items.length === 0) && (
                      <span className="text-sm text-gray-500">No items</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                      issue.status === 'ISSUED' ? 'border-green-200 text-green-700 bg-green-50' : 'border-amber-200 text-amber-700 bg-amber-50'
                    }`}>
                      {issue.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
              {issues.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">No material issues found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Material Issue Slip">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Work Order</label>
            <select required value={formData.workOrderId} onChange={e => setFormData({...formData, workOrderId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
              <option value="">-- Select Work Order --</option>
              {wos.map(wo => (
                <option key={wo.id} value={wo.id}>{wo.woNumber} - {wo.title}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">This will issue all materials required for the selected Work Order.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" rows={3}></textarea>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} disabled={submitting} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-70">
              {submitting ? 'Generating...' : 'Generate Slip'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MaterialIssue;