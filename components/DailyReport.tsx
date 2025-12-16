import React, { useState } from 'react';
import { User, Plan } from '../types';

interface DailyReportProps {
  currentUser: User;
  plans: Plan[];
  onUpdatePlan: (plan: Plan) => void;
}

export const DailyReport: React.FC<DailyReportProps> = ({ currentUser, plans, onUpdatePlan }) => {
  const approvedPlans = plans.filter(p => 
    p.employee_id === currentUser.employee_id && 
    p.status === 'approved'
  );

  const [selectedPlanId, setSelectedPlanId] = useState('');
  
  const selectedPlan = plans.find(p => p.id === selectedPlanId);
  
  const [reportData, setReportData] = useState({
    sim_result: 0,
    vas_result: 0,
    fiber_result: 0,
    mytv_result: 0,
    mesh_camera_result: 0,
    cntt_result: 0,
    customers_contacted: 0,
    contracts_signed: 0,
    challenges: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    onUpdatePlan({
      ...selectedPlan,
      ...reportData,
      status: 'completed'
    });
    
    alert('Báo cáo đã được gửi!');
    setSelectedPlanId('');
    setReportData({
      sim_result: 0,
      vas_result: 0,
      fiber_result: 0,
      mytv_result: 0,
      mesh_camera_result: 0,
      cntt_result: 0,
      customers_contacted: 0,
      contracts_signed: 0,
      challenges: '',
      notes: ''
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Báo Cáo Kết Quả Ngày</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Chọn Kế Hoạch Cần Báo Cáo</label>
          <select 
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            value={selectedPlanId}
            onChange={e => setSelectedPlanId(e.target.value)}
          >
            <option value="">-- Chọn kế hoạch đã được duyệt --</option>
            {approvedPlans.map(p => (
              <option key={p.id} value={p.id}>{p.week_number} - {p.date} - {p.area}</option>
            ))}
          </select>
        </div>

        {selectedPlan && (
          <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-top-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="font-semibold text-blue-800 mb-2">Nội dung đã đăng ký:</h3>
              <p className="text-sm text-gray-700">{selectedPlan.work_content}</p>
              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                <span>Mục tiêu SIM: {selectedPlan.sim_target}</span>
                <span>Mục tiêu Fiber: {selectedPlan.fiber_target}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 border-b pb-2">Kết Quả Sản Phẩm</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { k: 'sim_result', l: 'SIM' }, { k: 'vas_result', l: 'VAS' },
                    { k: 'fiber_result', l: 'Fiber' }, { k: 'mytv_result', l: 'MyTV' },
                    { k: 'mesh_camera_result', l: 'Mesh/Cam' }, { k: 'cntt_result', l: 'CNTT' }
                  ].map(field => (
                    <div key={field.k}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{field.l}</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full px-3 py-2 border rounded-lg"
                        value={(reportData as any)[field.k]}
                        onChange={e => setReportData({...reportData, [field.k]: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 border-b pb-2">Kết Quả Tiếp Thị</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số KH tiếp cận</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={reportData.customers_contacted}
                    onChange={e => setReportData({...reportData, customers_contacted: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số HĐ đã ký</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={reportData.contracts_signed}
                    onChange={e => setReportData({...reportData, contracts_signed: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Khó khăn / Vướng mắc</label>
                   <textarea
                     className="w-full px-3 py-2 border rounded-lg"
                     rows={3}
                     value={reportData.challenges}
                     onChange={e => setReportData({...reportData, challenges: e.target.value})}
                   />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button type="submit" className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Gửi Báo Cáo
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};