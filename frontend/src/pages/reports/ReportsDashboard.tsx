import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportApi } from '@/store/api/report.api';
import { BarChart3, PieChart, TrendingUp, Package, ShoppingCart, IndianRupee, ArrowRight, Loader2 } from 'lucide-react';

const ReportCard = ({ title, description, icon: Icon, link, colorClass }: any) => (
  <Link to={link} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all group flex flex-col h-full">
    <div className={`w-12 h-12 rounded-lg ${colorClass} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-500 mb-6 flex-grow">{description}</p>
    <div className="flex items-center text-sm font-medium text-primary mt-auto">
      View Report <ArrowRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  </Link>
);

const ReportsDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await reportApi.getDashboard();
        if (res.success) setStats(res.data);
      } catch (err) {
        console.error("Failed to load dashboard report stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Reports & Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Enterprise intelligence and supply chain metrics.</p>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
          <div className="p-4 bg-green-50 text-green-600 rounded-full">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Inventory Value</p>
            <p className="text-2xl font-bold text-gray-900">₹ {(stats?.totalStockValueInr / 1000000 || 0).toFixed(1)}M</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-full">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Pending POs</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.pendingPurchaseOrders || 0}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-full">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Stock Items</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.totalItems || 0}</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ReportCard 
            title="ABC Analysis"
            description="Categorize inventory into A, B, and C classes based on annual consumption value to prioritize control efforts."
            icon={PieChart}
            link="/reports/abc-analysis"
            colorClass="bg-purple-50 text-purple-600"
          />
          <ReportCard 
            title="Inventory Valuation"
            description="Comprehensive breakdown of stock value by category, warehouse, and aging."
            icon={BarChart3}
            link="/reports/inventory"
            colorClass="bg-blue-50 text-blue-600"
          />
          <ReportCard 
            title="Procurement Metrics"
            description="Analyze vendor performance, purchase order lifecycle times, and material cost trends."
            icon={TrendingUp}
            link="/reports/purchase"
            colorClass="bg-emerald-50 text-emerald-600"
          />
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;