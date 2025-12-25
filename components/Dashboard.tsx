
import React, { useMemo, useState } from 'react';
import { User, Plan } from '../types';
import { 
  TrendingUp, ArrowUpRight, ArrowDownRight, 
  ChevronDown, RefreshCw, MoreHorizontal, HelpCircle, Bell, Plus
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  LineChart, Line, AreaChart, Area
} from 'recharts';

interface DashboardProps {
  users: User[];
  plans: Plan[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-lg">
        <p className="text-[10px] font-black text-slate-400 uppercase mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
            <p className="text-xs font-bold text-slate-700">
              {entry.name}: <span className="text-slate-900">{entry.value.toLocaleString()}</span>
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const KPISparklineCard = ({ title, value, growth, color, data }: { title: string; value: string; growth: string; color: string; data: any[] }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden h-full">
    <div className="flex justify-between items-start mb-2">
      <h3 className="text-sm font-medium text-slate-500">{title}</h3>
      <div className="flex items-center gap-2">
        <button className="text-slate-300 hover:text-slate-500"><RefreshCw size={14} /></button>
      </div>
    </div>
    <div className="flex items-baseline gap-2 mb-4">
      <span className="text-2xl font-black text-slate-900 tracking-tighter">{value}</span>
      <span className={`text-xs font-bold flex items-center ${parseFloat(growth) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
        {parseFloat(growth) >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {growth}%
      </span>
    </div>
    <div className="h-12 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <Area type="monotone" dataKey="val" stroke={color} fill={color} fillOpacity={0.1} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ users, plans }) => {
  const [officeFilter, setOfficeFilter] = useState('Hàm Yên');
  const [unitFilter, setUnitFilter] = useState('Triệu đồng');

  // Dữ liệu giả lập xu hướng mini cho sparklines
  const sparklineData = [
    { val: 10 }, { val: 25 }, { val: 15 }, { val: 30 }, { val: 20 }, { val: 45 }, { val: 35 }
  ];

  // Tính toán dữ liệu thực tế
  const metrics = useMemo(() => {
    const totalSim = plans.reduce((acc, p) => acc + p.sim_result, 0);
    const totalFiber = plans.reduce((acc, p) => acc + p.fiber_result, 0);
    const totalRevenue = plans.reduce((acc, p) => acc + p.revenue_cntt_result, 0);
    const targetRevenue = plans.reduce((acc, p) => acc + p.revenue_cntt_target, 0) || 550000000;

    const revenuePercent = Math.min(100, (totalRevenue / targetRevenue) * 100);

    const timeTrend = Array.from({ length: 12 }, (_, i) => ({
      name: (i + 1).toString(),
      Mục_tiêu: Math.floor(Math.random() * 30) + 30,
      Thực_hiện: Math.floor(Math.random() * 40) + 20
    }));

    // Thống kê theo từng nhân viên
    const empMap: Record<string, { name: string, Mục_tiêu: number, Thực_hiện: number }> = {};
    plans.forEach(p => {
      if (!empMap[p.employee_name]) {
        empMap[p.employee_name] = { name: p.employee_name, Mục_tiêu: 0, Thực_hiện: 0 };
      }
      empMap[p.employee_name].Mục_tiêu += p.revenue_cntt_target || 0;
      empMap[p.employee_name].Thực_hiện += p.revenue_cntt_result || 0;
    });

    // Chuyển sang mảng, sắp xếp theo thực hiện giảm dần và lấy top 6
    const employeePerformance = Object.values(empMap)
      .sort((a, b) => b.Thực_hiện - a.Thực_hiện)
      .slice(0, 6);

    const serviceRatio = [
      { name: 'SIM', value: totalSim, color: '#3b82f6' },
      { name: 'Fiber', value: totalFiber, color: '#10b981' },
      { name: 'CNTT', value: plans.reduce((acc, p) => acc + p.cntt_result, 0), color: '#8b5cf6' },
      { name: 'Mạng xã hội', value: 35, color: '#6366f1' },
      { name: 'Khác', value: 15, color: '#94a3b8' },
    ];

    return { totalSim, totalFiber, totalRevenue, targetRevenue, revenuePercent, timeTrend, employeePerformance, serviceRatio };
  }, [plans]);

  // Gauge data (Semi-pie)
  const gaugeData = [
    { value: metrics.revenuePercent },
    { value: 100 - metrics.revenuePercent }
  ];

  return (
    <div className="bg-[#F4F7FA] min-h-screen -m-4 md:-m-6 p-4 md:p-6 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* HEADER FILTERS (AMIS STYLE) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/50 p-2 rounded-xl border border-white/80">
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg overflow-hidden border border-slate-200 shadow-sm">
              <button className="px-6 py-1.5 bg-white text-blue-600 font-bold text-sm">Bán hàng</button>
              <button className="px-6 py-1.5 bg-slate-50 text-slate-500 font-medium text-sm hover:bg-white">Cơ hội</button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600">
              <span className="text-slate-400">Văn phòng</span> {officeFilter} <ChevronDown size={14} />
            </div>
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600">
              {unitFilter} <ChevronDown size={14} />
            </div>
          </div>
        </div>

        {/* TOP ROW: KPI CARDS WITH SPARKLINE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KPISparklineCard 
            title="Khách hàng mua" 
            value={(plans.reduce((acc, p) => acc + p.customers_contacted, 0)).toLocaleString()} 
            growth="15" 
            color="#f59e0b" 
            data={sparklineData} 
          />
          <KPISparklineCard 
            title="Số lượng đơn hàng" 
            value={(plans.reduce((acc, p) => acc + p.contracts_signed, 0)).toLocaleString()} 
            growth="15" 
            color="#3b82f6" 
            data={sparklineData} 
          />
          <KPISparklineCard 
            title="Giá trị doanh thu (đ)" 
            value={metrics.totalRevenue.toLocaleString()} 
            growth="15" 
            color="#10b981" 
            data={sparklineData} 
          />
        </div>

        {/* MIDDLE ROW: GAUGE & TRENDS & EMPLOYEE BARS */}
        <div className="grid grid-cols-12 gap-6">
          
          {/* Thực hiện doanh số (Gauge) */}
          <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Thực hiện doanh số</h3>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">Tháng này <ChevronDown size={12}/></div>
            </div>
            
            <div className="relative w-full h-[220px] mt-4 flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gaugeData}
                    cx="50%"
                    cy="80%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill="#f59e0b" />
                    <Cell fill="#f1f5f9" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-[60%] flex flex-col items-center text-center">
                 <span className="text-3xl font-black text-slate-900 leading-none">{(metrics.totalRevenue / 1000000000).toFixed(1)} tỷ</span>
                 <span className="text-sm font-bold text-slate-400 mt-2">{metrics.revenuePercent.toFixed(2)}% mục tiêu</span>
              </div>
              <div className="absolute bottom-4 left-4 text-[10px] font-black text-slate-300 uppercase">Khởi đầu</div>
              <div className="absolute bottom-4 right-4 text-[10px] font-black text-slate-300 uppercase">Mục tiêu: { (metrics.targetRevenue / 1000000000).toFixed(1) } tỷ</div>
            </div>
          </div>

          {/* Doanh số theo thời gian (Area Chart) */}
          <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <div className="w-full flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Doanh số theo thời gian</h3>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">Năm nay <ChevronDown size={12}/></div>
            </div>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.timeTrend}>
                  <defs>
                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" name="Mục tiêu" dataKey="Mục_tiêu" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorTrend)" strokeWidth={2} />
                  <Area type="monotone" name="Thực hiện" dataKey="Thực_hiện" stroke="#10b981" fillOpacity={0} strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Hiệu quả theo nhân viên (Bar Chart) - Đã sửa theo yêu cầu */}
          <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <div className="w-full flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Hiệu quả theo nhân viên</h3>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">Top 6 nhân sự <ChevronDown size={12}/></div>
            </div>
            <div className="h-[220px]">
              {metrics.employeePerformance.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-300 text-xs italic">Chưa có dữ liệu nhân viên</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.employeePerformance}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 8, fill: '#94a3b8', fontWeight: 700}} 
                      interval={0}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar name="Mục tiêu" dataKey="Mục_tiêu" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={12} />
                    <Bar name="Thực hiện" dataKey="Thực_hiện" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

        </div>

        {/* BOTTOM ROW: DONUTS & HORIZONTAL BARS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Doanh số theo nguồn gốc (Donut) */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-[380px] flex flex-col">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight mb-6">Doanh số theo dịch vụ</h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.serviceRatio}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {metrics.serviceRatio.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {metrics.serviceRatio.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{backgroundColor: s.color}}></div>
                  <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">{s.name} ({Math.round(s.value)}%)</span>
                </div>
              ))}
            </div>
          </div>

          {/* Doanh số loại khách hàng (Horizontal Bars) */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-[380px] flex flex-col">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight mb-6">Loại khách hàng chính</h3>
            <div className="flex-1 space-y-5">
              {[
                { label: 'KH doanh nghiệp', val: 90, color: '#3b82f6' },
                { label: 'KH cá nhân', val: 80, color: '#10b981' },
                { label: 'KH đại lý', val: 60, color: '#f59e0b' },
                { label: 'KH trung thành', val: 50, color: '#8b5cf6' },
                { label: 'KH chiến lược', val: 40, color: '#ef4444' },
              ].map((item, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold text-slate-600">
                    <span>{item.label}</span>
                    <span>{item.val}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full transition-all duration-1000" style={{ width: `${item.val}%`, backgroundColor: item.color }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Doanh số theo hàng hóa (Donut 2) */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-[380px] flex flex-col">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight mb-6">Cơ cấu hàng hóa</h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.serviceRatio}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {metrics.serviceRatio.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
             <div className="grid grid-cols-2 gap-2 mt-4">
              {metrics.serviceRatio.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{backgroundColor: s.color}}></div>
                  <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">{s.name} ({Math.round(s.value)}%)</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
