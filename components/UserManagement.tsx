import React, { useState } from 'react';
import { User, Role } from '../types';
import { Trash2, Lock, Unlock, UserPlus } from 'lucide-react';

interface UserManagementProps {
  users: User[];
  onAddUser: (user: Omit<User, 'id' | 'created_at'>) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ users, onAddUser, onUpdateUser, onDeleteUser }) => {
  const [formData, setFormData] = useState({
    employee_name: '',
    position: '',
    management_area: '',
    username: '',
    password: '',
    role: 'employee' as Role,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddUser({
      ...formData,
      employee_id: `EMP_${Date.now()}`,
      is_active: true
    });
    setFormData({
      employee_name: '',
      position: '',
      management_area: '',
      username: '',
      password: '',
      role: 'employee',
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <UserPlus size={24} className="text-blue-600" />
          Thêm Người Dùng Mới
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và Tên</label>
              <input
                required
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.employee_name}
                onChange={e => setFormData({...formData, employee_name: e.target.value})}
                placeholder="VD: Nguyễn Văn A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chức Danh</label>
              <select
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.position}
                onChange={e => setFormData({...formData, position: e.target.value})}
              >
                <option value="">-- Chọn chức danh --</option>
                <option value="Nhân viên kinh doanh">Nhân viên kinh doanh</option>
                <option value="Tổ trưởng kinh doanh">Tổ trưởng kinh doanh</option>
                <option value="Phó phòng kinh doanh">Phó phòng kinh doanh</option>
                <option value="Trưởng phòng kinh doanh">Trưởng phòng kinh doanh</option>
                <option value="Giám đốc">Giám đốc</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa Bàn Quản Lý</label>
              <input
                required
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.management_area}
                onChange={e => setFormData({...formData, management_area: e.target.value})}
                placeholder="VD: Xã Yên Thuận"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quyền Hạn</label>
              <select
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value as Role})}
              >
                <option value="employee">Nhân viên</option>
                <option value="manager">Quản lý</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên Đăng Nhập</label>
              <input
                required
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật Khẩu</label>
              <input
                required
                type="password"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>
          <button type="submit" className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
            Thêm Người Dùng
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Danh Sách Người Dùng</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Họ Tên</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Chức Danh</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Địa Bàn</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Quyền</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Trạng Thái</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{user.employee_name}</div>
                    <div className="text-xs text-gray-500">{user.username}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{user.position}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{user.management_area}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-semibold
                      ${user.role === 'admin' ? 'bg-red-100 text-red-800' : 
                        user.role === 'manager' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-semibold
                      ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {user.is_active ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onUpdateUser({...user, is_active: !user.is_active})}
                        className={`p-1.5 rounded-md text-white transition-colors ${user.is_active ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}`}
                        title={user.is_active ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                      >
                        {user.is_active ? <Lock size={16} /> : <Unlock size={16} />}
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Xóa người dùng ${user.employee_name}?`)) {
                            onDeleteUser(user.id);
                          }
                        }}
                        className="p-1.5 rounded-md bg-red-500 hover:bg-red-600 text-white transition-colors"
                        title="Xóa người dùng"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};