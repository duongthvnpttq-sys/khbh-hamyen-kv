import { User, Plan, SystemData } from '../types';

const STORAGE_KEY = 'vnpt_system_data';

const SEED_USERS: User[] = [
  {
    id: 'ADMIN_001',
    employee_id: 'ADMIN_001',
    employee_name: 'Administrator',
    position: 'Quản trị viên hệ thống',
    management_area: 'Toàn bộ hệ thống',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'MNG_001',
    employee_id: 'MNG_001',
    employee_name: 'Lê Văn Cường',
    position: 'Tổ trưởng kinh doanh',
    management_area: 'Toàn huyện',
    username: 'levancuong',
    password: 'manager123',
    role: 'manager',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'EMP_001',
    employee_id: 'EMP_001',
    employee_name: 'Nguyễn Văn An',
    position: 'Nhân viên kinh doanh',
    management_area: 'Xã Yên Thuận',
    username: 'nguyenvanan',
    password: '123456',
    role: 'employee',
    is_active: true,
    created_at: new Date().toISOString()
  }
];

// Helper to generate IDs
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

export const dataService = {
  init: (): SystemData => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    const initialData: SystemData = {
      users: SEED_USERS,
      plans: []
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    return initialData;
  },

  getData: (): SystemData => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const data: SystemData = stored ? JSON.parse(stored) : { users: [], plans: [] };
    
    // Safety check: Ensure all plans have an ID. 
    // This fixes issues where legacy or manually added data might cause update failures.
    let hasChanges = false;
    if (data.plans) {
      data.plans = data.plans.map(p => {
        if (!p.id) {
          hasChanges = true;
          return { ...p, id: generateId() };
        }
        return p;
      });
    } else {
      data.plans = [];
    }
    
    if (hasChanges) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
    
    return data;
  },

  saveData: (data: SystemData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  createUser: (user: Omit<User, 'id' | 'created_at'>): User => {
    const data = dataService.getData();
    const newUser: User = {
      ...user,
      id: generateId(),
      created_at: new Date().toISOString()
    };
    data.users.push(newUser);
    dataService.saveData(data);
    return newUser;
  },

  updateUser: (user: User) => {
    const data = dataService.getData();
    const index = data.users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      data.users[index] = user;
      dataService.saveData(data);
    } else {
      console.warn(`User with ID ${user.id} not found for update`);
    }
  },

  deleteUser: (id: string) => {
    const data = dataService.getData();
    const initialLength = data.users.length;
    data.users = data.users.filter(u => u.id !== id);
    if (data.users.length === initialLength) {
       console.warn(`User with ID ${id} not found for deletion`);
    }
    dataService.saveData(data);
  },

  createPlan: (plan: Omit<Plan, 'id' | 'created_at'>): Plan => {
    const data = dataService.getData();
    const newPlan: Plan = {
      ...plan,
      id: generateId(),
      created_at: new Date().toISOString()
    };
    data.plans.push(newPlan);
    dataService.saveData(data);
    return newPlan;
  },

  updatePlan: (plan: Plan) => {
    const data = dataService.getData();
    const index = data.plans.findIndex(p => p.id === plan.id);
    if (index !== -1) {
      data.plans[index] = plan;
      dataService.saveData(data);
    } else {
      console.warn(`Plan with ID ${plan.id} not found for update`);
    }
  },

  deletePlan: (id: string) => {
    const data = dataService.getData();
    data.plans = data.plans.filter(p => p.id !== id);
    dataService.saveData(data);
  }
};