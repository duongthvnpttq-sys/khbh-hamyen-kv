
import React, { useMemo } from 'react';
import { User, Plan } from '../types';
import { Users, FileText, CheckCircle, Clock, TrendingUp, TrendingDown, Target, Zap, Search } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, ComposedChart, Line
} from 'recharts';

interface DashboardProps {
  users: User[];
  plans: Plan[];
}

export const Dashboard: React.FC<DashboardProps> = ({ users, plans }) => {
  const stats = useMemo(() => {
    // 1. Weekly Performance Data (Aggregating all services)
    const weekDataMap: Record<string, { week: string, target: number, result: number }> = {};
    plans.forEach(p => {
      if (!weekDataMap[p.week_number]) {
        weekDataMap[p.week_number] = { week: p.week_number, target: 0, result: 0 };
      }
      // Summing all targets including Mesh+Cam
      weekDataMap[p.week_number].target += (p.sim_target || 0) + (p.fiber_target || 0) + (p.mytv_target || 0) + (p.mesh_camera_target || 0) + (p.cntt_target || 0);
      
      if (p.status === 'completed') {
        // Summing all results including Mesh+Cam
        weekDataMap[p.week_number].result += (p.sim_result || 0) + (p.fiber_result || 0) + (p.mytv_result || 0) + (p.mesh_camera_result || 0) + (p.cntt_result || 0);
      }
    });

    const performanceChart = Object.values(weekDataMap).sort((a, b) => {
      const getNum = (s: string) => parseInt(s.match(/\d+/)?.toString() || '0');
      return getNum(a.week) - getNum(b.week);
    }).slice(-6);

    // 2. Status Distribution
    const statusData = [
      { name: 'Đã hoàn thành', value: plans.filter(p => p.status === 'completed').length, color: '#00D1FF' },
      { name: 'Đã duyệt', value: plans.filter(p => p.status === 'approved').length, color: '#8B5CF6' },
      { name: 'Chờ duyệt', value: plans.filter(p => p.status === 'pending').length, color: '#EF4444' },
    ].filter(d => d.value > 0);

    // 3. Mini Sparkline Data for Cards (Including Mesh/Cam)
    const products = [
      { name: 'SIM Mobile', key: 'sim', color: '#3b82f6' },
      { name: 'Fiber Internet', key: 'fiber', color: '#f43f5e' },
      { name: 'Truyền hình MyTV', key: 'mytv', color: '#a855f7' },
      { name: 'Dịch vụ Mesh/Cam', key: 'mesh_camera', color: '#f59e0b' }, // Added Mesh+Cam
      { name: 'Dịch vụ CNTT', key: 'cntt', color: '#10b981' }
    ];

    const productSparklines = products.map(prod => {
      const data = performanceChart.map(w => {
        const weekPlans = plans.filter(p => p.week_number === w.week);
        const target = weekPlans.reduce((sum, p) => sum + ((p as any)[`${prod.key}_target`] || 0), 0);
        const result = weekPlans.filter(p => p.status === 'completed').reduce((sum, p) => sum + ((p as any)[`${prod.key}_result`] || 0), 0);
        return { week: w.week, target, result };
      });
      const totalT = data.reduce((s, d) => s + d.target, 0);
      const totalR = data.reduce((s, d) => s + d.result, 0);
      return { ...prod, data, totalTarget: totalT, totalResult: totalR };
    });

    // 4. Per-Employee Ranking (Best/Worst)
    const employeeStats = users.filter(u => u.role === 'employee').map(u => {
      const userPlans = plans.filter(p => p.employee_id === u.employee_id);
      const target = userPlans.reduce((sum, p) => sum + (p.sim_target + p.fiber_target + p.mytv_target + p.mesh_camera_target + p.cntt_target), 0);
      const result = userPlans.filter(p => p.status === 'completed').reduce((sum, p) => sum + (p.sim_result + p.fiber_result + p.mytv_result + p.mesh_camera_result + p.cntt_result), 0);
      const ratio = target > 0 ? (result / target) * 100 : 0;
      return { 
        name: u.employee_name, 
        avatar: u.avatar, 
        ratio: Math.round(ratio),
        target,
        result
      };
    });

    const topEmployees = [...employeeStats].sort((a, b) => b.ratio - a.ratio).slice(0, 3);
    const bottomEmployees = [...employeeStats].filter(e => e.target > 0).sort((a, b) => a.ratio - b.ratio).slice(0, 3);

    return { performanceChart, statusData, productSparklines, topEmployees, bottomEmployees };
  }, [users, plans]);

  return (
    <div className="min-h-full dashboard-dark text-white p-6 -m-4 md:-m-6 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight uppercase">Thống Kê Tổng Hợp</h2>
            <p className="text-gray-400 text-xs font-medium tracking-widest uppercase mt-1">Hệ thống quản lý hiệu năng VNPT</p>
          </div>
          {/* Ô nhập liệu tìm kiếm tông mầu sáng (White backdrop) */}
          <div className="flex items-center gap-3 bg-white/95 backdrop-blur-xl px-4 py-2.5 rounded-2xl shadow-2xl border border-white/20">
            <Search size={18} className="text-blue-600" />
            <input 
              type="text" 
              placeholder="Tra cứu nhanh..." 
              className="bg-transparent border-none outline-none text-sm w-48 md:w-64 text-slate-800 placeholder-slate-400 font-bold" 
            />
          </div>
        </div>

        {/* Top KPI Cards (Neon Sparklines) - Adjusted to 5 columns on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {stats.productSparklines.map(prod => (
            <div key={prod.key} className="glass-card rounded-2xl p-5 relative overflow-hidden group hover:border-white/20 transition-all">
              <div className="flex justify-between items-start mb-2 relative z-10">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{prod.name}</span>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${prod.totalResult >= prod.totalTarget ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                  {prod.totalTarget > 0 ? Math.round((prod.totalResult / prod.totalTarget) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-2 relative z-10">
                <h3 className="text-2xl font-black tracking-tighter">{prod.totalResult}</h3>
                <span className="text-[10px] text-gray-500 font-bold">/ {prod.totalTarget} KPI</span>
              </div>
              <div className="h-16 w-full -mb-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={prod.data}>
                    <defs>
                      <linearGradient id={`grad-${prod.key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={prod.color} stopOpacity={0.4}/>
                        <stop offset="95%" stopColor={prod.color} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="result" stroke={prod.color} strokeWidth={3} fillOpacity={1} fill={`url(#grad-${prod.key})`} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>

        {/* Middle Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Chart: Target vs Result */}
          <div className="lg:col-span-2 glass-card rounded-3xl p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-black uppercase tracking-tight">Thực Hiện vs Chỉ Tiêu (Tuần)</h3>
              <div className="flex gap-6">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></span><span className="text-[10px] text-gray-400 font-black uppercase">Chỉ tiêu</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span><span className="text-[10px] text-gray-400 font-black uppercase">Kết quả</span></div>
              </div>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={stats.performanceChart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="week" stroke="#4B5563" tick={{fontSize: 10, fontWeight: 700}} axisLine={false} tickLine={false} dy={10} />
                  <YAxis stroke="#4B5563" tick={{fontSize: 10, fontWeight: 700}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1c2438', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 700 }}
                  />
                  <Bar dataKey="target" name="Chỉ tiêu" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={25} opacity={0.4} />
                  <Line type="monotone" dataKey="result" name="Thực hiện" stroke="#3b82f6" strokeWidth={5} shadow="0 0 10px rgba(59,130,246,0.5)" dot={{r: 6, fill: '#3b82f6', strokeWidth: 3, stroke: '#1c2438'}} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="glass-card rounded-3xl p-8">
            <h3 className="text-lg font-black uppercase tracking-tight mb-8">Trạng Thái Kế Hoạch</h3>
            <div className="h-64 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={105}
                    paddingAngle={10}
                    dataKey="value"
                    stroke="none"
                  >
                    {stats.statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: `drop-shadow(0 0 5px ${entry.color}88)` }} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-white">{plans.length}</span>
                <span className="text-[10px] uppercase text-gray-500 font-black tracking-widest mt-1">Báo cáo</span>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {stats.statusData.map((d, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                    <span className="text-gray-400 font-bold uppercase tracking-tighter">{d.name}</span>
                  </div>
                  <span className="font-black text-white">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section: Top/Bottom Performers */}
        <div className="grid grid-cols-1 gap-6">
          <div className="glass-card rounded-3xl p-8">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                <Zap size={24} className="text-yellow-400 fill-yellow-400 animate-pulse" />
                Bảng Xếp Hạng Hiệu Quả
              </h3>
              <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] bg-white/5 px-4 py-2 rounded-full">Dữ liệu thời gian thực</div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              {/* Top Group */}
              <div>
                <div className="flex items-center gap-3 mb-6 text-emerald-400 border-b border-emerald-500/20 pb-4">
                  <TrendingUp size={22} />
                  <span className="text-base font-black uppercase tracking-widest">Nhân viên xuất sắc</span>
                </div>
                <div className="space-y-5">
                  {stats.topEmployees.length > 0 ? stats.topEmployees.map((emp, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/5 p-5 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-emerald-500/30 transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center overflow-hidden border border-emerald-500/30 transform group-hover:scale-110 transition-transform">
                          {emp.avatar ? <img src={emp.avatar} className="w-full h-full object-cover" /> : <span className="font-black text-emerald-400 text-lg">{emp.name[0]}</span>}
                        </div>
                        <div>
                          <p className="font-black text-base text-white">{emp.name}</p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">{emp.result} KPI đạt được</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-emerald-400 tracking-tighter">{emp.ratio}%</p>
                        <div className="w-28 h-2 bg-gray-800 rounded-full mt-2 overflow-hidden border border-white/5">
                          <div className="bg-emerald-500 h-full rounded-full shadow-[0_0_10px_#10b981]" style={{ width: `${emp.ratio}%` }}></div>
                        </div>
                      </div>
                    </div>
                  )) : <p className="text-gray-500 text-sm font-bold uppercase italic">Chưa có dữ liệu xếp hạng</p>}
                </div>
              </div>

              {/* Bottom Group */}
              <div>
                <div className="flex items-center gap-3 mb-6 text-rose-400 border-b border-rose-500/20 pb-4">
                  <TrendingDown size={22} />
                  <span className="text-base font-black uppercase tracking-widest">Cần cải thiện hiệu quả</span>
                </div>
                <div className="space-y-5">
                  {stats.bottomEmployees.length > 0 ? stats.bottomEmployees.map((emp, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/5 p-5 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-rose-500/30 transition-all cursor-pointer opacity-80 hover:opacity-100 group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center overflow-hidden border border-rose-500/30 transform group-hover:scale-110 transition-transform">
                          {emp.avatar ? <img src={emp.avatar} className="w-full h-full object-cover" /> : <span className="font-black text-rose-400 text-lg">{emp.name[0]}</span>}
                        </div>
                        <div>
                          <p className="font-black text-base text-white">{emp.name}</p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Chỉ tiêu: {emp.target} KPI</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-rose-400 tracking-tighter">{emp.ratio}%</p>
                        <div className="w-28 h-2 bg-gray-800 rounded-full mt-2 overflow-hidden border border-white/5">
                          <div className="bg-rose-500 h-full rounded-full shadow-[0_0_10px_#f43f5e]" style={{ width: `${emp.ratio}%` }}></div>
                        </div>
                      </div>
                    </div>
                  )) : <p className="text-gray-500 text-sm font-bold uppercase italic">Chưa có dữ liệu xếp hạng</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
