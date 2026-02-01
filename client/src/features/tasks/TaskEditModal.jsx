import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * Modal de edição de tarefa
 * 
 * Componente controlado que permite editar propriedades de uma tarefa existente.
 * Preenchimento automático com valores atuais; validação de campo vazio;
 * feedback visual durante salvamento.
 * 
 * @component
 * @param {Object} task - Tarefa a ser editada (id, text, description, priority, etc)
 * @param {Function} onSave - Callback chamado ao salvar: onSave(updatedData)
 * @param {Function} onCancel - Callback para fechar modal sem salvar
 * @param {boolean} [isLoading=false] - Se está salvando (desabilita botões)
 * 
 * @example
 * <TaskEditModal 
 *   task={task} 
 *   onSave={(data) => updateTask(task.id, data)}
 *   onCancel={() => setEditingTask(null)}
 *   isLoading={false}
 * />
 */
export default function TaskEditModal({ task, onSave, onCancel, isLoading = false }) {
  const [formData, setFormData] = useState({
    text: task?.text || '',
    description: task?.description || '',
    priority: task?.priority || 'padrao',
    dueDate: task?.dueDate || '',
  });

  const [error, setError] = useState('');
  const titleRef = useRef(null);

  // Foco automático no campo de título ao montar
  useEffect(() => {
    setTimeout(() => titleRef.current?.focus(), 100);
  }, []);

  /**
   * Atualiza o estado do formulário
   * @param {string} field - Campo a atualizar (text, description, priority, dueDate)
   * @param {string} value - Novo valor
   */
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  /**
   * Valida e envia os dados atualizados
   * Rejeta se o título estiver vazio
   */
  const handleSave = async () => {
    if (!formData.text.trim()) {
      setError('O título não pode estar vazio');
      titleRef.current?.focus();
      return;
    }

    try {
      await onSave(formData);
    } catch (err) {
      setError(err.message || 'Erro ao salvar tarefa');
    }
  };

  /**
   * Envia formulário ao pressionar Enter no campo title
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSave();
    }
  };

  const priorityOptions = [
    { value: 'padrao', label: 'Padrão', color: 'bg-gray-100' },
    { value: 'trabalho', label: 'Trabalho', color: 'bg-blue-100' },
    { value: 'pessoal', label: 'Pessoal', color: 'bg-purple-100' },
    { value: 'urgente', label: 'Urgente', color: 'bg-red-100' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-slate-800">Editar Tarefa</h2>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            aria-label="Fechar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="space-y-4"
        >
          {/* Título */}
          <div>
            <label htmlFor="task-title" className="block text-sm font-medium text-slate-700 mb-2">
              Título
            </label>
            <input
              ref={titleRef}
              id="task-title"
              type="text"
              value={formData.text}
              onChange={(e) => handleChange('text', e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Ex: Pagar fatura do cartão"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              aria-label="Título da tarefa"
            />
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="task-description" className="block text-sm font-medium text-slate-700 mb-2">
              Descrição (opcional)
            </label>
            <textarea
              id="task-description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              disabled={isLoading}
              placeholder="Adicione detalhes sobre essa tarefa..."
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              aria-label="Descrição da tarefa"
            />
          </div>

          {/* Prioridade */}
          <div>
            <label htmlFor="task-priority" className="block text-sm font-medium text-slate-700 mb-2">
              Prioridade
            </label>
            <select
              id="task-priority"
              value={formData.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              aria-label="Prioridade da tarefa"
            >
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Data de Vencimento */}
          <div>
            <label htmlFor="task-duedate" className="block text-sm font-medium text-slate-700 mb-2">
              Data de Vencimento (opcional)
            </label>
            <input
              id="task-duedate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleChange('dueDate', e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              aria-label="Data de vencimento"
            />
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-2 justify-end mt-6">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
