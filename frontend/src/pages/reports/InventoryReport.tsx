import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

import { useDispatch } from 'react-redux';
import { addToast } from '@/store/slices/ui.slice';
import { exportToCSV } from '@/utils/export';

const data = [
  { name: 'Aero Engine', value: 125000000 },
  { name: 'Hydraulics', value: 85000000 },
  { name: 'Avionics', value: 210000000 },
  { name: 'Consumables', value: 15200000 },
  { name: 'Raw Materials', value: 50000000 },
];

const InventoryReport: React.FC = () => {
  const dispatch = useDispatch();

  const handleExport = () => {
    exportToCSV(data, 'inventory_valuation_report');
    dispatch(addToast({ message: 'Report exported successfully to CSV.', type: 'success' }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/reports" className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Inventory Valuation Report</h1>
            <p className="text-sm text-gray-500 mt-1">Breakdown of stock value by category.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => dispatch(addToast({ message: 'Filter options opened.', type: 'info' }))}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
          <button 
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Value by Category (INR)</h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickFormatter={(value) => `₹${(value / 1000000).toFixed(0)}M`}
              />
              <RechartsTooltip 
                cursor={{ fill: '#f3f4f6' }}
                formatter={(value: number) => [`₹ ${value.toLocaleString()}`, 'Total Value']}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="value" name="Inventory Value" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default InventoryReport;