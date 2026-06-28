import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store';
import { addToast } from '@/store/slices/ui.slice';
import { Bell, Search, LogOut, User } from 'lucide-react';
import { logout } from '@/store/slices/auth.slice';

const TopBar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleNotification = () => {
    navigate('/notifications');
  };

  const handleProfile = () => {
    dispatch(addToast({ message: 'Profile settings are currently read-only.', type: 'info' }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/inventory?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10 sticky top-0 shadow-sm print:hidden">
      <div className="flex items-center flex-1">
        <form onSubmit={handleSearch} className="max-w-md w-full lg:max-w-xs relative">
          <label htmlFor="search" className="sr-only">Search</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              id="search"
              name="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full bg-gray-50 border border-gray-200 rounded-md py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:outline-none focus:text-gray-900 focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
              placeholder="Search inventory, POs, vendors..."
              type="search"
            />
          </div>
        </form>
      </div>
      
      <div className="flex items-center gap-4 ml-4">
        {/* Notification Bell */}
        <button onClick={handleNotification} className="relative p-2 text-gray-400 hover:text-gray-500 transition-colors rounded-full hover:bg-gray-100">
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          <Bell className="h-5 w-5" />
        </button>
        
        <div className="h-8 w-px bg-gray-200 mx-2"></div>
        
        {/* User Menu Mockup */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-gray-900 leading-none">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-500 mt-1">{user?.designation || user?.roleDisplay || user?.role || 'Employee'}</p>
          </div>
          <button onClick={handleProfile} className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 hover:bg-primary/20 transition-colors">
            <User className="h-5 w-5" />
          </button>
          <button 
            onClick={handleLogout}
            className="ml-2 p-2 text-gray-400 hover:text-red-500 transition-colors rounded-md hover:bg-red-50"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;