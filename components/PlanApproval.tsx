import React from 'react';
import { User, Plan } from '../types';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface PlanApprovalProps {
  currentUser: User;
  plans: Plan[];
  onUpdatePlan: (plan: Plan) => void;
}

export const PlanApproval: React.FC<PlanApprovalProps> = ({ currentUser, plans, onUpdatePlan }) => {
  // Helper to safely parse date for sorting
  const getTimestamp = (dateStr?: string) => {
    if (!dateStr) return 0;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? 0 : date.getTime();
  };

  // Managers can approve plans
  const pendingPlans = plans
    .filter(p => p.status === 'pending')
    .sort((a, b) => getTimestamp(b.submitted_at) - getTimestamp(a.submitted_at));

  const handleApprove = (plan: Plan) => {
    if (window.confirm(`Xác nhận DUYỆT kế hoạch của ${plan.employee_name}?`)) {
      try {
        const updatedPlan: Plan = {
          ...plan,
          status: 'approved',
          approved_by: currentUser.employee_name,
          approved_at: new Date().toISOString()
        };
        onUpdatePlan(updatedPlan);
        // Alert is useful for confirmation in prototype apps
        // In a real app, a toast notification would be better
      } catch (e) {
        console.error("Lỗi khi duyệt:", e);
        alert("Có lỗi xảy ra khi cập nhật kế hoạch. Vui lòng thử lại.");
      }
    }
  };

  const handleReject = (plan: Plan) => {
    const reason = prompt('Nhập lý do từ chối:');
    if (reason !== null) {
      if (!reason.trim()) {
        alert("Vui lòng nhập lý do từ chối!");
        return;
      }
      
      try {
        const updatedPlan: Plan = {
          ...plan,
          status: 'rejected',
          returned_reason: reason.trim(),
          approved_by: currentUser.employee_name,
          approved_at: new Date().toISOString()
        };
        onUpdatePlan(updatedPlan);
      } catch (e) {
        console.error("Lỗi khi từ chối:", e);
        alert("Có lỗi xảy ra khi cập nhật kế hoạch.");
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 mb-6 border-b pb-4">
        <Clock className="text-blue-600" size={28} />
        <div>
           <h2 className="text-xl font-bold text-gray-800">Phê Duyệt Kế Hoạch</h2>
           <p className="text-sm text-gray-500">Danh sách các kế hoạch đang chờ xử lý ({pendingPlans.length})</p>
        </div>
      </div>
      
      {pendingPlans.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-500 shadow-sm border border-dashed border-gray-300">
          <CheckCircle size={48} className="mx-auto text-green-500 mb-4 opacity-50" />
          <p className="text-lg font-medium">Tuyệt vời! Không có kế hoạch nào cần duyệt.</p>
          <p className="text-sm mt-2 text-gray-400">Tất cả yêu cầu đã được xử lý.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pendingPlans.map(plan => (
            <div key={plan.id} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-400 hover:shadow-lg transition-all duration-200 group">
              <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-700 transition-colors">{plan.employee_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded font-medium border border-gray-200">
                      {plan.position || 'Nhân viên'}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">Gửi: {new Date(plan.submitted_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-700 text-lg">{plan.week_number}</p>
                  <p className="text-sm font-medium text-gray-600">{new Date(plan.date).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
              
              <div className="mb-5 space-y-3">
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Địa bàn</span>
                  <p className="text-gray-800 font-medium">{plan.area}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nội dung công việc</span>
                  <div className="mt-1 bg-gray-50 p-3 rounded-lg text-sm text-gray-700 border border-gray-200 leading-relaxed">
                    {plan.work_content}
                  </div>
                </div>
                
                <div className="flex gap-4 text-sm mt-2 bg-blue-50/50 p-2 rounded border border-blue-100/50">
                   <div>
                     <span className="text-xs font-bold text-gray-500 uppercase">Thời gian:</span>
                     <span className="ml-2 text-gray-700 font-medium">{plan.time_schedule || 'N/A'}</span>
                   </div>
                   <div className="pl-4 border-l border-blue-200">
                     <span className="text-xs font-bold text-gray-500 uppercase">Phương thức:</span>
                     <span className="ml-2 text-gray-700 font-medium">{plan.implementation_method}</span>
                   </div>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Chỉ tiêu đăng ký</span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-blue-50 p-2 rounded-lg text-center border border-blue-100">
                    <span className="text-xs text-gray-500 block mb-0.5">SIM</span>
                    <span className="text-lg font-bold text-blue-700">{plan.sim_target}</span>
                  </div>
                  <div className="bg-green-50 p-2 rounded-lg text-center border border-green-100">
                    <span className="text-xs text-gray-500 block mb-0.5">Fiber</span>
                    <span className="text-lg font-bold text-green-700">{plan.fiber_target}</span>
                  </div>
                  <div className="bg-purple-50 p-2 rounded-lg text-center border border-purple-100">
                    <span className="text-xs text-gray-500 block mb-0.5">MyTV</span>
                    <span className="text-lg font-bold text-purple-700">{plan.mytv_target}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleApprove(plan)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition font-semibold shadow-sm hover:shadow"
                >
                  <CheckCircle size={18} /> Duyệt Ngay
                </button>
                <button
                  onClick={() => handleReject(plan)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 active:bg-red-100 transition font-semibold"
                >
                  <XCircle size={18} /> Từ chối
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};