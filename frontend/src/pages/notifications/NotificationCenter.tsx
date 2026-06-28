import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { addToast } from '@/store/slices/ui.slice';
import { notificationApi } from '@/store/api/notification.api';
import { Bell, Check, Info, AlertTriangle, CheckCircle, Clock, X, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationApi.getMine();
      if (res.success) {
        setNotifications(res.data);
      }
    } catch (err) {
      dispatch(addToast({ message: 'Failed to fetch notifications', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      dispatch(addToast({ message: 'Error marking notification as read', type: 'error' }));
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      fetchNotifications();
      dispatch(addToast({ message: 'All notifications marked as read', type: 'success' }));
    } catch (err) {
      dispatch(addToast({ message: 'Error updating notifications', type: 'error' }));
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await notificationApi.delete(id);
      fetchNotifications();
    } catch (err) {
      dispatch(addToast({ message: 'Error deleting notification', type: 'error' }));
    }
  };

  const handleClearAll = async () => {
    try {
      await notificationApi.clearAll();
      fetchNotifications();
      dispatch(addToast({ message: 'All notifications cleared', type: 'success' }));
    } catch (err) {
      dispatch(addToast({ message: 'Error clearing notifications', type: 'error' }));
    }
  };

  const handleActionClick = (notif: any) => {
    if (!notif.isRead) handleMarkAsRead(notif.id);
    if (notif.notification.entityType === 'task') {
      navigate('/tasks');
    }
  };

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'SUCCESS': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'WARNING': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'ERROR': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center">
            <Bell className="w-6 h-6 mr-2 text-primary" /> Notification Center
          </h1>
          <p className="text-sm text-gray-500 mt-1">You have {unreadCount} unread notifications.</p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Check className="w-4 h-4 mr-2" /> Mark all as read
            </button>
          )}
          {notifications.length > 0 && (
            <button 
              onClick={handleClearAll}
              className="inline-flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors shadow-sm"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Clear All
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p>You're all caught up! No notifications right now.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map(n => (
              <div 
                key={n.id} 
                onClick={() => handleActionClick(n)}
                className={`group p-4 sm:p-5 flex gap-4 cursor-pointer hover:bg-gray-50 transition-colors relative ${!n.isRead ? 'bg-blue-50/50' : ''}`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getIcon(n.notification.severity)}
                </div>
                <div className="flex-1 pr-8">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`text-sm font-semibold ${!n.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                      {n.notification.title}
                    </h3>
                    <span className="text-xs text-gray-400 flex items-center whitespace-nowrap ml-4">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className={`text-sm ${!n.isRead ? 'text-gray-700' : 'text-gray-500'}`}>
                    {n.notification.message}
                  </p>
                </div>
                <button 
                  onClick={(e) => handleDelete(e, n.notificationId)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                  title="Clear notification"
                >
                  <X className="w-5 h-5" />
                </button>
                {!n.isRead && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;