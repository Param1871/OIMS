import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/slices/auth.slice';
import { Lock, User, ShieldAlert } from 'lucide-react';
import api from '@/store/api/base.api';

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const [loginType, setLoginType] = useState<'employee' | 'admin'>('employee');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    try {
      const response = await api.post('/auth/login', { username, password });
      if (response.data.success) {
        dispatch(setCredentials({ 
          user: response.data.data.user,
          token: response.data.data.accessToken
        }));
      } else {
        setErrorMsg(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (type: 'employee' | 'admin') => {
    setLoginType(type);
    if (type === 'admin') {
      setUsername('admin');
    } else {
      setUsername('');
    }
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
        <div>
          <div className="mx-auto h-16 w-16 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
            <span className="text-3xl font-extrabold tracking-tighter">H</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
            Sign in to HAL OIMS
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 font-medium">
            Enterprise Inventory Management System
          </p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => handleTabChange('employee')}
            className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${loginType === 'employee' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <User className="w-4 h-4 mr-2" /> Employee
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('admin')}
            className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${loginType === 'admin' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <ShieldAlert className="w-4 h-4 mr-2" /> Administrator
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {errorMsg}
          </div>
        )}

        <form className="mt-4 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {loginType === 'admin' ? 'Administrator Username' : 'Employee Username'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {loginType === 'admin' ? <ShieldAlert className="h-5 w-5 text-gray-400" /> : <User className="h-5 w-5 text-gray-400" />}
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full px-3 py-2.5 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm transition-colors"
                  placeholder={loginType === 'admin' ? 'admin' : 'e.g. john.doe'}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full px-3 py-2.5 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm transition-colors"
                  placeholder="Password"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <a href="#" className="font-medium text-primary hover:text-primary/80">
                Forgot password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-primary/20"
            >
              {loading ? 'Authenticating...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;