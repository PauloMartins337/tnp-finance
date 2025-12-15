import React, { useState, useEffect, useRef } from 'react';
import { AuthService } from '../services/authService';
import { ChatService } from '../services/chatService';
import { User, Message } from '../types';
import { Send, User as UserIcon, MessageSquare } from 'lucide-react';

const Chat: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCounts, setUnreadCounts] = useState<{[key: string]: number}>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize User
  useEffect(() => {
    const initUser = async () => {
      const user = await AuthService.getCurrentUser();
      setCurrentUser(user);
    };
    initUser();
  }, []);

  // Fetch Users
  useEffect(() => {
    if (!currentUser) return;
    const fetchUsers = async () => {
      try {
        const allUsers = await AuthService.getUsers();
        const filtered = allUsers.filter((u: any) => u.username !== currentUser);
        setUsers(filtered);
      } catch (error) {
        console.error("Error fetching users", error);
      }
    };
    fetchUsers();
  }, [currentUser]);

  // Fetch Unread Counts
  useEffect(() => {
    if (!currentUser || users.length === 0) return;
    
    const fetchUnread = async () => {
      const counts: {[key: string]: number} = {};
      for (const user of users) {
        counts[user.username] = await ChatService.getUnreadCount(currentUser, user.username);
      }
      setUnreadCounts(counts);
    };
    
    fetchUnread();
    // Poll unread counts every 10s
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, [currentUser, users]);

  // Fetch Messages & Subscribe
  useEffect(() => {
    if (!currentUser || !selectedUser) return;

    const fetchMessages = async () => {
      try {
        const msgs = await ChatService.getMessages(currentUser, selectedUser);
        setMessages(msgs);
        await ChatService.markAsRead(currentUser, selectedUser);
        // Update local unread count for this user to 0
        setUnreadCounts(prev => ({...prev, [selectedUser]: 0}));
      } catch (error) {
        console.error("Error fetching messages", error);
      }
    };

    fetchMessages();

    // Subscribe to realtime messages
    const subscription = ChatService.subscribeToMessages(() => {
      // When a new message arrives, re-fetch messages if it's the selected user
      // Or update unread counts if it's someone else (handled by polling for now, or we could optimize)
      fetchMessages(); 
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [currentUser, selectedUser]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedUser || !newMessage.trim()) return;

    try {
      await ChatService.sendMessage(currentUser, selectedUser, newMessage);
      setNewMessage('');
      // Optimistic update or wait for subscription? 
      // Let's wait for subscription or just fetch again
      const msgs = await ChatService.getMessages(currentUser, selectedUser);
      setMessages(msgs);
    } catch (error) {
      console.error("Error sending message", error);
    }
  };

  if (!currentUser) return <div className="p-8 text-center">Carregando...</div>;

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Sidebar - Users List */}
      <div className="w-1/3 border-r border-gray-100 bg-gray-50 flex flex-col">
        <div className="p-4 border-b border-gray-100 bg-white">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <MessageSquare size={20} className="text-emerald-500" />
            Conversas
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {users.map(user => {
            const count = unreadCounts[user.username] || 0;
            return (
              <button
                key={user.username}
                onClick={() => setSelectedUser(user.username)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-white transition-colors border-b border-gray-100 text-left ${
                  selectedUser === user.username ? 'bg-white border-l-4 border-l-emerald-500' : ''
                }`}
              >
                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
                  <UserIcon size={20} />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{user.username}</div>
                  <div className="text-xs text-gray-500">Clique para conversar</div>
                </div>
                {count > 0 && (
                  <div className="bg-emerald-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {count}
                  </div>
                )}
              </button>
            );
          })}
          {users.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-sm">
              Nenhum outro usuário encontrado.
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-white shadow-sm z-10">
              <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <UserIcon size={16} />
              </div>
              <span className="font-bold text-gray-800">{selectedUser}</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map(msg => {
                const isMe = msg.sender === currentUser;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                    {!isMe && (
                      <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 flex-shrink-0 mb-1">
                        <UserIcon size={12} />
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] p-3 rounded-2xl shadow-sm ${
                        isMe
                          ? 'bg-emerald-500 text-white rounded-tr-none'
                          : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                      }`}
                    >
                      {!isMe && (
                        <p className="text-xs font-bold text-emerald-600 mb-1">{msg.sender}</p>
                      )}
                      <p className="text-sm">{msg.content}</p>
                      <span className={`text-[10px] block mt-1 ${isMe ? 'text-emerald-100' : 'text-gray-400'} text-right`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-slate-50">
            <MessageSquare size={48} className="mb-4 opacity-20" />
            <p>Selecione um usuário para iniciar uma conversa</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
