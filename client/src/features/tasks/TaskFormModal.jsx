import React, { useState, useEffect, useRef } from 'react';
import { X, Plus } from 'lucide-react';

/**
 * Modal de formulário de tarefa (criar ou editar)
 * 
 * Componente reutilizável para criar ou editar tarefas.
 * Campos: título, descrição, projeto, data de vencimento.
 * Permite criar novo projeto inline via botão ao lado do select.
 * 
 * @component
 * @param {Object} [task] - Tarefa existente (para edição); undefined quando cria
 * @param {Array} projects - Lista de projetos disponíveis
 * @param {string} [defaultCategory] - Categoria padrão para nova tarefa
 * @param {Function} onSave - Callback ao salvar: onSave(formData) ou onSave(event) para criação
 * @param {Function} onCancel - Callback para fechar modal
 * @param {Function} onCreateProject - Callback para criar novo projeto
 * @param {boolean} [isLoading=false] - Se está salvando (desabilita botões)
 * @param {string} [mode='edit'] - 'edit' ou 'create'
 */
export default function TaskFormModal({ 
  task, 
  projects = [], 
  defaultCategory = 'pessoal',
  onSave, 
  onCancel, 
  onCreateProject,
  isLoading = false,
  mode = 'edit'
}) {
  const [formData, setFormData] = useState({
    text: task?.text || '',
    description: task?.description || '',
    category: task?.category || defaultCategory,
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
   * @param {string} field - Campo a atualizar
   * @param {string} value - Novo valor
   */
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  /**
   * Valida e envia os dados
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.text.trim()) {
      setError('O título não pode estar vazio');
      titleRef.current?.focus();
      return;
    }

    try {
      if (mode === 'create') {
        onSave(e, formData);
      } else {
        await onSave(formData);
      }
    } catch (err) {
      setError(err.message || 'Erro ao salvar tarefa');
    }
  };

  /**
   * Handler para criar novo projeto inline
   */
  const handleCreateProject = () => {
    onCreateProject();
  };

  const isEditMode = mode === 'edit';
  const title = isEditMode ? 'Editar Tarefa' : 'Nova Tarefa';
  const submitLabel = isEditMode ? 'Salvar' : 'Criar';

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel}></div>
      <div className="bg-white w-full md:w-[500px] md:rounded-2xl rounded-t-2xl p-6 shadow-2xl relative z-10 animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
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
        <form onSubmit={handleSubmit} className="space-y-4">
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

          {/* Projeto */}
          <div>
            <label htmlFor="task-project" className="block text-sm font-medium text-slate-700 mb-2">
              Projeto
            </label>
            <div className="flex gap-2">
              <select
                id="task-project"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                disabled={isLoading}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                aria-label="Projeto da tarefa"
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleCreateProject}
                disabled={isLoading}
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Criar novo projeto"
                title="Criar novo projeto"
              >
                <Plus size={18} className="text-gray-600" />
              </button>
            </div>
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
              disabled={isLoading || !formData.text.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Salvando...
                </>
              ) : (
                submitLabel
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
