
import React, { useState } from 'react';
import { User } from '../types';
import { Lock, User as UserIcon } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
  isLoading: boolean;
}

export const Login: React.FC<LoginProps> = ({ onLogin, isLoading }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await onLogin(username, password);
    if (!success) {
      setError('Tên đăng nhập hoặc mật khẩu không đúng');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center vnpt-gradient p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img 
              src="https://hcom.vn/wp-content/uploads/2021/04/logo-VNPT.jpg" 
              alt="VNPT Logo" 
              className="h-40 object-contain hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.src = "https://via.placeholder.com/300x150.png?text=VNPT+Logo"; // Fallback nếu ảnh lỗi
              }}
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">QUẢN LÝ BÁN HÀNG</h1>
          <p className="text-blue-600 font-medium">VNPT Hàm Yên - Tuyên Quang</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium">
              {error}
            </div>
          )}
          
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              required 
              placeholder="Tên đăng nhập" 
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="password" 
              required 
              placeholder="Mật khẩu" 
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wider"
          >
            {isLoading ? 'Đang đăng nhập...' : 'ĐĂNG NHẬP HỆ THỐNG'}
          </button>
        </form>
        
        <div className="mt-8 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} VNPT VinaPhone. All rights reserved.
        </div>
      </div>
    </div>
  );
};
