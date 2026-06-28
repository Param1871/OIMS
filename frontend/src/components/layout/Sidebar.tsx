import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Warehouse, 
  ShoppingCart, 
  Users, 
  Settings, 
  Wrench, 
  Factory,
  FileText,
  CheckSquare
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { cn } from '@/utils/cn'; // We will create this utility

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Tasks', path: '/tasks', icon: CheckSquare },
  { name: 'Inventory', path: '/inventory', icon: Package },
  { name: 'Warehouse', path: '/warehouse', icon: Warehouse },
  { name: 'Purchase', path: '/purchase', icon: ShoppingCart },
  { name: 'Production', path: '/production', icon: Factory },
  { name: 'Maintenance', path: '/maintenance', icon: Wrench },
  { name: 'Employees', path: '/employees', icon: Users },
  { name: 'Reports', path: '/reports', icon: FileText },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const Sidebar: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const role = user?.role || 'READ_ONLY';

  const visibleNavItems = navItems.filter(item => {
    if (role === 'SUPER_ADMIN') return true;
    if (item.name === 'Dashboard' || item.name === 'Inventory' || item.name === 'Tasks') return true;
    if (role === 'INVENTORY_MANAGER' && ['Warehouse', 'Purchase', 'Reports'].includes(item.name)) return true;
    if (role === 'STORE_KEEPER' && ['Warehouse'].includes(item.name)) return true;
    if (role === 'PURCHASE_DEPARTMENT' && ['Purchase', 'Reports'].includes(item.name)) return true;
    if (role === 'PRODUCTION_DEPARTMENT' && ['Production'].includes(item.name)) return true;
    if (role === 'MAINTENANCE_DEPARTMENT' && ['Maintenance'].includes(item.name)) return true;
    if (role === 'FINANCE_DEPARTMENT' && ['Reports'].includes(item.name)) return true;
    return false;
  });

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-all duration-300 print:hidden">
      <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold text-xl">
            H
          </div>
          <span className="text-white font-bold text-lg tracking-tight">OIMS Enterprise</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-slate-800 hover:text-white'
                )
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        &copy; {new Date().getFullYear()} HAL OIMS v1.0
      </div>
    </aside>
  );
};

export default Sidebar;