import { User } from '../types';
import { supabase } from './supabase';

export const AuthService = {
  // Get all profiles (users)
  getUsers: async (): Promise<any[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('username');
    
    if (error) throw error;
    return data || [];
  },

  register: async (user: User): Promise<void> => {
    // Sanitize username for email generation (remove spaces, lowercase)
    const cleanUsername = user.username.trim().toLowerCase().replace(/\s+/g, '');
    
    // 1. Sign up with Supabase Auth
    // Using example.com to avoid potential domain validation issues
    const { data, error } = await supabase.auth.signUp({
      email: `${cleanUsername}@example.com`, 
      password: user.password,
      options: {
        data: {
          username: user.username // Keep original username for display
        }
      }
    });

    if (error) throw error;
  },

  login: async (user: User): Promise<boolean> => {
    // MODO TESTE: Bypass para usuário 'teste'
    if (user.username === 'teste' && user.password === '123456') {
      localStorage.setItem('test_session', 'true');
      localStorage.setItem('test_user', JSON.stringify({ username: 'teste', id: 'test-user-id' }));
      return true;
    }

    const cleanUsername = user.username.trim().toLowerCase().replace(/\s+/g, '');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${cleanUsername}@example.com`,
      password: user.password
    });

    if (error || !data.session) return false;
    return true;
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('test_session');
    localStorage.removeItem('test_user');
    await supabase.auth.signOut();
  },

  isAuthenticated: async (): Promise<boolean> => {
    if (localStorage.getItem('test_session') === 'true') return true;
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  },

  getCurrentUser: async (): Promise<string | null> => {
    if (localStorage.getItem('test_session') === 'true') return 'teste';
    const { data } = await supabase.auth.getUser();
    return data.user?.user_metadata?.username || null;
  },
  
  getCurrentUserId: async (): Promise<string | null> => {
    if (localStorage.getItem('test_session') === 'true') return 'test-user-id';
    const { data } = await supabase.auth.getUser();
    return data.user?.id || null;
  }
};
