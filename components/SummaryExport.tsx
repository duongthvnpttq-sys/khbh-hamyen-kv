import React, { useState } from 'react';
import { User, Plan } from '../types';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Filter, FileSpreadsheet, FileText, AlertCircle } from 'lucide-react';

interface SummaryExportProps {
  users: User[];
  plans: Plan[];
}

export const SummaryExport: React.FC<SummaryExportProps> = ({ users, plans }) => {
  const [filters, setFilters] = useState({
    week: '',
    employee_id: '',
    status: ''
  });

  const weeks = Array.from({length: 53}, (_, i) => `Tuần ${i + 1}`);

  const filteredPlans = plans.filter(p => {
    if (filters.week && p.week_number !== filters.week) return false;
    if (filters.employee_id && p.employee_id !== filters.employee_id) return false;
    if (filters.status && p.status !== filters.status) return false;
    return true;
  });

  const exportExcel = () => {
    try {
      const data = filteredPlans.map((p, idx) => ({
        'STT': idx + 1,
        'Nhân viên': p.employee_name,
        'Tuần': p.week_number,
        'Ngày': p.date,
        'Địa bàn': p.area,
        'Nội dung': p.work_content,
        'Trạng thái': p.status === 'completed' ? 'Hoàn thành' : p.status === 'pending' ? 'Chờ duyệt' : p.status === 'rejected' ? 'Từ chối' : 'Đã duyệt',
        'SIM (KQ/CT)': `${p.sim_result}/${p.sim_target}`,
        'Fiber (KQ/CT)': `${p.fiber_result}/${p.fiber_target}`,
        'MyTV (KQ/CT)': `${p.mytv_result}/${p.mytv_target}`,
        'HĐ đã ký': p.contracts_signed,
        'Đánh giá': p.effectiveness_score || ''
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Plans");
      XLSX.writeFile(wb, "Bao_Cao_Ban_Hang_VNPT.xlsx");
    } catch (error) {
      console.error("Lỗi xuất Excel:", error);
      alert("Có lỗi xảy ra khi xuất file Excel.");
    }
  };

  const exportPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add font support for Vietnamese (Basic work-around for standard fonts)
      // Note: Full Vietnamese char support in jsPDF requires adding a custom font file (ttf).
      // Here we assume standard ASCII or remove accents for safety if needed, 
      // but modern browsers often handle it reasonably well or show squares for unknown chars.
      
      doc.setFontSize(16);
      doc.setTextColor(0, 102, 204); // VNPT Blue
      doc.text("BAO CAO KE HOACH BAN HANG VNPT", 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Ngay xuat: ${new Date().toLocaleDateString()}`, 14, 28);
      doc.text(`So luong ban ghi: ${filteredPlans.length}`, 14, 33);

      const tableColumn = ["NV", "Tuan", "Ngay", "Dia ban", "Trang thai", "HD Ky"];
      const tableRows = filteredPlans.map(p => [
        p.employee_name,
        p.week_number,
        p.date,
        p.area,
        p.status,
        p.contracts_signed
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        theme: 'grid',
        headStyles: { fillColor: [0, 102, 204] }, // Blue header
        styles: { fontSize: 9 },
      });

      doc.save("Bao_Cao_Ban_Hang_VNPT.pdf");
    } catch (error) {
      console.error("Lỗi xuất PDF:", error);
      alert("Có lỗi xảy ra khi xuất file PDF. Vui lòng thử lại.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Filter size={24} className="text-blue-600" />
          Bộ Lọc & Xuất Báo Cáo
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tuần</label>
              <select 
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={filters.week}
                onChange={e => setFilters({...filters, week: e.target.value})}
              >
                <option value="">Tất cả</option>
                {weeks.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
           </div>
           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nhân viên</label>
              <select 
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={filters.employee_id}
                onChange={e => setFilters({...filters, employee_id: e.target.value})}
              >
                <option value="">Tất cả</option>
                {users.map(u => <option key={u.id} value={u.employee_id}>{u.employee_name}</option>)}
              </select>
           </div>
           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select 
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={filters.status}
                onChange={e => setFilters({...filters, status: e.target.value})}
              >
                <option value="">Tất cả</option>
                <option value="pending">Chờ duyệt</option>
                <option value="approved">Đã duyệt</option>
                <option value="rejected">Từ chối</option>
                <option value="completed">Hoàn thành</option>
              </select>
           </div>
        </div>

        <div className="flex flex-wrap gap-4">
           <button 
             onClick={exportExcel}
             className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition font-medium shadow-sm hover:shadow-md"
           >
             <FileSpreadsheet size={20} /> Xuất Excel
           </button>
           <button 
             onClick={exportPDF}
             className="flex items-center gap-2 bg-red-600 text-white px-6 py-2.5 rounded-lg hover:bg-red-700 transition font-medium shadow-sm hover:shadow-md"
           >
             <FileText size={20} /> Xuất PDF
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-700">Kết Quả Tìm Kiếm ({filteredPlans.length})</h3>
        </div>
        <div className="overflow-x-auto max-h-[500px]">
           <table className="w-full text-sm text-left">
             <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
               <tr>
                 <th className="px-4 py-3 font-semibold text-gray-600">Tuần</th>
                 <th className="px-4 py-3 font-semibold text-gray-600">Ngày</th>
                 <th className="px-4 py-3 font-semibold text-gray-600">Nhân Viên</th>
                 <th className="px-4 py-3 font-semibold text-gray-600">Địa Bàn</th>
                 <th className="px-4 py-3 font-semibold text-gray-600 text-center">Trạng Thái</th>
                 <th className="px-4 py-3 font-semibold text-gray-600 text-right">HĐ Ký</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-200">
               {filteredPlans.length === 0 ? (
                 <tr>
                   <td colSpan={6} className="px-4 py-12 text-center text-gray-500 flex flex-col items-center justify-center">
                      <AlertCircle size={32} className="mb-2 text-gray-300" />
                      Không tìm thấy dữ liệu phù hợp với bộ lọc.
                   </td>
                 </tr>
               ) : (
                 filteredPlans.map(p => (
                   <tr key={p.id} className="hover:bg-blue-50 transition-colors">
                     <td className="px-4 py-3 font-medium text-gray-800">{p.week_number}</td>
                     <td className="px-4 py-3 text-gray-600">{new Date(p.date).toLocaleDateString('vi-VN')}</td>
                     <td className="px-4 py-3 font-medium text-gray-800">{p.employee_name}</td>
                     <td className="px-4 py-3 truncate max-w-[200px] text-gray-600" title={p.area}>{p.area}</td>
                     <td className="px-4 py-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                          ${p.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                            p.status === 'approved' ? 'bg-green-100 text-green-800' :
                            p.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}
                        `}>
                          {p.status === 'pending' ? 'Chờ duyệt' :
                           p.status === 'approved' ? 'Đã duyệt' :
                           p.status === 'rejected' ? 'Từ chối' : 'Hoàn thành'}
                        </span>
                     </td>
                     <td className="px-4 py-3 text-right font-bold text-gray-800">{p.contracts_signed}</td>
                   </tr>
                 ))
               )}
             </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};