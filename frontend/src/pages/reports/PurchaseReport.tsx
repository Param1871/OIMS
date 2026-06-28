import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import { useDispatch } from 'react-redux';
import { addToast } from '@/store/slices/ui.slice';
import { exportToPDF } from '@/utils/export';

const data = [
  { month: 'Jan', spend: 4000000 },
  { month: 'Feb', spend: 3000000 },
  { month: 'Mar', spend: 5500000 },
  { month: 'Apr', spend: 4500000 },
  { month: 'May', spend: 7000000 },
  { month: 'Jun', spend: 6200000 },
];

const PurchaseReport: React.FC = () => {
  const dispatch = useDispatch();

  const handleExport = () => {
    dispatch(addToast({ message: 'Preparing PDF for print/download...', type: 'info' }));
    setTimeout(() => {
      exportToPDF();
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <Link to="/reports" className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Procurement Metrics</h1>
            <p className="text-sm text-gray-500 mt-1">Monthly purchase trends and vendor spend.</p>
          </div>
        </div>
        <button 
          onClick={handleExport}
          className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Procurement Spend (INR)</h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickFormatter={(value) => `₹${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip 
                formatter={(value: number) => [`₹ ${value.toLocaleString()}`, 'Monthly Spend']}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line type="monotone" dataKey="spend" name="Monthly Spend" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PurchaseReport;