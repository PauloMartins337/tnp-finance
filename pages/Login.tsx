import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { DollarSign, Lock, User } from 'lucide-react';
import { AuthService } from '../services/authService';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const success = await AuthService.login({ username, password });
      if (success) {
        navigate('/', { replace: true });
      } else {
        setError('Usuário ou senha incorretos.');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-slate-900 p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500 rounded-full mb-4 shadow-lg">
            <DollarSign size={48} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">TNP <span className="text-emerald-400">CONTROL</span></h1>
          <p className="text-slate-400 mt-2">Controle Financeiro</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100">
                {error}
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
                  placeholder="Digite seu usuário"
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
                  placeholder="Digite sua senha"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              Entrar
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            Não tem uma conta?{' '}
            <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline">
              Criar conta
            </Link>
          </div>

          <div className="mt-6 text-center text-xs text-gray-400">
            <p>&copy; 2025 TNP CONTROL. Todos os direitos reservados.</p>
            <p className="mt-1 font-medium">Criado por Paulo Martins</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
