import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { DollarSign, Lock, User, UserPlus } from 'lucide-react';
import { AuthService } from '../services/authService';
import { isSupabaseConfigured } from '../services/supabase';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (username.trim().length < 3) {
      setError('O usuário deve ter pelo menos 3 caracteres.');
      return;
    }

    if (password.length < 4) {
      setError('A senha deve ter pelo menos 4 caracteres.');
      return;
    }

    try {
      await AuthService.register({ username, password });
      setSuccess('Conta criada com sucesso! Redirecionando para login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || 'Erro desconhecido ao criar conta.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-slate-900 p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500 rounded-full mb-4 shadow-lg">
            <UserPlus size={40} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Criar Conta</h1>
          <p className="text-slate-400 mt-2">Junte-se ao TNP FINANCE</p>
        </div>

        <div className="p-8">
          {!isSupabaseConfigured && (
            <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-700 p-4 mb-6 text-sm">
              <p className="font-bold">⚠️ Configuração Necessária</p>
              <p>O site não encontrou as chaves do Supabase.</p>
              <p className="mt-1">Vá no painel da Vercel {'>'} Settings {'>'} Environment Variables e adicione as chaves do arquivo .env.</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg text-sm text-center border border-emerald-100">
                {success}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Usuário</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="Escolha um usuário"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="Escolha uma senha"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="Confirme sua senha"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              Cadastrar
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline">
              Fazer Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
