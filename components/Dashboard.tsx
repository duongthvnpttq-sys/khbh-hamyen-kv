import React, { useMemo } from 'react';
import { User, Plan } from '../types';
import { Users, FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

interface DashboardProps {
  users: User[];
  plans: Plan[];
}

export const Dashboard: React.FC<DashboardProps> = ({ users, plans }) => {
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.is_active).length;
    
    // Calculate current week
    const now = new Date();
    const oneJan = new Date(now.getFullYear(), 0, 1);
    const numberOfDays = Math.floor((now.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
    const currentWeekNum = Math.ceil((now.getDay() + 1 + numberOfDays) / 7);
    const currentWeekStr = `Tuần ${currentWeekNum}`;

    const weekPlans = plans.filter(p => p.week_number === currentWeekStr);
    const completedPlans = plans.filter(p => p.status === 'completed');
    const pendingPlans = plans.filter(p => p.status === 'pending');
    
    // Performance Data
    const weekDataMap: Record<string, { week: string, target: number, result: number }> = {};
    
    plans.filter(p => p.status === 'completed' || p.status === 'approved').forEach(p => {
      // Initialize if empty
      if (!weekDataMap[p.week_number]) {
        weekDataMap[p.week_number] = { week: p.week_number, target: 0, result: 0 };
      }
      
      const totalTarget = (p.sim_target || 0) + (p.vas_target || 0) + (p.fiber_target || 0) + (p.mytv_target || 0) + (p.mesh_camera_target || 0) + (p.cntt_target || 0);
      
      // Only count results for completed plans
      let totalResult = 0;
      if (p.status === 'completed') {
        totalResult = (p.sim_result || 0) + (p.vas_result || 0) + (p.fiber_result || 0) + (p.mytv_result || 0) + (p.mesh_camera_result || 0) + (p.cntt_result || 0);
      }
      
      weekDataMap[p.week_number].target += totalTarget;
      weekDataMap[p.week_number].result += totalResult;
    });

    const chartData = Object.values(weekDataMap).sort((a, b) => {
        // Safe parsing for week number "Tuần X"
        const getWeekNum = (str: string) => {
          const match = str.match(/\d+/);
          return match ? parseInt(match[0]) : 0;
        };
        return getWeekNum(a.week) - getWeekNum(b.week);
    }).slice(-8);

    // Product Distribution
    const productData = [
      { name: 'SIM', value: 0 },
      { name: 'VAS', value: 0 },
      { name: 'Fiber', value: 0 },
      { name: 'MyTV', value: 0 },
      { name: 'Mesh/Cam', value: 0 },
      { name: 'CNTT', value: 0 },
    ];

    completedPlans.forEach(p => {
      productData[0].value += p.sim_result || 0;
      productData[1].value += p.vas_result || 0;
      productData[2].value += p.fiber_result || 0;
      productData[3].value += p.mytv_result || 0;
      productData[4].value += p.mesh_camera_result || 0;
      productData[5].value += p.cntt_result || 0;
    });

    // Filter out zero values for cleaner Pie Chart
    const filteredProductData = productData.filter(d => d.value > 0);

    return {
      totalUsers,
      activeUsers,
      weekPlansCount: weekPlans.length,
      approvedWeekPlans: weekPlans.filter(p => p.status === 'approved' || p.status === 'completed').length,
      completedCount: completedPlans.length,
      pendingCount: pendingPlans.length,
      completionRate: plans.length > 0 ? Math.round((completedPlans.length / plans.length) * 100) : 0,
      chartData,
      productData: filteredProductData.length > 0 ? filteredProductData : [{ name: 'Chưa có dữ liệu', value: 1 }]
    };
  }, [users, plans]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'];
  const GRAY_COLOR = '#E5E7EB';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Tổng Quan Hệ Thống</h2>
          <p className="text-gray-600">Chào mừng bạn quay trở lại!</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500 hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Tổng Người Dùng</p>
              <h3 className="text-3xl font-bold text-gray-800">{stats.totalUsers}</h3>
              <p className="text-xs text-gray-500 mt-1">Đang hoạt động: <span className="text-green-600 font-medium">{stats.activeUsers}</span></p>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500 hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Kế Hoạch Tuần</p>
              <h3 className="text-3xl font-bold text-gray-800">{stats.weekPlansCount}</h3>
              <p className="text-xs text-gray-500 mt-1">Đã duyệt: <span className="text-green-600 font-medium">{stats.approvedWeekPlans}</span></p>
            </div>
            <div className="bg-green-100 p-2 rounded-lg">
              <FileText className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500 hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Đã Hoàn Thành</p>
              <h3 className="text-3xl font-bold text-gray-800">{stats.completedCount}</h3>
              <p className="text-xs text-gray-500 mt-1">Tỷ lệ: <span className="text-yellow-600 font-medium">{stats.completionRate}%</span></p>
            </div>
            <div className="bg-yellow-100 p-2 rounded-lg">
              <CheckCircle className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500 hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Chờ Duyệt</p>
              <h3 className="text-3xl font-bold text-gray-800">{stats.pendingCount}</h3>
              <p className="text-xs text-gray-500 mt-1">Cần xử lý ngay</p>
            </div>
            <div className="bg-purple-100 p-2 rounded-lg">
              <Clock className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Hiệu Suất Theo Tuần</h3>
          <div className="h-80 w-full">
            {stats.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="week" stroke="#9CA3AF" tick={{fontSize: 12}} />
                  <YAxis stroke="#9CA3AF" tick={{fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="target" name="Chỉ tiêu" stroke="#EF4444" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                  <Line type="monotone" dataKey="result" name="Thực hiện" stroke="#10B981" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                Chưa có dữ liệu để hiển thị
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Phân Bố Sản Phẩm (Hoàn thành)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.productData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.productData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.name === 'Chưa có dữ liệu' ? GRAY_COLOR : COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {stats.pendingCount > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg flex items-start gap-3">
          <AlertTriangle className="text-yellow-600 flex-shrink-0" size={24} />
          <div>
            <h4 className="font-bold text-yellow-800">Cần chú ý</h4>
            <p className="text-yellow-700 text-sm">Hiện có {stats.pendingCount} kế hoạch đang chờ phê duyệt. Vui lòng kiểm tra tab "Kế Hoạch" hoặc "Phê Duyệt".</p>
          </div>
        </div>
      )}
    </div>
  );
};