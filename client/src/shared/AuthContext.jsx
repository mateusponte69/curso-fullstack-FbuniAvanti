import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * Contexto de autenticação da aplicação.
 * Fornece o usuário atual e os métodos `login`/`logout`.
 * A persistência é feita em `localStorage` sob a chave `taskflow_user`.
 *
 * @module AuthContext
 */

const AuthContext = createContext(null);

/**
 * Provider para o contexto de autenticação.
 * Restaura o usuário salvo em `localStorage` ao montar e disponibiliza
 * funções para logar e deslogar.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Elementos filhos que terão acesso ao contexto
 * @returns {JSX.Element}
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Restaura usuário persistido no localStorage ao montar a aplicação
  useEffect(() => {
    try {
      const raw = localStorage.getItem('taskflow_user');
      if (raw) setUser(JSON.parse(raw));
    } catch (err) {
      console.error('Falha ao restaurar usuário do localStorage', err);
    }
  }, []);

  /**
   * Realiza login definindo o `user` no state e persistindo em localStorage.
   * @param {Object} userData - Objeto com dados do usuário (ex: { name, email })
   * @returns {void}
   */
  const login = (userData) => {
    setUser(userData);
    try {
      localStorage.setItem('taskflow_user', JSON.stringify(userData));
    } catch (err) {
      console.error('Falha ao salvar usuário no localStorage', err);
    }
  };

  /**
   * Realiza logout removendo a persistência e limpando o state do usuário.
   * @returns {void}
   */
  const logout = () => {
    try {
      localStorage.removeItem('taskflow_user');
    } catch (err) {}
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para consumir o contexto de autenticação.
 * Lance um erro claro se usado fora do provider.
 *
 * @returns {{user: Object|null, login: function, logout: function}}
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
