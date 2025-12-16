import React, { useState, useRef } from 'react';
import { User, Role } from '../types';
import { Trash2, Lock, Unlock, UserPlus, Shield, Check, Camera, User as UserIcon, UploadCloud } from 'lucide-react';

interface UserManagementProps {
  currentUser: User;
  users: User[];
  onAddUser: (user: Omit<User, 'id' | 'created_at'>) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ currentUser, users, onAddUser, onUpdateUser, onDeleteUser }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    employee_name: '',
    avatar: '',
    position: '',
    management_area: '',
    username: '',
    password: '',
    role: 'employee' as Role,
  });

  // Logic phân quyền cấp bậc tạo user
  const availableRoles = currentUser.role === 'admin' 
    ? [
        { value: 'admin', label: 'Quản Trị Viên (Admin)', desc: 'Toàn quyền hệ thống, quản lý người dùng, xem tất cả báo cáo.' },
        { value: 'manager', label: 'Quản Lý (Manager)', desc: 'Duyệt kế hoạch, đánh giá nhân viên, xem báo cáo tổng hợp.' },
        { value: 'employee', label: 'Nhân Viên (Employee)', desc: 'Lập kế hoạch tuần, báo cáo ngày, xem đánh giá cá nhân.' }
      ]
    : [
        { value: 'employee', label: 'Nhân Viên (Employee)', desc: 'Lập kế hoạch tuần, báo cáo ngày, xem đánh giá cá nhân.' }
      ];

  const currentRoleDesc = availableRoles.find(r => r.value === formData.role)?.desc;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Limit 2MB
        alert("Kích thước ảnh quá lớn (giới hạn 2MB)");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddUser({
      ...formData,
      employee_id: `EMP_${Date.now()}`,
      is_active: true
    });
    setFormData({
      employee_name: '',
      avatar: '',
      position: '',
      management_area: '',
      username: '',
      password: '',
      role: 'employee',
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-600">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <UserPlus size={24} className="text-blue-600" />
          Thêm Người Dùng & Phân Quyền
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Cột Trái: Ảnh đại diện */}
            <div className="w-full md:w-1/4 flex flex-col items-center gap-4">
              <div 
                className="relative w-40 h-40 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 group hover:border-blue-500 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-gray-400">
                    <Camera size={32} className="mx-auto mb-1" />
                    <span className="text-xs">Tải ảnh lên</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <UploadCloud className="text-white" size={24} />
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange}
              />
              <p className="text-xs text-gray-500 text-center">
                Dạng file: .jpg, .png<br/>Kích thước tối đa: 2MB
              </p>
            </div>

            {/* Cột Phải: Thông tin */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Họ và Tên</label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={formData.employee_name}
                  onChange={e => setFormData({...formData, employee_name: e.target.value})}
                  placeholder="VD: Nguyễn Văn A"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Chức Danh</label>
                <select
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Địa Bàn Quản Lý</label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={formData.management_area}
                  onChange={e => setFormData({...formData, management_area: e.target.value})}
                  placeholder="VD: Xã Yên Thuận"
                />
              </div>
              
              {/* PHẦN PHÂN QUYỀN */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 md:col-span-1 md:row-span-2">
                <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <Shield size={16} className="text-blue-600" />
                  Cấp Độ Truy Cập (Role)
                </label>
                <select
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all mb-3"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value as Role})}
                >
                  {availableRoles.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
                
                {currentRoleDesc && (
                  <div className="text-xs text-blue-800 bg-blue-50 p-3 rounded border border-blue-100 flex gap-2 items-start">
                    <Check size={14} className="mt-0.5 flex-shrink-0" />
                    <span><strong>Quyền hạn:</strong> {currentRoleDesc}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tên Đăng Nhập</label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mật Khẩu</label>
                <input
                  required
                  type="password"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-2 border-t mt-4">
            <button 
              type="submit" 
              className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <UserPlus size={20} />
              Thêm Người Dùng
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Danh Sách Người Dùng ({users.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Thông tin cá nhân</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Chức Danh</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Địa Bàn</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Quyền</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Trạng Thái</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-right">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map(user => {
                const isCurrentUser = user.id === currentUser.id;
                let canModify = false;
                if (currentUser.role === 'admin') {
                  canModify = true;
                } else if (currentUser.role === 'manager') {
                  canModify = user.role === 'employee';
                }
                if (isCurrentUser) canModify = false;

                return (
                  <tr key={user.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden border border-gray-300">
                          {user.avatar ? (
                            <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <UserIcon size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{user.employee_name}</div>
                          <div className="text-xs text-gray-500 font-mono mt-0.5">{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{user.position}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{user.management_area}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-bold border
                        ${user.role === 'admin' ? 'bg-red-50 text-red-700 border-red-100' : 
                          user.role === 'manager' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                        {user.role === 'admin' ? 'ADMIN' : user.role === 'manager' ? 'QUẢN LÝ' : 'NHÂN VIÊN'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 text-xs rounded-full font-semibold
                        ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        <span className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        {user.is_active ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          disabled={!canModify}
                          onClick={() => onUpdateUser({...user, is_active: !user.is_active})}
                          className={`p-2 rounded-lg text-white transition-all shadow-sm hover:shadow-md active:scale-95 
                            ${!canModify ? 'bg-gray-200 cursor-not-allowed text-gray-400' : (user.is_active ? 'bg-amber-500 hover:bg-amber-600' : 'bg-green-500 hover:bg-green-600')}`}
                          title={!canModify ? 'Bạn không có quyền thao tác user này' : (user.is_active ? 'Khóa tài khoản' : 'Mở khóa tài khoản')}
                        >
                          {user.is_active ? <Lock size={18} /> : <Unlock size={18} />}
                        </button>
                        <button
                          type="button"
                          disabled={!canModify}
                          onClick={() => {
                            if (canModify && window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${user.employee_name}" không?`)) {
                              onDeleteUser(user.id);
                            }
                          }}
                          className={`p-2 rounded-lg text-white transition-all shadow-sm hover:shadow-md active:scale-95 
                            ${!canModify ? 'bg-gray-200 cursor-not-allowed text-gray-400' : 'bg-red-500 hover:bg-red-600'}`}
                          title={!canModify ? 'Bạn không có quyền xóa user này' : 'Xóa người dùng'}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};