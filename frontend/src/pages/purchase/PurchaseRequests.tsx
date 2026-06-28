import React, { useState, useEffect } from 'react';
import { purchaseApi } from '@/store/api/purchase.api';
import { inventoryApi } from '@/store/api/inventory.api';
import { useDispatch } from 'react-redux';
import { addToast } from '@/store/slices/ui.slice';
import { Plus, Search, Filter, Clock, CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import Modal from '@/components/common/Modal';
import { formatDistanceToNow } from 'date-fns';

const PurchaseRequests: React.FC = () => {
  const dispatch = useDispatch();
  const [prs, setPrs] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    title: '', 
    itemId: '', 
    quantity: 1, 
    estimatedCostInr: 1000, 
    priority: 'NORMAL',
    departmentId: 'PURCH-01'
  });

  const fetchPRs = async () => {
    try {
      setLoading(true);
      const res = await purchaseApi.getAllPRs();
      if (res.success) setPrs(res.data);
      
      const invRes = await inventoryApi.getAll();
      if (invRes.success) setInventoryItems(invRes.data);
    } catch (err: any) {
      console.error(err);
      dispatch(addToast({ message: 'Failed to load purchase requests', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPRs();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.itemId) return dispatch(addToast({ message: 'Please select an item', type: 'error' }));
    
    try {
      setSubmitting(true);
      
      const selectedItem = inventoryItems.find(i => i.id === formData.itemId);
      
      await purchaseApi.createPR({
        title: formData.title || `Request for ${selectedItem?.name || 'Item'}`,
        departmentId: formData.departmentId,
        priority: formData.priority,
        items: [{
          itemId: formData.itemId,
          requiredQuantity: formData.quantity,
          estimatedCostInr: formData.estimatedCostInr,
          unit: selectedItem?.unit || 'EACH'
        }]
      });
      
      dispatch(addToast({ message: 'Purchase request created successfully', type: 'success' }));
      setIsModalOpen(false);
      fetchPRs();
      setFormData({ title: '', itemId: '', quantity: 1, estimatedCostInr: 1000, priority: 'NORMAL', departmentId: 'PURCH-01' });
    } catch (err: any) {
      dispatch(addToast({ message: err.response?.data?.message || 'Failed to create PR', type: 'error' }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id: string, currentStatus: string) => {
    try {
      if (currentStatus === 'DRAFT') {
         await purchaseApi.submitPR(id);
         await purchaseApi.approvePR(id);
      } else if (currentStatus === 'SUBMITTED') {
         await purchaseApi.approvePR(id);
      }
      dispatch(addToast({ message: 'PR Approved', type: 'success' }));
      fetchPRs();
    } catch (err: any) {
       dispatch(addToast({ message: err.response?.data?.message || 'Failed to approve PR', type: 'error' }));
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Purchase Requests (PR)</h1>
          <p className="text-sm text-gray-500 mt-1">Internal requests for procurement of materials and assets.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create PR
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input type="text" placeholder="Search by PR number or title..." className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-all" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">PR No. & Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {prs.map((pr: any) => (
                <tr key={pr.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">{pr.prNumber}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{formatDistanceToNow(new Date(pr.createdAt), { addSuffix: true })}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 truncate max-w-[250px]">{pr.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {pr.items && pr.items[0] ? `Item: ${pr.items[0].item.name} (Qty: ${pr.items[0].requiredQuantity})` : 'No items'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${
                      pr.priority === 'URGENT' ? 'border-red-200 text-red-700 bg-red-50' : 'border-gray-200 text-gray-700 bg-gray-50'
                    }`}>
                      {pr.priority === 'URGENT' && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {pr.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {pr.status === 'APPROVED' && <CheckCircle2 className="w-4 h-4 text-green-500 mr-1.5" />}
                      {(pr.status === 'UNDER_REVIEW' || pr.status === 'SUBMITTED' || pr.status === 'DRAFT') && <Clock className="w-4 h-4 text-amber-500 mr-1.5" />}
                      {pr.status === 'REJECTED' && <XCircle className="w-4 h-4 text-red-500 mr-1.5" />}
                      <span className="text-sm font-medium text-gray-900">{pr.status.replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {pr.status !== 'APPROVED' && pr.status !== 'REJECTED' ? (
                      <button onClick={() => handleApprove(pr.id, pr.status)} className="text-green-600 hover:text-green-800">Approve</button>
                    ) : (
                      <span className="text-gray-400">{pr.status === 'APPROVED' ? 'Approved' : 'Rejected'}</span>
                    )}
                  </td>
                </tr>
              ))}
              {prs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No purchase requests found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Purchase Request">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" placeholder="e.g., Engine parts replenishment" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Item</label>
            <select required value={formData.itemId} onChange={e => setFormData({...formData, itemId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
              <option value="">-- Select an item --</option>
              {inventoryItems.map(item => (
                <option key={item.id} value={item.id}>{item.itemCode} - {item.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input type="number" required min="1" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Est. Value (₹)</label>
              <input type="number" required min="0" value={formData.estimatedCostInr} onChange={e => setFormData({...formData, estimatedCostInr: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent (AOG)</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} disabled={submitting} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-70">
              {submitting ? 'Submitting...' : 'Submit PR'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PurchaseRequests;