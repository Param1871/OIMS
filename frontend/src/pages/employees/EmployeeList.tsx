import React, { useState, useEffect } from 'react';
import { employeeApi } from '@/store/api/employee.api';
import { Users, Search, Mail, Phone, Briefcase, Loader2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import Modal from '@/components/common/Modal';
import { useDispatch } from 'react-redux';
import { addToast } from '@/store/slices/ui.slice';
import api from '@/store/api/base.api'; // To fetch depts directly if needed

const EmployeeList: React.FC = () => {
  const dispatch = useDispatch();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [depts, setDepts] = useState<any[]>([]);
  const [desigs, setDesigs] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', employeeCode: '', departmentId: '', designationId: ''
  });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await employeeApi.getAll();
      if (res.success) setEmployees(res.data);
    } catch (err) {
      console.error("Failed to load employees", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLookups = async () => {
    try {
      const [deptRes, desigRes] = await Promise.all([
        api.get('/employees/departments'),
        api.get('/employees/designations')
      ]);
      setDepts(deptRes.data.data || []);
      setDesigs(desigRes.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchLookups();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await employeeApi.create(formData);
      dispatch(addToast({ message: 'Employee created successfully', type: 'success' }));
      setIsModalOpen(false);
      setFormData({ firstName: '', lastName: '', email: '', phone: '', employeeCode: '', departmentId: '', designationId: '' });
      fetchEmployees();
    } catch (err: any) {
      dispatch(addToast({ message: err.response?.data?.message || 'Failed to create employee', type: 'error' }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this employee? This will also disable their user access.")) {
      try {
        await employeeApi.remove(id);
        dispatch(addToast({ message: 'Employee removed successfully', type: 'success' }));
        fetchEmployees();
      } catch (err: any) {
        dispatch(addToast({ message: err.response?.data?.message || 'Failed to remove employee', type: 'error' }));
      }
    }
  };

  const filteredEmployees = employees.filter((emp: any) => 
    `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Employee Directory</h1>
          <p className="text-sm text-gray-500 mt-1">Manage staff, roles, and department assignments.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Employee
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input type="text" placeholder="Search employees..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg sm:text-sm focus:ring-primary focus:border-primary" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((emp: any) => (
                  <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                          <span className="text-primary font-bold">{emp.firstName?.[0]}{emp.lastName?.[0]}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">{emp.firstName} {emp.lastName}</div>
                          <div className="text-xs text-gray-500">{emp.employeeCode || 'No ID'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-400"/> {emp.email || 'N/A'}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{emp.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Briefcase className="w-3.5 h-3.5 text-gray-400 mr-1.5" />
                        {emp.department?.name || 'Unassigned'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        emp.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {emp.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/employees/${emp.id}`} className="text-primary hover:text-primary/80 mr-4">View Profile</Link>
                      <button onClick={() => handleDelete(emp.id)} className="text-red-500 hover:text-red-700">Remove</button>
                    </td>
                  </tr>
                ))}
                {filteredEmployees.length === 0 && (
                   <tr>
                     <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                       No employees found matching "{searchTerm}"
                     </td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Employee">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input required type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input required type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee Code</label>
              <input required type="text" value={formData.employeeCode} onChange={e => setFormData({...formData, employeeCode: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select required value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
                <option value="">Select Department</option>
                {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
              <select required value={formData.designationId} onChange={e => setFormData({...formData, designationId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
                <option value="">Select Designation</option>
                {desigs.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} disabled={submitting} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-70">
              {submitting ? 'Saving...' : 'Save Employee'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeeList;