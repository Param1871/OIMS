import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ArrowLeft, Download, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useDispatch } from 'react-redux';
import { addToast } from '@/store/slices/ui.slice';
import { exportToPDF } from '@/utils/export';

const data = [
  { name: 'Class A (Top 80% Value)', value: 80, items: 15 },
  { name: 'Class B (Next 15% Value)', value: 15, items: 30 },
  { name: 'Class C (Bottom 5% Value)', value: 5, items: 55 },
];

const COLORS = ['#0ea5e9', '#8b5cf6', '#94a3b8'];

const ABCAnalysis: React.FC = () => {
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
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">ABC Analysis</h1>
            <p className="text-sm text-gray-500 mt-1">Always Better Control (Pareto Principle for Inventory).</p>
          </div>
        </div>
        <button 
          onClick={handleExport}
          className="inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Value Distribution</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}% of Total Value`} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <span className="font-semibold block mb-1">How to interpret this report:</span>
              <p>This report groups inventory items based on their annual consumption value. <strong>Class A</strong> items require tight control, accurate records, and frequent review. <strong>Class C</strong> items require minimum control.</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-semibold text-gray-900">Class Details</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                
                {/* Class A */}
                <div className="border border-gray-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center font-bold text-xl">A</div>
                      <div>
                        <h4 className="font-semibold text-gray-900">High Value Items</h4>
                        <p className="text-xs text-gray-500">Strict control required</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">80.2%</p>
                      <p className="text-xs text-gray-500">of Annual Value</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-t border-gray-50 pt-4">
                    <div>
                      <p className="text-xs text-gray-500">Total Items</p>
                      <p className="font-semibold">2,135 (15%)</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Value (INR)</p>
                      <p className="font-semibold">₹ 389.1M</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Review Frequency</p>
                      <p className="font-semibold text-sky-600">Weekly</p>
                    </div>
                  </div>
                </div>

                {/* Class B */}
                <div className="border border-gray-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xl">B</div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Moderate Value Items</h4>
                        <p className="text-xs text-gray-500">Moderate control</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">14.6%</p>
                      <p className="text-xs text-gray-500">of Annual Value</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-t border-gray-50 pt-4">
                    <div>
                      <p className="text-xs text-gray-500">Total Items</p>
                      <p className="font-semibold">4,270 (30%)</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Value (INR)</p>
                      <p className="font-semibold">₹ 70.8M</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Review Frequency</p>
                      <p className="font-semibold text-purple-600">Monthly</p>
                    </div>
                  </div>
                </div>

                {/* Class C */}
                <div className="border border-gray-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xl">C</div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Low Value Items</h4>
                        <p className="text-xs text-gray-500">Loose control</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">5.2%</p>
                      <p className="text-xs text-gray-500">of Annual Value</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-t border-gray-50 pt-4">
                    <div>
                      <p className="text-xs text-gray-500">Total Items</p>
                      <p className="font-semibold">7,830 (55%)</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Value (INR)</p>
                      <p className="font-semibold">₹ 25.3M</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Review Frequency</p>
                      <p className="font-semibold text-slate-600">Quarterly</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ABCAnalysis;