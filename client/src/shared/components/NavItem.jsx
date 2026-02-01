import React from 'react';

/**
 * Item de navegação para sidebar
 * @param {Object} props
 * @param {React.Element} props.icon - Ícone do item (lucide-react)
 * @param {string} props.label - Texto do item
 * @param {boolean} props.active - Se o item está ativo
 * @param {Function} props.onClick - Handler de clique
 * @param {number} [props.count] - Badge de contagem (opcional)
 */
export default function NavItem({ icon, label, active, onClick, count }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg mb-1 transition-colors ${
        active ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-gray-100'
      }`}
    >
      <div className="flex items-center gap-3">
        {React.cloneElement(icon, {
          size: 20,
          className: active ? 'text-blue-600' : 'text-gray-400',
        })}
        <span className="font-medium text-sm truncate max-w-[120px] text-left">{label}</span>
      </div>
      {count !== undefined && count > 0 && (
        <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full font-bold">
          {count}
        </span>
      )}
    </button>
  );
}
