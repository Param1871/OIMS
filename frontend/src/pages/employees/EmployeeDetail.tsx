import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { employeeApi } from '@/store/api/employee.api';
import { ArrowLeft, User, Mail, Phone, Briefcase, Calendar, ShieldCheck, Loader2, Trash2, CheckSquare } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToast } from '@/store/slices/ui.slice';

const EmployeeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        if (!id) return;
        const res = await employeeApi.getById(id);
        if (res.success) setEmployee(res.data);
      } catch (err) {
        console.error("Failed to load employee details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to completely remove this employee?")) {
      try {
        await employeeApi.remove(id!);
        dispatch(addToast({ message: 'Employee removed successfully', type: 'success' }));
        navigate('/employees');
      } catch (err: any) {
        dispatch(addToast({ message: err.response?.data?.message || 'Failed to remove employee', type: 'error' }));
      }
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Employee not found</h3>
        <Link to="/employees" className="mt-4 inline-flex items-center text-primary hover:underline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/employees" className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{employee.firstName} {employee.lastName}</h1>
          <p className="text-sm text-gray-500 mt-1">ID: {employee.employeeCode || 'N/A'}</p>
        </div>
        <button 
          onClick={handleDelete}
          className="inline-flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors border border-red-200"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Remove Employee
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 mb-4">
              <span className="text-3xl font-bold text-primary">{employee.firstName?.[0]}{employee.lastName?.[0]}</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{employee.firstName} {employee.lastName}</h2>
            <p className="text-gray-500 mb-4">{employee.designation?.name || 'No Designation'}</p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              employee.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {employee.isActive ? 'Active Employee' : 'Inactive'}
            </span>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Contact Info</h3>
            <div className="flex items-center text-sm text-gray-700">
              <Mail className="w-4 h-4 text-gray-400 mr-3" />
              {employee.email || 'No email'}
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <Phone className="w-4 h-4 text-gray-400 mr-3" />
              {employee.phone || 'No phone'}
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <Briefcase className="w-4 h-4 text-gray-400 mr-3" />
              {employee.department?.name || 'Unassigned'}
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <Calendar className="w-4 h-4 text-gray-400 mr-3" />
              Joined: {employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : 'Unknown'}
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <ShieldCheck className="w-5 h-5 mr-2 text-primary" /> Roles & Permissions
            </h3>
            {employee.user ? (
              <div>
                <p className="text-sm font-medium text-gray-700">System Access: <span className="text-green-600">Granted</span></p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {employee.user.role ? (
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-xs font-medium">
                      {employee.user.role.displayName || employee.user.role.name}
                    </span>
                  ) : (
                    <span className="text-gray-500 text-sm">No roles assigned</span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">This employee does not have a user account for the system.</p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Inventory Activity</h3>
            {employee.user?.stockTransactions && employee.user.stockTransactions.length > 0 ? (
              <div className="space-y-3">
                {employee.user.stockTransactions.map((tx: any) => (
                  <div key={tx.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{tx.item?.name}</p>
                      <p className="text-xs text-gray-500">{tx.transactionNumber} • {new Date(tx.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${tx.type.includes('IN') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {tx.type.includes('IN') ? '+' : '-'}{tx.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                No recent inventory activity found for this employee.
              </div>
            )}
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <CheckSquare className="w-5 h-5 mr-2 text-primary" /> Active Tasks Assigned
            </h3>
            {employee.user?.assignedTasks && employee.user.assignedTasks.length > 0 ? (
              <div className="space-y-3">
                {employee.user.assignedTasks.map((task: any) => (
                  <div key={task.id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-semibold text-gray-900">{task.title}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                        task.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                        task.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-50 text-blue-700'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">{task.description}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Assigned by: {task.assigner?.firstName} {task.assigner?.lastName}</span>
                      <span className="font-medium px-2 py-0.5 bg-gray-100 rounded">{task.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                No active tasks assigned to this employee.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail;