import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { warehouseApi } from '@/store/api/warehouse.api';
import { ArrowLeft, MapPin, Warehouse, Package, Loader2 } from 'lucide-react';

const WarehouseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [warehouse, setWarehouse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWarehouse = async () => {
      try {
        if (!id) return;
        const res = await warehouseApi.getById(id);
        if (res.success) setWarehouse(res.data);
      } catch (err) {
        console.error("Failed to load warehouse details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWarehouse();
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!warehouse) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Warehouse not found</h3>
        <Link to="/warehouse" className="mt-4 inline-flex items-center text-primary hover:underline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Warehouses
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/warehouse" className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{warehouse.name}</h1>
          <p className="text-sm text-gray-500 mt-1">Code: {warehouse.code} | Type: {warehouse.type}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          <div className="p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Location</h3>
            <p className="mt-2 text-lg font-semibold text-gray-900">{warehouse.city || 'N/A'}, {warehouse.state || 'N/A'}</p>
            <p className="text-sm text-gray-500">{warehouse.address || 'No address provided'}</p>
          </div>
          <div className="p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-3">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Zones</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{warehouse.zones?.length || 0}</p>
          </div>
          <div className="p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-3">
              <Warehouse className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Status</h3>
            <p className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${warehouse.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {warehouse.isActive ? 'Active Facility' : 'Inactive Facility'}
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Stock Locations Overview</h2>
        {warehouse.stockLocations && warehouse.stockLocations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Item Code</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Item Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {warehouse.stockLocations.map((loc: any) => (
                  <tr key={loc.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{loc.item?.itemCode}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loc.item?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{loc.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            No stock recorded at this facility.
          </div>
        )}
      </div>
    </div>
  );
};

export default WarehouseDetail;