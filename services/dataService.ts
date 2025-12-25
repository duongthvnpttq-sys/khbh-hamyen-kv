
import { createClient } from '@supabase/supabase-js';
import { User, Plan, SystemData } from '../types';
import bcrypt from 'bcryptjs';

const SUPABASE_URL = 'https://oppgitgwutlpqwmcyfxj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_lzQALnCDYyLrGv__8KMhhQ_MYvRGlI8';

// Khởi tạo client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

export const dataService = {
  // Fetch all data from Supabase
  getData: async (): Promise<{ data: SystemData; error?: string }> => {
    try {
      const [usersResponse, plansResponse] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('plans').select('*')
      ]);

      if (usersResponse.error) throw new Error(`Users Error: ${usersResponse.error.message}`);
      if (plansResponse.error) throw new Error(`Plans Error: ${plansResponse.error.message}`);

      return {
        data: {
          users: usersResponse.data as User[] || [],
          plans: plansResponse.data as Plan[] || []
        }
      };
    } catch (error: any) {
      console.error('Lỗi kết nối Supabase:', error);
      return { 
        data: { users: [], plans: [] },
        error: error.message || 'Không thể kết nối đến máy chủ dữ liệu.'
      };
    }
  },

  // Create a new user with hashed password
  createUser: async (user: Omit<User, 'id' | 'created_at'>): Promise<User | null> => {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = user.password ? await bcrypt.hash(user.password, salt) : '';

    const newUser: User = {
      ...user,
      password: hashedPassword, // Store hash instead of plain text
      id: generateId(),
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from('users').insert([newUser]).select();
    
    if (error) {
      console.error('Error creating user:', error);
      return null;
    }
    return data?.[0] as User;
  },

  // Update an existing user
  updateUser: async (user: User) => {
    // Note: This function assumes password is NOT being updated here. 
    // If password update feature is added, hashing logic is needed here too.
    const { error } = await supabase
      .from('users')
      .update(user)
      .eq('id', user.id);
      
    if (error) console.error('Error updating user:', error);
  },

  // Delete a user and their associated plans
  deleteUser: async (id: string) => {
    // First fetch the user to get employee_id for plan deletion
    const { data: userData } = await supabase.from('users').select('employee_id').eq('id', id).single();
    
    if (userData) {
      // Delete user's plans
      await supabase.from('plans').delete().eq('employee_id', userData.employee_id);
    }
    
    // Delete the user
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) console.error('Error deleting user:', error);
  },

  // Create a new plan
  createPlan: async (plan: Omit<Plan, 'id' | 'created_at'>): Promise<Plan | null> => {
    const newPlan: Plan = {
      ...plan,
      id: generateId(),
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from('plans').insert([newPlan]).select();
    
    if (error) {
      console.error('Error creating plan:', error);
      return null;
    }
    return data?.[0] as Plan;
  },

  // Update an existing plan
  updatePlan: async (plan: Plan) => {
    const { error } = await supabase
      .from('plans')
      .update(plan)
      .eq('id', plan.id);

    if (error) console.error('Error updating plan:', error);
  },

  // Delete a plan
  deletePlan: async (id: string) => {
    const { error } = await supabase.from('plans').delete().eq('id', id);
    if (error) console.error('Error deleting plan:', error);
  }
};
