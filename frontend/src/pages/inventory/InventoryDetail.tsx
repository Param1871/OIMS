import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { inventoryApi } from '@/store/api/inventory.api';
import { ArrowLeft, Edit, AlertTriangle, Package, Activity, MapPin, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const InventoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!id) return;
        const [itemRes, historyRes] = await Promise.all([
          inventoryApi.getById(id),
          inventoryApi.getHistory(id)
        ]);
        
        if (itemRes.success) setItem(itemRes.data);
        if (historyRes.success) setTransactions(historyRes.data);
      } catch (err: any) {
        console.error("Failed to load inventory details", err);
        setError(err.response?.data?.message || 'Failed to load details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-red-500">
        <AlertTriangle className="w-12 h-12 mb-4" />
        <p className="text-lg font-medium">{error || 'Item not found'}</p>
        <Link to="/inventory" className="mt-4 text-primary hover:underline">Return to Inventory</Link>
      </div>
    );
  }

  const isLowStock = item.currentQuantity <= item.reorderLevel;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/inventory" className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{item.name}</h1>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${item.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {item.status}
              </span>
              {item.isCritical && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                  Critical Asset
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Code: <span className="font-medium text-gray-900">{item.itemCode}</span> &bull; 
              Part No: <span className="font-medium text-gray-900">{item.partNumber || 'N/A'}</span>
            </p>
          </div>
        </div>
        <Link 
          to={`/inventory/${item.id}/edit`}
          className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Item
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details (Left Col) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-semibold text-gray-900">Item Specifications</h3>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Category</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-medium">{item.category?.name || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Subcategory</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-medium">{item.subcategory?.name || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Unit of Measure</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-medium">{item.unit}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Purchase Cost (INR)</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-medium">₹ {(item.purchaseCostInr || 0).toLocaleString()}</dd>
                </div>
                {item.manufacturer && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Manufacturer</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-medium">{item.manufacturer.name}</dd>
                  </div>
                )}
                {item.vendor && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Primary Vendor</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-medium">{item.vendor.name}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ref</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Qty</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((tx: any) => (
                    <tr key={tx.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{tx.type.replace(/_/g, ' ')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:underline cursor-pointer">{tx.referenceNumber || 'N/A'}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${tx.type.includes('IN') || tx.type.includes('RECEIVE') ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type.includes('IN') || tx.type.includes('RECEIVE') ? '+' : '-'}{tx.quantity}
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500">No recent transactions</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar (Right Col) */}
        <div className="space-y-6">
          {/* Stock Card */}
          <div className={`bg-white rounded-xl shadow-sm border ${isLowStock ? 'border-red-200 ring-1 ring-red-200' : 'border-gray-100'} p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Package className="w-5 h-5 mr-2 text-gray-400" /> Stock Level
              </h3>
              {isLowStock && (
                <span className="flex items-center text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                  <AlertTriangle className="w-3 h-3 mr-1" /> Low Stock
                </span>
              )}
            </div>
            
            <div className="mb-6">
              <div className="flex items-end gap-2">
                <span className={`text-5xl font-extrabold ${isLowStock ? 'text-red-600' : 'text-gray-900'} tracking-tight`}>
                  {item.currentQuantity}
                </span>
                <span className="text-lg font-medium text-gray-500 mb-1">{item.unit}</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">Available Quantity</p>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Reorder Level</span>
                <span className="font-medium text-gray-900">{item.reorderLevel} {item.unit}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Max Quantity</span>
                <span className="font-medium text-gray-900">{item.maxQuantity || 'N/A'} {item.unit}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Value</span>
                <span className="font-medium text-gray-900">₹ {(item.totalStockValueInr || 0).toLocaleString()}</span>
              </div>
            </div>
            
            <div className="mt-6 w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div 
                className={`h-2.5 rounded-full ${isLowStock ? 'bg-red-500' : 'bg-primary'}`} 
                style={{ width: `${Math.min((item.currentQuantity / ((item.reorderLevel || 1) * 3)) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Location Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
              <MapPin className="w-5 h-5 mr-2 text-gray-400" /> Storage Location
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="font-medium text-gray-900">
                {item.stockLocations && item.stockLocations.length > 0 
                  ? item.stockLocations[0].warehouse?.name || 'Unknown' 
                  : 'Unassigned'}
              </p>
              <p className="text-xs text-gray-500 mt-1">Primary Location</p>
            </div>
          </div>

          {/* Activity / QR Code mockup */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
              <Activity className="w-5 h-5 mr-2 text-gray-400" /> Tracking Flags
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center text-gray-600">
                <span className={`w-2 h-2 rounded-full mr-2 ${item.isImported ? 'bg-amber-500' : 'bg-gray-300'}`}></span> Imported Asset
              </li>
              <li className="flex items-center text-gray-600">
                <span className={`w-2 h-2 rounded-full mr-2 ${item.isCritical ? 'bg-purple-500' : 'bg-gray-300'}`}></span> Critical Priority
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDetail;