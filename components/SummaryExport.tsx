import React, { useState } from 'react';
import { User, Plan } from '../types';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Filter, FileSpreadsheet, FileText, AlertCircle, FileCheck, Calendar } from 'lucide-react';

interface SummaryExportProps {
  users: User[];
  plans: Plan[];
}

export const SummaryExport: React.FC<SummaryExportProps> = ({ users, plans }) => {
  const [filters, setFilters] = useState({
    week: '',
    date: '', // Thêm bộ lọc ngày
    employee_id: '',
    status: ''
  });

  const weeks = Array.from({length: 53}, (_, i) => `Tuần ${i + 1}`);

  const filteredPlans = plans.filter(p => {
    if (filters.week && p.week_number !== filters.week) return false;
    if (filters.date && p.date !== filters.date) return false; // Logic lọc theo ngày
    if (filters.employee_id && p.employee_id !== filters.employee_id) return false;
    if (filters.status && p.status !== filters.status) return false;
    return true;
  });

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'pending': return 'Chờ duyệt';
      case 'rejected': return 'Từ chối';
      case 'approved': return 'Đã duyệt';
      default: return status;
    }
  };

  // Helper để lấy số tuần từ chuỗi "Tuần X"
  const getWeekNumber = (weekStr: string) => {
    const match = weekStr.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  const generateFileName = (prefix: string) => {
    let name = prefix;
    if (filters.date) name += `_${filters.date}`;
    else if (filters.week) name += `_${filters.week.replace(' ', '')}`;
    else name += `_${new Date().toISOString().slice(0,10)}`;
    return name + ".xlsx";
  };

  const exportExcel = () => {
    try {
      // 1. Define Title and Info Rows
      const title = [['BÁO CÁO TỔNG HỢP KẾT QUẢ KINH DOANH VNPT']];
      const filterInfo = [];
      if (filters.week) filterInfo.push(`Tuần: ${filters.week}`);
      if (filters.date) filterInfo.push(`Ngày: ${new Date(filters.date).toLocaleDateString('vi-VN')}`);
      
      const info = [[`Ngày xuất báo cáo: ${new Date().toLocaleDateString('vi-VN')} - Số lượng bản ghi: ${filteredPlans.length} ${filterInfo.length > 0 ? `(${filterInfo.join(' - ')})` : ''}`]];
      const emptyRow = [['']];

      // 2. Define Headers
      const headers = [[
        'STT', 
        'Tuần', 
        'Ngày thực hiện', 
        'Nhân viên', 
        'Chức danh',
        'Địa bàn', 
        'Nội dung công việc', 
        'CT SIM', 'KQ SIM',
        'CT VAS', 'KQ VAS',
        'CT Fiber', 'KQ Fiber',
        'CT MyTV', 'KQ MyTV',
        'CT Cam/Mesh', 'KQ Cam/Mesh',
        'CT CNTT', 'KQ CNTT',
        'KH Tiếp cận', 
        'HĐ Đã ký',
        'Khó khăn/Vướng mắc',
        'Trạng thái',
        'Đánh giá',
        'Nhận xét của QL'
      ]];

      // 3. Map Data Rows
      const data = filteredPlans.map((p, idx) => [
        idx + 1,
        p.week_number,
        p.date,
        p.employee_name,
        p.position,
        p.area,
        p.work_content,
        p.sim_target || 0, p.sim_result || 0,
        p.vas_target || 0, p.vas_result || 0,
        p.fiber_target || 0, p.fiber_result || 0,
        p.mytv_target || 0, p.mytv_result || 0,
        p.mesh_camera_target || 0, p.mesh_camera_result || 0,
        p.cntt_target || 0, p.cntt_result || 0,
        p.customers_contacted || 0,
        p.contracts_signed || 0,
        p.challenges || '',
        getStatusText(p.status),
        p.effectiveness_score || '',
        p.manager_comment || ''
      ]);

      // 4. Create Worksheet with AoA (Array of Arrays)
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([...title, ...info, ...emptyRow, ...headers, ...data]);

      // 5. Optional: Set column widths
      const wscols = [
        { wch: 5 }, { wch: 10 }, { wch: 12 }, { wch: 20 }, { wch: 15 }, 
        { wch: 15 }, { wch: 30 }, 
        { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 },
        { wch: 8 }, { wch: 8 }, { wch: 10 }, { wch: 10 }, { wch: 8 }, { wch: 8 },
        { wch: 12 }, { wch: 10 }, { wch: 20 }, { wch: 12 }, { wch: 10 }, { wch: 20 },
      ];
      ws['!cols'] = wscols;

      XLSX.utils.book_append_sheet(wb, ws, "TongHop");
      XLSX.writeFile(wb, generateFileName("Bao_Cao_Tong_Hop"));
    } catch (error) {
      console.error("Lỗi xuất Excel:", error);
      alert("Có lỗi xảy ra khi xuất file Excel.");
    }
  };

  const exportDetailedSortExcel = () => {
    try {
      // 1. Sắp xếp dữ liệu: Tên NV -> Số Tuần -> Ngày tháng
      const sortedData = [...filteredPlans].sort((a, b) => {
        // Sắp xếp theo tên nhân viên
        const nameCompare = a.employee_name.localeCompare(b.employee_name);
        if (nameCompare !== 0) return nameCompare;
        
        // Sắp xếp theo số tuần
        const weekDiff = getWeekNumber(a.week_number) - getWeekNumber(b.week_number);
        if (weekDiff !== 0) return weekDiff;

        // Sắp xếp theo ngày
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });

      // 2. Chuẩn bị tiêu đề
      const title = [['CHI TIẾT KẾ HOẠCH & KẾT QUẢ THEO NHÂN VIÊN']];
      const filterInfo = [];
      if (filters.week) filterInfo.push(`Tuần: ${filters.week}`);
      if (filters.date) filterInfo.push(`Ngày: ${new Date(filters.date).toLocaleDateString('vi-VN')}`);

      const info = [[`Dữ liệu đã lọc và sắp xếp theo: Nhân viên > Tuần > Ngày ${filterInfo.length > 0 ? `(${filterInfo.join(' - ')})` : ''}`]];
      const emptyRow = [['']];

      const headers = [[
        'Nhân viên', 
        'Tuần', 
        'Ngày', 
        'Địa bàn', 
        'Nội dung công việc', 
        'Chỉ tiêu Tổng', 
        'Kết quả Tổng',
        'Trạng thái',
        'Ghi chú/Khó khăn'
      ]];

      // 3. Map dữ liệu
      const data = sortedData.map(p => {
        const totalTarget = (p.sim_target||0) + (p.vas_target||0) + (p.fiber_target||0) + (p.mytv_target||0) + (p.mesh_camera_target||0) + (p.cntt_target||0);
        const totalResult = (p.sim_result||0) + (p.vas_result||0) + (p.fiber_result||0) + (p.mytv_result||0) + (p.mesh_camera_result||0) + (p.cntt_result||0);
        
        return [
          p.employee_name,
          p.week_number,
          new Date(p.date).toLocaleDateString('vi-VN'),
          p.area,
          p.work_content,
          totalTarget,
          totalResult,
          getStatusText(p.status),
          p.challenges || p.notes || ''
        ];
      });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([...title, ...info, ...emptyRow, ...headers, ...data]);

      // Set column widths
      ws['!cols'] = [
        { wch: 25 }, // Ten NV
        { wch: 10 }, // Tuan
        { wch: 12 }, // Ngay
        { wch: 20 }, // Dia ban
        { wch: 40 }, // Noi dung
        { wch: 12 }, // Chi tieu
        { wch: 12 }, // Ket qua
        { wch: 15 }, // Trang thai
        { wch: 30 }  // Ghi chu
      ];

      XLSX.utils.book_append_sheet(wb, ws, "ChiTiet_NV_Tuan_Ngay");
      XLSX.writeFile(wb, generateFileName("Bao_Cao_Chi_Tiet"));

    } catch (error) {
      console.error("Lỗi xuất Excel chi tiết:", error);
      alert("Có lỗi xảy ra khi xuất file chi tiết.");
    }
  };

  const exportPDF = () => {
    try {
      // Landscape orientation for more columns
      const doc = new jsPDF('l', 'mm', 'a4');
      
      doc.setFontSize(16);
      doc.setTextColor(0, 102, 204); 
      doc.text("BAO CAO TONG HOP KET QUA KINH DOANH VNPT", 14, 15);
      
      doc.setFontSize(10);
      doc.setTextColor(80);
      let subTitle = `Ngay xuat: ${new Date().toLocaleDateString('vi-VN')}`;
      if (filters.date) subTitle += ` - Loc theo ngay: ${new Date(filters.date).toLocaleDateString('vi-VN')}`;
      else if (filters.week) subTitle += ` - Loc theo tuan: ${filters.week}`;
      
      doc.text(subTitle, 14, 22);

      const tableColumn = [
        "NV", "Tuan", "Ngay", "Dia ban", "Noi dung", 
        "SIM(CT/KQ)", "Fiber(CT/KQ)", "MyTV(CT/KQ)", 
        "HD Ky", "Trang thai"
      ];

      const tableRows = filteredPlans.map(p => [
        p.employee_name,
        p.week_number,
        new Date(p.date).toLocaleDateString('vi-VN').slice(0, 5), // Short date
        p.area,
        p.work_content,
        `${p.sim_target}/${p.sim_result || 0}`,
        `${p.fiber_target}/${p.fiber_result || 0}`,
        `${p.mytv_target}/${p.mytv_result || 0}`,
        p.contracts_signed || 0,
        getStatusText(p.status)
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        theme: 'grid',
        headStyles: { 
          fillColor: [0, 102, 204],
          fontSize: 9,
          halign: 'center'
        }, 
        bodyStyles: { 
          fontSize: 9,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 25 }, // NV
          1: { cellWidth: 15 }, // Tuan
          2: { cellWidth: 15 }, // Ngay
          3: { cellWidth: 25 }, // Dia ban
          4: { cellWidth: 'auto' }, // Noi dung (Expand)
          5: { cellWidth: 20, halign: 'center' }, // SIM
          6: { cellWidth: 20, halign: 'center' }, // Fiber
          7: { cellWidth: 20, halign: 'center' }, // MyTV
          8: { cellWidth: 15, halign: 'center' }, // HD
          9: { cellWidth: 25 }  // Trang thai
        },
        didDrawPage: (data) => {
          doc.setFontSize(8);
          doc.text(`Trang ${data.pageNumber}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10);
        }
      });

      doc.save(`Bao_Cao_VNPT_${new Date().toISOString().slice(0,10)}.pdf`);
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày</label>
              <input 
                type="date"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                value={filters.date}
                onChange={e => setFilters({...filters, date: e.target.value})}
              />
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
             <FileSpreadsheet size={20} /> Xuất Excel Tổng Hợp
           </button>
           <button 
             onClick={exportDetailedSortExcel}
             className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm hover:shadow-md"
           >
             <FileCheck size={20} /> Xuất Chi Tiết (Theo NV/Tuần/Ngày)
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
                          {getStatusText(p.status)}
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