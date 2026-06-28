import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { maintenanceApi } from '@/store/api/maintenance.api';
import { addToast } from '@/store/slices/ui.slice';
import { Plus, Search, Wrench, Calendar, CheckSquare, Loader2 } from 'lucide-react';
import Modal from '@/components/common/Modal';
import { formatDistanceToNow } from 'date-fns';

const MaintenanceList: React.FC = () => {
  const dispatch = useDispatch();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    title: '',
    assetCode: '', 
    assetName: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    priority: 'NORMAL'
  });

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await maintenanceApi.getSchedules();
      if (res.success) setRecords(res.data);
    } catch (err: any) {
      console.error(err);
      dispatch(addToast({ message: 'Failed to load maintenance records', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await maintenanceApi.createSchedule(formData);
      dispatch(addToast({ message: 'Maintenance Scheduled Successfully', type: 'success' }));
      setIsModalOpen(false);
      fetchRecords();
      setFormData({ title: '', assetCode: '', assetName: '', scheduledDate: new Date().toISOString().split('T')[0], priority: 'NORMAL' });
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Failed to create schedule', type: 'error' }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await maintenanceApi.updateScheduleStatus(id, 'COMPLETED');
      dispatch(addToast({ message: 'Marked as completed', type: 'success' }));
      fetchRecords();
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Failed to update schedule', type: 'error' }));
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Maintenance Schedule</h1>
          <p className="text-sm text-gray-500 mt-1">Track preventive and corrective maintenance for heavy equipment.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
        >
          <Plus className="w-4 h-4 mr-2" /> Schedule Work
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input type="text" placeholder="Search equipment..." className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-all" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Job ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Equipment</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Schedule</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.map((record: any) => (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">{record.scheduleNumber}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{record.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Wrench className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <span className="text-sm font-medium text-gray-900 block">{record.assetName || 'N/A'}</span>
                        <span className="text-xs text-gray-500">{record.assetCode || 'N/A'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.priority}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="w-4 h-4 text-gray-400 mr-1.5" />
                      {new Date(record.scheduledDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                      record.status === 'COMPLETED' ? 'border-green-200 text-green-700 bg-green-50' :
                      record.status === 'IN_PROGRESS' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                      'border-amber-200 text-amber-700 bg-amber-50'
                    }`}>
                      {record.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {record.status !== 'COMPLETED' ? (
                       <button onClick={() => handleComplete(record.id)} className="text-green-600 hover:text-green-800 flex items-center justify-end w-full">
                         <CheckSquare className="w-4 h-4 mr-1"/> Finish
                       </button>
                    ) : (
                      <span className="text-gray-400">Done</span>
                    )}
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No maintenance schedules found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule Maintenance">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
            <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name</label>
              <input type="text" required value={formData.assetName} onChange={e => setFormData({...formData, assetName: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Asset Code</label>
              <input type="text" value={formData.assetCode} onChange={e => setFormData({...formData, assetCode: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
              <input type="date" required value={formData.scheduledDate} onChange={e => setFormData({...formData, scheduledDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
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
              {submitting ? 'Scheduling...' : 'Schedule'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MaintenanceList;