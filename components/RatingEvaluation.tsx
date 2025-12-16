import React, { useState } from 'react';
import { User, Plan } from '../types';
import { Star } from 'lucide-react';

interface RatingProps {
  currentUser: User;
  plans: Plan[];
  onUpdatePlan: (plan: Plan) => void;
}

export const RatingEvaluation: React.FC<RatingProps> = ({ currentUser, plans, onUpdatePlan }) => {
  // Only show completed plans that haven't been rated yet (or allow re-rating)
  const completedPlans = plans
    .filter(p => p.status === 'completed')
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
           <h2 className="text-xl font-bold text-gray-800 mb-4">Đánh Giá Nhân Viên</h2>
           <label className="block text-sm font-medium text-gray-700 mb-2">Chọn báo cáo hoàn thành</label>
           <select 
             className="w-full px-4 py-2 border rounded-lg mb-4"
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
             <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-4 rounded-lg border">
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
                    className="w-full p-2 border rounded"
                    rows={3}
                    value={ratingData.manager_comment}
                    onChange={e => setRatingData({...ratingData, manager_comment: e.target.value})}
                    placeholder="Nhập nhận xét..."
                  />
               </div>
               <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition">
                 Lưu Đánh Giá
               </button>
             </form>
           )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 overflow-y-auto max-h-[600px]">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Lịch Sử Đánh Giá Gần Đây</h3>
        <div className="space-y-4">
          {completedPlans.filter(p => p.rating === 'rated').map(p => (
            <div key={p.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
              <div className="flex justify-between items-start">
                 <div>
                   <h4 className="font-bold text-gray-800">{p.employee_name}</h4>
                   <p className="text-xs text-gray-500">{p.date}</p>
                 </div>
                 <div className="flex gap-1">
                   {[1,2,3].map(i => <Star key={i} size={14} className="text-yellow-400 fill-current" />)}
                 </div>
              </div>
              <div className="mt-2 grid grid-cols-3 text-xs text-gray-600 bg-white p-2 rounded border">
                <div className="text-center">TĐ: <span className="font-semibold text-purple-600">{p.attitude_score}</span></div>
                <div className="text-center">KL: <span className="font-semibold text-purple-600">{p.discipline_score}</span></div>
                <div className="text-center">HQ: <span className="font-semibold text-purple-600">{p.effectiveness_score}</span></div>
              </div>
              {p.manager_comment && (
                <p className="mt-2 text-sm text-gray-700 italic">"{p.manager_comment}"</p>
              )}
            </div>
          ))}
          {completedPlans.filter(p => p.rating === 'rated').length === 0 && (
            <p className="text-gray-500 text-center text-sm">Chưa có đánh giá nào.</p>
          )}
        </div>
      </div>
    </div>
  );
};