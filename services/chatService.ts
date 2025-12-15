import { Message } from '../types';
import { supabase } from './supabase';
import { AuthService } from './authService';

export const ChatService = {
  getMessages: async (user1: string, user2: string): Promise<Message[]> => {
    // We need user IDs, but the UI passes usernames. 
    // For now, let's assume we query by username stored in the message table (denormalized)
    // or we fetch IDs first. The SQL setup included sender_username/receiver_username.
    
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_username.eq.${user1},receiver_username.eq.${user2}),and(sender_username.eq.${user2},receiver_username.eq.${user1})`)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map((m: any) => ({
      id: m.id,
      sender: m.sender_username,
      receiver: m.receiver_username,
      content: m.content,
      timestamp: m.created_at,
      read: m.is_read
    }));
  },

  sendMessage: async (sender: string, receiver: string, content: string): Promise<Message> => {
    const senderId = await AuthService.getCurrentUserId();
    if (!senderId) throw new Error('Usuário não autenticado');

    // We need receiver ID. This is tricky with just username.
    // Let's fetch profile by username.
    const { data: receiverProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', receiver)
      .single();

    if (!receiverProfile) throw new Error('Destinatário não encontrado');

    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        receiver_id: receiverProfile.id,
        sender_username: sender,
        receiver_username: receiver,
        content: content
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      sender: data.sender_username,
      receiver: data.receiver_username,
      content: data.content,
      timestamp: data.created_at,
      read: data.is_read
    };
  },

  getUnreadCount: async (currentUser: string, sender: string): Promise<number> => {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_username', currentUser)
      .eq('sender_username', sender)
      .eq('is_read', false);
      
    if (error) return 0;
    return count || 0;
  },

  markAsRead: async (currentUser: string, sender: string): Promise<void> => {
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('receiver_username', currentUser)
      .eq('sender_username', sender)
      .eq('is_read', false);
  },

  // Subscribe to new messages (Realtime)
  subscribeToMessages: (callback: () => void) => {
    return supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, callback)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, callback)
      .subscribe();
  }
};
