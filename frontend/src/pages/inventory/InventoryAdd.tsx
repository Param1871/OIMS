import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { inventoryApi } from '@/store/api/inventory.api';
import { categoryApi } from '@/store/api/category.api';
import { vendorApi } from '@/store/api/vendor.api';
import { ArrowLeft, Save, X, Loader2, AlertCircle } from 'lucide-react';

const InventoryAdd: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dropdowns
  const [categories, setCategories] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    itemCode: '',
    name: '',
    description: '',
    categoryId: '',
    vendorId: '',
    unit: 'EACH',
    minimumStock: 10,
    reorderLevel: 20,
    maximumStock: 100,
    purchaseCostInr: 0,
    isBatchTracked: false,
    isSerialTracked: false,
    isCritical: false
  });

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const cRes = await categoryApi.getAll();
        if (cRes.success) setCategories(cRes.data);
        const vRes = await vendorApi.getAll();
        if (vRes.success) setVendors(vRes.data);
      } catch (err) {
        console.error("Failed to load dropdowns", err);
      }
    };
    fetchDropdowns();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...formData,
      vendorId: formData.vendorId || undefined,
      minimumStock: Number(formData.minimumStock),
      reorderLevel: Number(formData.reorderLevel),
      maximumStock: Number(formData.maximumStock),
      purchaseCostInr: Number(formData.purchaseCostInr)
    };

    try {
      const res = await inventoryApi.create(payload);
      if (res.success) {
        navigate('/inventory');
      } else {
        setError(res.message || "Failed to create item");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/inventory" className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Add New Item</h1>
            <p className="text-sm text-gray-500 mt-1">Create a new master record in the inventory database.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center shadow-sm">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" placeholder="e.g. Turbine Blade (AL-31FP Engine)" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Code *</label>
              <input type="text" required value={formData.itemCode} onChange={e => setFormData({...formData, itemCode: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" placeholder="e.g. HAL-ENG-001" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" placeholder="Detailed technical description..."></textarea>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-lg font-semibold text-gray-900">Classification & Sourcing</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select required value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white">
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Vendor</label>
              <select value={formData.vendorId} onChange={e => setFormData({...formData, vendorId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white">
                <option value="">Select Vendor (Optional)</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-lg font-semibold text-gray-900">Quantities, Limits & Pricing</h3>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit of Measure *</label>
              <select required value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white">
                <option value="EACH">EACH</option>
                <option value="SET">SET</option>
                <option value="KG">KG</option>
                <option value="LITER">LITER</option>
                <option value="PACK">PACK</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost (INR) *</label>
              <input type="number" min="0" required value={formData.purchaseCostInr} onChange={e => setFormData({...formData, purchaseCostInr: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stock Alert</label>
              <input type="number" min="0" value={formData.minimumStock} onChange={e => setFormData({...formData, minimumStock: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Level</label>
              <input type="number" min="0" value={formData.reorderLevel} onChange={e => setFormData({...formData, reorderLevel: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Stock</label>
              <input type="number" min="0" value={formData.maximumStock} onChange={e => setFormData({...formData, maximumStock: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-lg font-semibold text-gray-900">Tracking Flags</h3>
          </div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors w-full sm:w-1/3">
                <input type="checkbox" checked={formData.isBatchTracked} onChange={e => setFormData({...formData, isBatchTracked: e.target.checked})} className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary" />
                <span className="ml-3 text-sm font-medium text-gray-900">Batch Tracked</span>
              </label>
              <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors w-full sm:w-1/3">
                <input type="checkbox" checked={formData.isSerialTracked} onChange={e => setFormData({...formData, isSerialTracked: e.target.checked})} className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary" />
                <span className="ml-3 text-sm font-medium text-gray-900">Serial Tracked</span>
              </label>
              <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors w-full sm:w-1/3">
                <input type="checkbox" checked={formData.isCritical} onChange={e => setFormData({...formData, isCritical: e.target.checked})} className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary" />
                <span className="ml-3 text-sm font-medium text-gray-900 flex items-center gap-1">Critical Asset <span className="text-xs text-red-500 font-normal">(Alert on low)</span></span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 pb-12">
          <button type="button" onClick={() => navigate('/inventory')} className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="inline-flex justify-center items-center px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 transition-all">
            {loading ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Item</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InventoryAdd;