import React from 'react'

export default function Badge({ type }) {
  const styles = {
    urgente: 'bg-red-100 text-red-700 border-red-200',
    trabalho: 'bg-orange-100 text-orange-700 border-orange-200',
    pessoal: 'bg-purple-100 text-purple-700 border-purple-200',
    padrao: 'bg-gray-100 text-gray-600 border-gray-200',
  };
  const styleClass = styles[type] || 'bg-blue-100 text-blue-700 border-blue-200';
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${styleClass}`}>
      {String(type || 'padrão').charAt(0).toUpperCase() + String(type || 'padrão').slice(1)}
    </span>
  );
}
