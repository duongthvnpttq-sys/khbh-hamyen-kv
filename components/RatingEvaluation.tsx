import React, { useState } from 'react';
import { User, Plan } from '../types';
import { Star, ShieldAlert, Award } from 'lucide-react';

interface RatingProps {
  currentUser: User;
  plans: Plan[];
  onUpdatePlan: (plan: Plan) => void;
}

export const RatingEvaluation: React.FC<RatingProps> = ({ currentUser, plans, onUpdatePlan }) => {
  const isManager = currentUser.role === 'admin' || currentUser.role === 'manager';

  // Lọc danh sách kế hoạch đã hoàn thành
  // Nếu là Quản lý: Xem được tất cả để đánh giá
  // Nếu là Nhân viên: Chỉ xem được của mình
  const completedPlans = plans
    .filter(p => p.status === 'completed')
    .filter(p => isManager ? true : p.employee_id === currentUser.employee_id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const [selectedPlanId, setSelectedPlanId] = useState('');
  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  const [ratingData, setRatingData] = useState({
    attitude_score: 'Tốt',
    discipline_score: 'Tốt',
    effectiveness_score: 'Tốt',
    manager_comment: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    onUpdatePlan({
      ...selectedPlan,
      ...ratingData,
      rating: 'rated'
    });

    alert('Đã lưu đánh giá!');
    setSelectedPlanId('');
    setRatingData({
      attitude_score: 'Tốt',
      discipline_score: 'Tốt',
      effectiveness_score: 'Tốt',
      manager_comment: ''
    });
  };

  const scoreOptions = ['Xuất sắc', 'Tốt', 'Khá', 'Trung bình', 'Yếu'];

  // Tính thống kê nhanh cho nhân viên
  const myRatedPlans = completedPlans.filter(p => p.rating === 'rated');
  const avgRatingCount = myRatedPlans.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
      {/* CỘT TRÁI: FORM ĐÁNH GIÁ (CHỈ HIỂN THỊ VỚI QUẢN LÝ) HOẶC THÔNG TIN (VỚI NHÂN VIÊN) */}
      <div>
        {isManager ? (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border-l-4 border-purple-600">
             <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
               <Award className="text-purple-600" />
               Đánh Giá Nhân Viên
             </h2>
             <label className="block text-sm font-medium text-gray-700 mb-2">Chọn báo cáo hoàn thành</label>
             <select 
               className="w-full px-4 py-2 border rounded-lg mb-4 focus:ring-2 focus:ring-purple-500 outline-none"
               value={selectedPlanId}
               onChange={e => setSelectedPlanId(e.target.value)}
             >
               <option value="">-- Chọn nhân viên / ngày --</option>
               {completedPlans.map(p => (
                 <option key={p.id} value={p.id}>
                   {p.employee_name} - {p.date} {p.rating === 'rated' ? '(Đã đánh giá)' : ''}
                 </option>
               ))}
             </select>

             {selectedPlan && (
               <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                   <div>
                     <label className="block text-xs font-bold text-gray-700 mb-1">Thái độ</label>
                     <select 
                       className="w-full p-2 border rounded"
                       value={ratingData.attitude_score}
                       onChange={e => setRatingData({...ratingData, attitude_score: e.target.value})}
                     >
                       {scoreOptions.map(o => <option key={o} value={o}>{o}</option>)}
                     </select>
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-gray-700 mb-1">Kỷ luật</label>
                     <select 
                       className="w-full p-2 border rounded"
                       value={ratingData.discipline_score}
                       onChange={e => setRatingData({...ratingData, discipline_score: e.target.value})}
                     >
                       {scoreOptions.map(o => <option key={o} value={o}>{o}</option>)}
                     </select>
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-gray-700 mb-1">Hiệu quả</label>
                     <select 
                       className="w-full p-2 border rounded"
                       value={ratingData.effectiveness_score}
                       onChange={e => setRatingData({...ratingData, effectiveness_score: e.target.value})}
                     >
                       {scoreOptions.map(o => <option key={o} value={o}>{o}</option>)}
                     </select>
                   </div>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Nhận xét chi tiết</label>
                    <textarea 
                      className="w-full p-2 border rounded focus:ring-1 focus:ring-purple-500 outline-none"
                      rows={3}
                      value={ratingData.manager_comment}
                      onChange={e => setRatingData({...ratingData, manager_comment: e.target.value})}
                      placeholder="Nhập nhận xét về kết quả làm việc..."
                    />
                 </div>
                 <button type="submit" className="w-full bg-purple-600 text-white py-2.5 rounded-lg font-bold hover:bg-purple-700 transition shadow-md">
                   Lưu Đánh Giá
                 </button>
               </form>
             )}
             {!selectedPlan && (
               <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed">
                 <p>Vui lòng chọn một nhân viên từ danh sách trên để thực hiện đánh giá.</p>
               </div>
             )}
          </div>
        ) : (
          /* GIAO DIỆN CHO NHÂN VIÊN (KHÔNG CÓ QUYỀN ĐÁNH GIÁ) */
          <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-xl shadow-lg p-8 flex flex-col items-center justify-center text-center h-fit sticky top-6">
             <div className="bg-white/20 p-4 rounded-full mb-4">
                <Award size={48} className="text-white" />
             </div>
             <h2 className="text-2xl font-bold mb-2">Kết Quả Đánh Giá Cá Nhân</h2>
             <p className="text-white/90 mb-6 text-sm">
               Đây là khu vực xem kết quả đánh giá từ quản lý. Bạn không thể tự đánh giá chính mình.
             </p>
             
             <div className="grid grid-cols-2 gap-4 w-full">
               <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                 <span className="block text-2xl font-bold">{avgRatingCount}</span>
                 <span className="text-xs text-white/80">Lượt đánh giá</span>
               </div>
               <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                 <span className="block text-2xl font-bold">{completedPlans.length}</span>
                 <span className="text-xs text-white/80">Đã hoàn thành</span>
               </div>
             </div>
          </div>
        )}
      </div>

      {/* CỘT PHẢI: LỊCH SỬ ĐÁNH GIÁ (HIỂN THỊ CHUNG) */}
      <div className="bg-white rounded-xl shadow-sm p-6 overflow-hidden border border-gray-100 flex flex-col h-[600px]">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex justify-between items-center">
          <span>Lịch Sử Đánh Giá {isManager ? "Gần Đây" : "Của Tôi"}</span>
          <span className="text-xs font-normal bg-gray-100 px-2 py-1 rounded-full text-gray-500">
            {myRatedPlans.length} bản ghi
          </span>
        </h3>
        
        <div className="overflow-y-auto flex-1 pr-2 space-y-4">
          {myRatedPlans.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center justify-center h-full text-gray-400">
              <ShieldAlert size={40} className="mb-3 opacity-50" />
              <p className="text-sm">Chưa có dữ liệu đánh giá nào.</p>
            </div>
          ) : (
            myRatedPlans.map(p => (
              <div key={p.id} className="border border-gray-200 rounded-xl p-4 hover:bg-purple-50/30 transition shadow-sm hover:shadow-md">
                <div className="flex justify-between items-start mb-2">
                   <div>
                     <h4 className="font-bold text-gray-800 text-lg">{p.employee_name}</h4>
                     <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-medium">{p.week_number}</span>
                        <span>•</span>
                        <span>{new Date(p.date).toLocaleDateString('vi-VN')}</span>
                     </div>
                   </div>
                   <div className="flex gap-0.5">
                     {[1,2,3,4,5].map(i => (
                        <Star 
                          key={i} 
                          size={16} 
                          className={`${i <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} 
                        />
                     ))}
                   </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="bg-blue-50 p-2 rounded-lg text-center border border-blue-100">
                    <span className="text-[10px] uppercase text-gray-500 font-bold block mb-0.5">Thái độ</span>
                    <span className="text-sm font-bold text-blue-700">{p.attitude_score}</span>
                  </div>
                  <div className="bg-green-50 p-2 rounded-lg text-center border border-green-100">
                    <span className="text-[10px] uppercase text-gray-500 font-bold block mb-0.5">Kỷ luật</span>
                    <span className="text-sm font-bold text-green-700">{p.discipline_score}</span>
                  </div>
                  <div className="bg-purple-50 p-2 rounded-lg text-center border border-purple-100">
                    <span className="text-[10px] uppercase text-gray-500 font-bold block mb-0.5">Hiệu quả</span>
                    <span className="text-sm font-bold text-purple-700">{p.effectiveness_score}</span>
                  </div>
                </div>
                
                {p.manager_comment && (
                  <div className="mt-3 bg-gray-50 p-3 rounded-lg text-sm text-gray-600 italic border border-gray-100 relative">
                    <span className="absolute -top-2 left-4 bg-white px-1 text-[10px] font-bold text-gray-400 uppercase">Nhận xét của QL</span>
                    "{p.manager_comment}"
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};