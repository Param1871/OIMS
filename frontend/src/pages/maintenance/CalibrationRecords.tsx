import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { maintenanceApi } from '@/store/api/maintenance.api';
import { addToast } from '@/store/slices/ui.slice';
import { Plus, Search, CheckCircle2, ShieldAlert, Loader2 } from 'lucide-react';
import Modal from '@/components/common/Modal';

const CalibrationRecords: React.FC = () => {
  const dispatch = useDispatch();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    toolId: '', 
    name: '', 
    lastCalibrated: new Date().toISOString().split('T')[0], 
    nextCalibration: '' 
  });

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await maintenanceApi.getCalibrationRecords();
      if (res.success) setRecords(res.data);
    } catch (err: any) {
      console.error(err);
      dispatch(addToast({ message: 'Failed to load calibration records', type: 'error' }));
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
      await maintenanceApi.createCalibrationRecord(formData);
      dispatch(addToast({ message: 'Calibration Record Logged', type: 'success' }));
      setIsModalOpen(false);
      fetchRecords();
      setFormData({ toolId: '', name: '', lastCalibrated: new Date().toISOString().split('T')[0], nextCalibration: '' });
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Failed to create record', type: 'error' }));
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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Calibration Records</h1>
          <p className="text-sm text-gray-500 mt-1">Manage accuracy and certification for precision manufacturing tools.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
        >
          <Plus className="w-4 h-4 mr-2" /> Log Calibration
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input type="text" placeholder="Search by tool name or ID..." className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-all" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tool Info</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Calibrated</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Next Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.map((record: any) => {
                const nextDate = new Date(record.nextCalibrationDate);
                const isExpired = nextDate < new Date();
                
                return (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">{record.instrumentName}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{record.instrumentCode} &bull; Cert: {record.recordNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(record.calibratedDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {nextDate.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                      !isExpired ? 'border-green-200 text-green-700 bg-green-50' : 'border-red-200 text-red-700 bg-red-50'
                    }`}>
                      {!isExpired ? <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> : <ShieldAlert className="w-3.5 h-3.5 mr-1" />}
                      {!isExpired ? 'CALIBRATED' : 'EXPIRED'}
                    </span>
                  </td>
                </tr>
              )})}
              {records.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">No calibration records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log New Calibration">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tool ID / Code</label>
            <input type="text" required value={formData.toolId} onChange={e => setFormData({...formData, toolId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tool Name</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Calibration Date</label>
              <input type="date" required value={formData.lastCalibrated} onChange={e => setFormData({...formData, lastCalibrated: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Next Due Date</label>
              <input type="date" required value={formData.nextCalibration} onChange={e => setFormData({...formData, nextCalibration: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} disabled={submitting} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-70">
              {submitting ? 'Logging...' : 'Log Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CalibrationRecords;