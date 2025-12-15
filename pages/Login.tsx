import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
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
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-4 shadow-lg p-2">
            <img 
              src="data:image/png;base64,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" 
              alt="Logo" 
              className="w-full h-full object-contain"
            />
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
