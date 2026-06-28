import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { addToast } from '@/store/slices/ui.slice';
import { taskApi } from '@/store/api/task.api';
import Modal from '@/components/common/Modal';
import { CheckCircle2, Clock, PlayCircle, Plus, MessageSquare, AlertCircle, Trash2 } from 'lucide-react';
import api from '@/store/api/base.api';

const TASK_TEMPLATES = [
  {
    title: "Conduct Cycle Count for Zone A (Raw Materials)",
    description: "A task to physically verify the stock of raw aluminum sheets against the system quantities.",
    priority: "HIGH"
  },
  {
    title: "Process Material Issue for Work Order #402",
    description: "Preparing and dispatching specific components (e.g., turbine blades) to the production floor.",
    priority: "NORMAL"
  },
  {
    title: "Organize New Shipment in Quarantine",
    description: "Moving a newly arrived batch of hydraulic actuators into the quarantine zone pending quality inspection.",
    priority: "NORMAL"
  },
  {
    title: "Raise Purchase Request for Shortage Items",
    description: "Instructing a production supervisor to formally request more rivets or sealants that are running low for an aircraft assembly.",
    priority: "HIGH"
  },
  {
    title: "Complete Scrap Declaration for Damaged Batch",
    description: "A task to document and move defective aerodynamic parts to the scrap yard.",
    priority: "NORMAL"
  },
  {
    title: "Inspect Batch #889 from Vendor XYZ",
    description: "Tasking a QA officer to perform material testing on new incoming landing gear components before they are approved for the main warehouse.",
    priority: "URGENT"
  },
  {
    title: "Verify Calibration of Tool Crib Instruments",
    description: "A routine task to check that all precision measurement tools are properly calibrated and log the results.",
    priority: "NORMAL"
  },
  {
    title: "Scheduled Maintenance on Forklift #3",
    description: "A task to perform routine checks on warehouse equipment.",
    priority: "LOW"
  },
  {
    title: "Repair Defective CNC Spindle",
    description: "Tasking the maintenance team to fix a broken machine and log the spare parts consumed from the inventory.",
    priority: "URGENT"
  },
  {
    title: "Follow up with Vendor ABC regarding delayed shipment",
    description: "A communication task to ensure critical aerospace grade titanium arrives on time.",
    priority: "HIGH"
  },
  {
    title: "Generate Monthly Stock Valuation Report",
    description: "Tasking the finance department to run the end-of-month inventory cost analysis.",
    priority: "NORMAL"
  }
];

const TaskList: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const isAdmin = user?.role === 'SUPER_ADMIN';

  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  
  // Create Form
  const [employees, setEmployees] = useState<any[]>([]);
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'NORMAL', assigneeId: '' });

  // Message Form
  const [messageContent, setMessageContent] = useState('');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = isAdmin ? await taskApi.getAll() : await taskApi.getMine();
      if (res.success) setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    if (isAdmin) {
      try {
        const res = await api.get('/employees');
        if (res.data.success) {
          // Flatten user records
          setEmployees(res.data.data.filter((e: any) => e.user));
        }
      } catch (err) {}
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchEmployees();
  }, [isAdmin]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await taskApi.create({ ...formData, assigneeId: formData.assigneeId });
      dispatch(addToast({ message: 'Task assigned successfully', type: 'success' }));
      setIsCreateOpen(false);
      setFormData({ title: '', description: '', priority: 'NORMAL', assigneeId: '' });
      fetchTasks();
    } catch (err: any) {
      dispatch(addToast({ message: err.response?.data?.message || 'Failed to create task', type: 'error' }));
    }
  };

  const handleStatusChange = async (taskId: string, status: string) => {
    try {
      await taskApi.updateStatus(taskId, status);
      dispatch(addToast({ message: 'Task status updated', type: 'success' }));
      fetchTasks();
      if (selectedTask && selectedTask.id === taskId) {
        openTaskDetail(taskId); // Refresh detail
      }
    } catch (err: any) {
      dispatch(addToast({ message: 'Failed to update status', type: 'error' }));
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskApi.delete(taskId);
      dispatch(addToast({ message: 'Task deleted successfully', type: 'success' }));
      setIsViewOpen(false);
      fetchTasks();
    } catch (err) {
      dispatch(addToast({ message: 'Failed to delete task', type: 'error' }));
    }
  };

  const openTaskDetail = async (taskId: string) => {
    try {
      const res = await taskApi.getById(taskId);
      if (res.success) {
        setSelectedTask(res.data);
        setIsViewOpen(true);
      }
    } catch (err) {
      dispatch(addToast({ message: 'Failed to load task details', type: 'error' }));
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim()) return;
    try {
      await taskApi.addMessage(selectedTask.id, messageContent);
      setMessageContent('');
      openTaskDetail(selectedTask.id); // Refresh
      fetchTasks(); // update comment count in list
    } catch (err) {
      dispatch(addToast({ message: 'Failed to send message', type: 'error' }));
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'COMPLETED': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</span>;
      case 'IN_PROGRESS': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><PlayCircle className="w-3 h-3 mr-1" /> In Progress</span>;
      default: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"><Clock className="w-3 h-3 mr-1" /> Pending</span>;
    }
  };

  const PriorityBadge = ({ priority }: { priority: string }) => {
    const colors: any = {
      LOW: 'bg-gray-100 text-gray-800',
      NORMAL: 'bg-blue-50 text-blue-700',
      HIGH: 'bg-orange-100 text-orange-800',
      URGENT: 'bg-red-100 text-red-800'
    };
    return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${colors[priority] || colors.NORMAL}`}>{priority}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Task Assignment</h1>
          <p className="text-sm text-gray-500 mt-1">{isAdmin ? 'Manage and assign tasks to employees.' : 'View and update your assigned tasks.'}</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" /> Assign New Task
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Tasks Found</h3>
          <p className="text-gray-500 mt-1">There are currently no tasks assigned.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map(task => (
            <div key={task.id} onClick={() => openTaskDetail(task.id)} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <StatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{task.title}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2 flex-1">{task.description || 'No description provided.'}</p>
              
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <div className="flex flex-col">
                  {isAdmin ? (
                    <span>Assigned to: <span className="font-semibold text-gray-900">{task.assignee?.firstName} {task.assignee?.lastName}</span></span>
                  ) : (
                    <span>Assigned by: <span className="font-semibold text-gray-900">{task.assigner?.firstName} {task.assigner?.lastName}</span></span>
                  )}
                  <span className="mt-1">{new Date(task.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  {task._count?.messages || 0}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Assign New Task">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quick Select Template (Optional)</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary mb-2 text-sm text-gray-700 bg-gray-50"
              onChange={(e) => {
                if (!e.target.value) return;
                const template = TASK_TEMPLATES[Number(e.target.value)];
                if (template) {
                  setFormData(prev => ({
                    ...prev,
                    title: template.title,
                    description: template.description,
                    priority: template.priority
                  }));
                }
              }}
            >
              <option value="">-- Select a predefined task template --</option>
              {TASK_TEMPLATES.map((t, idx) => (
                <option key={idx} value={idx}>{t.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
              <select required value={formData.assigneeId} onChange={e => setFormData({...formData, assigneeId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.user.id} value={emp.user.id}>{emp.firstName} {emp.lastName} ({emp.designation?.name})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 text-white bg-primary rounded-lg">Assign Task</button>
          </div>
        </form>
      </Modal>

      {/* VIEW MODAL */}
      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Task Details">
        {selectedTask && (
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-bold text-gray-900">{selectedTask.title}</h2>
                <StatusBadge status={selectedTask.status} />
              </div>
              <p className="text-gray-700 whitespace-pre-wrap text-sm">{selectedTask.description}</p>
              
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                <div><span className="font-semibold">Assigned By:</span> {selectedTask.assigner.firstName}</div>
                <div><span className="font-semibold">Assigned To:</span> {selectedTask.assignee.firstName} {selectedTask.assignee.lastName}</div>
                <div><span className="font-semibold">Priority:</span> <PriorityBadge priority={selectedTask.priority} /></div>
                <div><span className="font-semibold">Created:</span> {new Date(selectedTask.createdAt).toLocaleString()}</div>
              </div>
            </div>

            {/* Status Actions */}
            <div className="flex gap-2">
              <button 
                onClick={() => handleStatusChange(selectedTask.id, 'IN_PROGRESS')}
                disabled={selectedTask.status === 'IN_PROGRESS'}
                className="flex-1 py-2 text-sm font-medium rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 disabled:opacity-50"
              >Mark In Progress</button>
              <button 
                onClick={() => handleStatusChange(selectedTask.id, 'COMPLETED')}
                disabled={selectedTask.status === 'COMPLETED'}
                className="flex-1 py-2 text-sm font-medium rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 disabled:opacity-50"
              >Mark Completed</button>
              {(isAdmin || user?.id === selectedTask.assignerId) && (
                <button 
                  onClick={() => handleDeleteTask(selectedTask.id)}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                  title="Delete Task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Messages Area */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center mb-4">
                <MessageSquare className="w-4 h-4 mr-2 text-gray-500" /> Discussion
              </h3>
              
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2">
                {selectedTask.messages.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4 italic">No messages yet.</p>
                ) : (
                  selectedTask.messages.map((msg: any) => (
                    <div key={msg.id} className={`p-3 rounded-lg text-sm ${msg.userId === user?.id ? 'bg-primary/10 ml-8 border border-primary/20' : 'bg-gray-100 mr-8'}`}>
                      <div className="font-semibold text-xs mb-1 flex justify-between">
                        <span className={msg.userId === user?.id ? 'text-primary' : 'text-gray-700'}>{msg.userId === user?.id ? 'You' : msg.user.firstName}</span>
                        <span className="text-gray-400">{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <div className="text-gray-800 whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input 
                  type="text" 
                  value={messageContent}
                  onChange={e => setMessageContent(e.target.value)}
                  placeholder="Type a message..." 
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary"
                />
                <button type="submit" disabled={!messageContent.trim()} className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg disabled:opacity-50">Send</button>
              </form>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TaskList;
