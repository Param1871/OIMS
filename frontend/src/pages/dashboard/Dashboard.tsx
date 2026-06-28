import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { addToast } from '@/store/slices/ui.slice';
import { exportToPDF } from '@/utils/export';
import { inventoryApi } from '@/store/api/inventory.api';
import { transactionApi } from '@/store/api/transaction.api';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Package, 
  ShoppingCart, 
  AlertTriangle, 
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Loader2,
  IndianRupee
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const stockData = [
  { name: 'Mon', inbound: 40, outbound: 24 },
  { name: 'Tue', inbound: 30, outbound: 13 },
  { name: 'Wed', inbound: 20, outbound: 98 },
  { name: 'Thu', inbound: 27, outbound: 39 },
  { name: 'Fri', inbound: 18, outbound: 48 },
  { name: 'Sat', inbound: 23, outbound: 38 },
  { name: 'Sun', inbound: 34, outbound: 43 },
];

const StatCard = ({ title, value, icon: Icon, trend, colorClass }: any) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>
      {trend && (
        <p className="text-sm font-medium text-green-600 mt-2 flex items-center">
          <TrendingUp className="w-4 h-4 mr-1" />
          {trend}
        </p>
      )}
    </div>
    <div className={`p-3 rounded-lg ${colorClass}`}>
      <Icon className="w-6 h-6" />
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const canEdit = user?.role === 'SUPER_ADMIN' || user?.role === 'INVENTORY_MANAGER' || user?.role === 'STORE_KEEPER';
  
  const [stats, setStats] = useState<any>(null);
  const [recentTxns, setRecentTxns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, txnRes] = await Promise.all([
          inventoryApi.getDashboardStats(),
          transactionApi.getAll({ pageSize: 5 })
        ]);
        
        if (statsRes.success) setStats(statsRes.data);
        if (txnRes.success) setRecentTxns(txnRes.data);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleDownloadReport = () => {
    dispatch(addToast({ message: 'Preparing Dashboard PDF...', type: 'info' }));
    setTimeout(() => {
      exportToPDF();
    }, 500);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back. Here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleDownloadReport}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            Download Report
          </button>
          {canEdit && (
            <button 
              onClick={() => navigate('/transactions/new')}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
            >
              New Adjustment
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Inventory Items" 
          value={stats?.totalItems || 0} 
          icon={Package} 
          colorClass="bg-blue-50 text-blue-600"
        />
        <StatCard 
          title="Low Stock Alerts" 
          value={stats?.lowStockItems || 0} 
          icon={AlertTriangle} 
          colorClass="bg-amber-50 text-amber-600"
        />
        <StatCard 
          title="Out of Stock" 
          value={stats?.outOfStockItems || 0} 
          icon={AlertTriangle} 
          colorClass="bg-red-50 text-red-600"
        />
        <StatCard 
          title="Total Stock Value" 
          value={`₹${(stats?.totalStockValueInr || 0).toLocaleString()}`} 
          icon={IndianRupee} 
          colorClass="bg-green-50 text-green-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[400px]">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Movement Trend</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stockData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOutbound" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <Tooltip />
                <Area type="monotone" dataKey="inbound" stroke="#10b981" fillOpacity={1} fill="url(#colorInbound)" />
                <Area type="monotone" dataKey="outbound" stroke="#f59e0b" fillOpacity={1} fill="url(#colorOutbound)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            <button 
              onClick={() => navigate('/transactions')}
              className="text-sm font-medium text-primary hover:text-primary/80 flex items-center"
            >
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          
          <div className="space-y-4">
            {recentTxns.slice(0, 6).map((txn) => {
              const isReceipt = txn.type.includes('RECEIVE') || txn.type.includes('IN');
              return (
                <div key={txn.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isReceipt ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{txn.item?.name || 'Item'} ({txn.quantity} {txn.item?.unit})</p>
                      <p className="text-xs text-gray-500">{txn.type.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-500">
                    {formatDistanceToNow(new Date(txn.createdAt), { addSuffix: true })}
                  </span>
                </div>
              );
            })}
            {recentTxns.length === 0 && (
              <div className="text-sm text-gray-500 text-center py-4">No recent transactions</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;