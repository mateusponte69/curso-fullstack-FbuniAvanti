import React, { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';

/**
 * Componente de tela de login com validação básica
 * @param {Object} props
 * @param {Function} props.onLogin - Callback executado após login bem-sucedido
 */
export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // SIMULAÇÃO DE BACKEND (Delay de 1.5s)
    setTimeout(() => {
      // Regra simples: aceita qualquer email, mas senha tem que ter 3+ digitos
      if (password.length < 3) {
        setError('A senha deve ter no mínimo 3 caracteres.');
        setIsLoading(false);
      } else {
        // Sucesso!
        onLogin({ name: 'Mateus', email: email });
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Bem-vindo ao TaskFlow</h1>
          <p className="text-slate-500 mt-2">Organize sua vida com simplicidade.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} /> Entrando...
              </>
            ) : (
              'Entrar no Sistema'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Dica: Use qualquer senha com mais de 3 dígitos.
        </p>
      </div>
    </div>
  );
}
