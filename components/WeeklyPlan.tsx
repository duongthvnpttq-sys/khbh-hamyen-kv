
import React, { useState, useRef } from 'react';
import { User, Plan } from '../types';
import * as XLSX from 'xlsx';
import { PlusCircle, Clock, CheckCircle, XCircle, CalendarOff, AlertCircle, Download, Upload, FileSpreadsheet, Calendar, Users as UsersIcon } from 'lucide-react';

interface WeeklyPlanProps {
  currentUser: User;
  plans: Plan[];
  onAddPlan: (plan: Omit<Plan, 'id' | 'created_at'>) => void;
}

export const WeeklyPlan: React.FC<WeeklyPlanProps> = ({ currentUser, plans, onAddPlan }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    week_number: '',
    date: '',
    area: '',
    work_content: '',
    collaborators: '',
    sim_target: 0,
    vas_target: 0,
    fiber_target: 0,
    mytv_target: 0,
    mesh_camera_target: 0,
    cntt_target: 0,
    revenue_cntt_target: 0,
    other_services_target: 0,
    time_schedule: '8h - 17h',
    implementation_method: 'Cá nhân'
  });

  const myPlans = plans
    .filter(p => p.employee_id === currentUser.employee_id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const existingDates = myPlans.map(p => p.date);

  const handleDownloadTemplate = () => {
    const headers = [['Tuần', 'Ngày (YYYY-MM-DD)', 'Địa bàn', 'Nội dung', 'Người phối hợp', 'SIM', 'VAS', 'Fiber', 'MyTV', 'Mesh/Cam', 'DV CNTT', 'DT CNTT', 'DV Khác', 'Thời gian', 'Phương thức']];
    const sample = [['Tuần 1', new Date().toISOString().split('T')[0], 'Xã Yên Thuận', 'Bán hàng lưu động', '', 5, 2, 1, 1, 0, 0, 0, 0, '8h-17h', 'Cá nhân']];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([...headers, ...sample]);
    XLSX.utils.book_append_sheet(wb, ws, "Mau_Ke_Hoach");
    XLSX.writeFile(wb, "VNPT_Mau_Ke_Hoach_Day_Du.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }).slice(1) as any[];
        
        let added = 0;
        let errors = 0;
        const tempDates = [...existingDates];

        data.forEach(row => {
          const dateStr = row[1]?.toString().trim();
          if (!dateStr || tempDates.includes(dateStr)) {
            errors++;
            return;
          }

          onAddPlan({
            week_number: row[0]?.toString() || 'Tuần 1',
            date: dateStr,
            area: row[2]?.toString() || '',
            work_content: row[3]?.toString() || '',
            collaborators: row[4]?.toString() || '',
            sim_target: parseInt(row[5]) || 0,
            vas_target: parseInt(row[6]) || 0,
            fiber_target: parseInt(row[7]) || 0,
            mytv_target: parseInt(row[8]) || 0,
            mesh_camera_target: parseInt(row[9]) || 0,
            cntt_target: parseInt(row[10]) || 0,
            revenue_cntt_target: parseInt(row[11]) || 0,
            other_services_target: parseInt(row[12]) || 0,
            time_schedule: row[13]?.toString() || '8h-17h',
            implementation_method: row[14]?.toString() || 'Cá nhân',
            employee_id: currentUser.employee_id,
            employee_name: currentUser.employee_name,
            position: currentUser.position,
            management_area: currentUser.management_area,
            sim_result: 0, vas_result: 0, fiber_result: 0, mytv_result: 0, mesh_camera_result: 0, cntt_result: 0, revenue_cntt_result: 0, other_services_result: 0,
            customers_contacted: 0, contracts_signed: 0, challenges: '', notes: '', status: 'pending', submitted_at: new Date().toISOString()
          });
          tempDates.push(dateStr);
          added++;
        });

        alert(`Hoàn tất nhập dữ liệu: Thêm mới ${added}, Bỏ qua ${errors} (Trùng hoặc lỗi).`);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err) {
        alert("Lỗi: Kiểm tra lại định dạng file Excel.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (existingDates.includes(formData.date)) {
      alert("Ngày này đã được lập kế hoạch.");
      return;
    }

    onAddPlan({
      ...formData,
      employee_id: currentUser.employee_id,
      employee_name: currentUser.employee_name,
      position: currentUser.position,
      management_area: currentUser.management_area,
      sim_result: 0, vas_result: 0, fiber_result: 0, mytv_result: 0, mesh_camera_result: 0, cntt_result: 0, revenue_cntt_result: 0, other_services_result: 0,
      customers_contacted: 0, contracts_signed: 0, challenges: '', notes: '', status: 'pending', submitted_at: new Date().toISOString()
    });
    
    setFormData({ 
      ...formData, 
      date: '', 
      work_content: '', 
      area: '', 
      collaborators: '',
      sim_target: 0, 
      fiber_target: 0, 
      mytv_target: 0, 
      mesh_camera_target: 0, 
      cntt_target: 0, 
      revenue_cntt_target: 0,
      other_services_target: 0
    });
    alert("Kế hoạch đã được gửi đi.");
  };

  const statusConfig = {
    pending: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={14} /> },
    approved: { label: 'Đã duyệt', color: 'bg-green-100 text-green-800', icon: <CheckCircle size={14} /> },
    rejected: { label: 'Từ chối', color: 'bg-red-100 text-red-800', icon: <XCircle size={14} /> },
    completed: { label: 'Hoàn thành', color: 'bg-blue-100 text-blue-800', icon: <CheckCircle size={14} /> }
  };

  // Lớp CSS dùng chung cho các ô nhập liệu tông mầu sáng
  const inputLightStyle = "w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 shadow-sm focus:border-blue-400 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all text-slate-800 placeholder-slate-400 font-medium";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 sticky top-6">
          <div className="flex items-center gap-3 mb-6">
            <PlusCircle size={28} className="text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Lập Kế Hoạch Mới</h2>
          </div>

          <div className="flex gap-2 mb-6 p-3 bg-blue-50 rounded-xl border border-blue-100">
             <button onClick={handleDownloadTemplate} className="flex-1 flex items-center justify-center gap-1.5 bg-white text-blue-700 py-2 rounded-lg text-xs font-bold hover:bg-blue-100 transition border border-blue-200 shadow-sm">
               <Download size={14} /> Mẫu Excel
             </button>
             <button onClick={() => fileInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition shadow-md">
               <Upload size={14} /> Tải Excel Lên
             </button>
             <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".xlsx, .xls" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Tuần</label>
                <select required className={inputLightStyle} value={formData.week_number} onChange={e => setFormData({...formData, week_number: e.target.value})}>
                  <option value="">Chọn tuần</option>
                  {Array.from({length: 52}, (_, i) => <option key={i} value={`Tuần ${i+1}`}>Tuần {i+1}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Ngày</label>
                <input required type="date" className={inputLightStyle} value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Địa bàn & Nội dung</label>
              <input required type="text" placeholder="Địa bàn (Xã, Thôn...)" className={`${inputLightStyle} mb-2`} value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} />
              <textarea required rows={3} placeholder="Mô tả công việc dự kiến..." className={`${inputLightStyle} mb-2`} value={formData.work_content} onChange={e => setFormData({...formData, work_content: e.target.value})} />
              <div className="relative">
                <UsersIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Người phối hợp bán hàng..." className={`${inputLightStyle} pl-9 text-sm`} value={formData.collaborators} onChange={e => setFormData({...formData, collaborators: e.target.value})} />
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-inner">
               <h4 className="text-[10px] font-black text-slate-400 uppercase mb-3 text-center tracking-widest">Chỉ tiêu đăng ký</h4>
               <div className="grid grid-cols-2 gap-3 mb-3">
                  <div><label className="text-[10px] font-bold text-gray-500 block">SIM</label><input type="number" className={inputLightStyle} value={formData.sim_target} onChange={e => setFormData({...formData, sim_target: parseInt(e.target.value)||0})} /></div>
                  <div><label className="text-[10px] font-bold text-gray-500 block">FIBER</label><input type="number" className={inputLightStyle} value={formData.fiber_target} onChange={e => setFormData({...formData, fiber_target: parseInt(e.target.value)||0})} /></div>
                  <div><label className="text-[10px] font-bold text-gray-500 block">MYTV</label><input type="number" className={inputLightStyle} value={formData.mytv_target} onChange={e => setFormData({...formData, mytv_target: parseInt(e.target.value)||0})} /></div>
                  <div><label className="text-[10px] font-bold text-gray-500 block">MESH/CAM</label><input type="number" className={inputLightStyle} value={formData.mesh_camera_target} onChange={e => setFormData({...formData, mesh_camera_target: parseInt(e.target.value)||0})} /></div>
               </div>
               <div className="grid grid-cols-2 gap-3 mb-3">
                  <div><label className="text-[10px] font-bold text-gray-500 block">DV CNTT</label><input type="number" className={inputLightStyle} value={formData.cntt_target} onChange={e => setFormData({...formData, cntt_target: parseInt(e.target.value)||0})} /></div>
                  <div><label className="text-[10px] font-bold text-gray-500 block">DT CNTT (VNĐ)</label><input type="number" className={inputLightStyle} value={formData.revenue_cntt_target} onChange={e => setFormData({...formData, revenue_cntt_target: parseInt(e.target.value)||0})} /></div>
               </div>
               <div><label className="text-[10px] font-bold text-gray-500 block">Dịch vụ khác</label><input type="number" className={inputLightStyle} value={formData.other_services_target} onChange={e => setFormData({...formData, other_services_target: parseInt(e.target.value)||0})} /></div>
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition transform active:scale-95">
              Gửi Kế Hoạch
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Lịch Sử Kế Hoạch</h2>
          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full font-bold">Tổng: {myPlans.length}</span>
        </div>

        {myPlans.length === 0 ? (
          <div className="bg-white rounded-2xl p-20 text-center border border-dashed border-gray-300">
            <CalendarOff className="mx-auto text-gray-200 mb-4" size={48} />
            <p className="text-gray-400">Bạn chưa lập kế hoạch nào.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[1000px] overflow-y-auto pr-2 hide-scrollbar">
            {myPlans.map(plan => (
              <div key={plan.id} className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 hover:border-blue-200 transition group relative overflow-hidden">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  plan.status === 'completed' ? 'bg-blue-500' : 
                  plan.status === 'approved' ? 'bg-green-500' :
                  plan.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></div>
                
                <div className="flex justify-between items-start mb-3">
                   <div>
                     <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-800">{plan.week_number}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-500 flex items-center gap-1 text-sm"><Calendar size={14}/> {new Date(plan.date).toLocaleDateString('vi-VN')}</span>
                     </div>
                     <h3 className="text-blue-700 font-bold">{plan.area}</h3>
                   </div>
                   <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-tight ${statusConfig[plan.status].color}`}>
                      {statusConfig[plan.status].icon}
                      {statusConfig[plan.status].label}
                   </div>
                </div>

                <div className="flex flex-col gap-2 mb-4">
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 italic">"{plan.work_content}"</p>
                  {plan.collaborators && (
                    <div className="flex items-center gap-2 text-xs text-blue-600 font-medium">
                      <UsersIcon size={12} /> Phối hợp: {plan.collaborators}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-4 md:grid-cols-6 gap-2 text-center">
                   <div className="bg-blue-50/50 p-2 rounded-lg"><span className="block text-[8px] font-bold text-gray-400">SIM</span><span className="font-bold text-blue-700 text-sm">{plan.sim_target}</span></div>
                   <div className="bg-green-50/50 p-2 rounded-lg"><span className="block text-[8px] font-bold text-gray-400">FIBER</span><span className="font-bold text-green-700 text-sm">{plan.fiber_target}</span></div>
                   <div className="bg-purple-50/50 p-2 rounded-lg"><span className="block text-[8px] font-bold text-gray-400">MYTV</span><span className="font-bold text-purple-700 text-sm">{plan.mytv_target}</span></div>
                   <div className="bg-orange-50/50 p-2 rounded-lg"><span className="block text-[8px] font-bold text-gray-400">M/C</span><span className="font-bold text-orange-700 text-sm">{plan.mesh_camera_target}</span></div>
                   <div className="bg-indigo-50/50 p-2 rounded-lg"><span className="block text-[8px] font-bold text-gray-400">CNTT</span><span className="font-bold text-indigo-700 text-sm">{plan.cntt_target}</span></div>
                   <div className="bg-gray-50/50 p-2 rounded-lg"><span className="block text-[8px] font-bold text-gray-400">KHÁC</span><span className="font-bold text-gray-700 text-sm">{plan.other_services_target || 0}</span></div>
                </div>

                {plan.returned_reason && (
                  <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-100 font-medium">
                    ⚠️ {plan.returned_reason}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
