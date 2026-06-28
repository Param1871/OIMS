import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { updateItemStatus, deleteItem } from '@/store/slices/data.slice';
import { addToast } from '@/store/slices/ui.slice';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { inventoryApi } from '@/store/api/inventory.api';
import { 
  Plus, Search, Filter, Download, MoreVertical, 
  AlertTriangle, ArrowRight, Eye, Edit, Trash2, Loader2
} from 'lucide-react';

const InventoryList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const mockInventory = useSelector((state: RootState) => state.data.inventory);
  const [inventory, setInventory] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [loading, setLoading] = useState(true);
  
  const user = useSelector((state: RootState) => state.auth.user);
  const canEdit = user?.role === 'SUPER_ADMIN' || user?.role === 'INVENTORY_MANAGER';

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await inventoryApi.getAll();
        if (res.success) setInventory(res.data);
      } catch (err) {
        console.error("Failed to load real inventory, falling back to mock", err);
        setInventory(mockInventory); // Fallback
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [mockInventory]);

  const filteredItems = inventory.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.itemCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Inventory Items</h1>
          <p className="text-sm text-gray-500 mt-1">Manage aerospace components, raw materials, and consumables.</p>
        </div>
        {canEdit && (
          <Link 
            to="/inventory/add" 
            className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Item
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by code, part number or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-all"
            />
          </div>
          <button 
            onClick={() => dispatch(addToast({ message: 'Filter panel opened.', type: 'info' }))}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4 mr-2 text-gray-400" />
            Filters
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Item Details
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Stock Level
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => {
                const isLowStock = item.currentQuantity <= item.minimumStock;
                
                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 font-bold border border-gray-200">
                          {item.itemCode ? item.itemCode.substring(4, 7) : 'NA'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors">
                            <Link to={`/inventory/${item.id}`}>{item.name}</Link>
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {item.itemCode || 'No Code'} &bull; {item.partNumber || 'No PN'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{typeof item.category === 'object' ? item.category?.name : item.category}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{typeof item.subcategory === 'object' ? item.subcategory?.name : item.subcategory}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                        {item.currentQuantity} {item.unit}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">Min: {item.minimumStock}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.status}
                      </span>
                      {isLowStock && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Low Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`/inventory/${item.id}`} className="text-gray-400 hover:text-primary p-1 rounded-md hover:bg-gray-100 transition-colors">
                          <Eye className="w-4 h-4" />
                        </Link>
                        {canEdit && (
                          <>
                            <Link to={`/inventory/${item.id}/edit`} className="text-gray-400 hover:text-amber-500 p-1 rounded-md hover:bg-amber-50 transition-colors">
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button 
                              onClick={async () => {
                                if (window.confirm(`Are you sure you want to delete ${item.name}?`)) {
                                  try {
                                    await inventoryApi.delete(item.id);
                                    dispatch(addToast({ message: `${item.name} deleted successfully`, type: 'success' }));
                                    const res = await inventoryApi.getAll();
                                    if (res.success) setInventory(res.data);
                                  } catch (err: any) {
                                    dispatch(addToast({ message: err.response?.data?.message || `Failed to delete ${item.name}`, type: 'error' }));
                                  }
                                }
                              }}
                              className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium text-gray-900">{filteredItems.length > 0 ? 1 : 0}</span> to <span className="font-medium text-gray-900">{filteredItems.length}</span> of <span className="font-medium text-gray-900">{inventory.length}</span> results
          </div>
          <div className="flex gap-2">
            <button disabled className="px-3 py-1 border border-gray-300 rounded bg-white text-sm font-medium text-gray-400 cursor-not-allowed">Previous</button>
            <button disabled className="px-3 py-1 border border-gray-300 rounded bg-white text-sm font-medium text-gray-400 cursor-not-allowed">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryList;