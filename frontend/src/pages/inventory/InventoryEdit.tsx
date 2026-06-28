import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, AlertTriangle } from 'lucide-react';
import { inventoryApi } from '@/store/api/inventory.api';

const InventoryEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    itemCode: '',
    partNumber: '',
    categoryId: '',
    subcategoryId: '',
    status: 'ACTIVE',
    purchaseCostInr: 0,
    reorderLevel: 0,
  });

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        if (!id) return;
        const res = await inventoryApi.getById(id);
        if (res.success) {
          const item = res.data;
          setFormData({
            name: item.name || '',
            itemCode: item.itemCode || '',
            partNumber: item.partNumber || '',
            categoryId: item.categoryId || '',
            subcategoryId: item.subcategoryId || '',
            status: item.status || 'ACTIVE',
            purchaseCostInr: item.purchaseCostInr || 0,
            reorderLevel: item.reorderLevel || 0,
          });
        }
      } catch (err: any) {
        console.error("Failed to load item for editing", err);
        setError(err.response?.data?.message || 'Failed to load item');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    try {
      setSaving(true);
      await inventoryApi.update(id, {
        name: formData.name,
        partNumber: formData.partNumber,
        status: formData.status,
        purchaseCostInr: formData.purchaseCostInr,
        reorderLevel: formData.reorderLevel,
      });
      navigate(`/inventory/${id}`);
    } catch (err: any) {
      console.error("Failed to update item", err);
      alert(err.response?.data?.message || "Failed to update item");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-red-500">
        <AlertTriangle className="w-12 h-12 mb-4" />
        <p className="text-lg font-medium">{error}</p>
        <Link to="/inventory" className="mt-4 text-primary hover:underline">Return to Inventory</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={`/inventory/${id}`} className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Edit Item: {formData.name}</h1>
            <p className="text-sm text-gray-500 mt-1">Update master record details.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Code *</label>
              <input type="text" name="itemCode" value={formData.itemCode} disabled className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Part Number</label>
              <input type="text" name="partNumber" value={formData.partNumber} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-lg font-semibold text-gray-900">Status & Limits</h3>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="DISCONTINUED">Discontinued</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Cost (INR) *</label>
              <input type="number" min="0" name="purchaseCostInr" value={formData.purchaseCostInr} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Level Alert</label>
              <input type="number" min="0" name="reorderLevel" value={formData.reorderLevel} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 pb-12">
          <button type="button" onClick={() => navigate(`/inventory/${id}`)} className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="inline-flex justify-center items-center px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 transition-all">
            {saving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InventoryEdit;