import React, { useState, useEffect } from 'react'
import TaskItem from './TaskItem'
import TaskFormModal from './TaskFormModal'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Componente principal da lista de tarefas
 * 
 * Renderiza:
 * - Header com saudação
 * - Lista de tarefas filtradas
 * - Botão de adição (FAB)
 * - Modal para criar nova tarefa
 * - Modal para editar tarefa existente
 * 
 * @component
 * @param {Object} user - Usuário autenticado (name)
 * @param {Array} filteredTasks - Tarefas filtradas
 * @param {number} filteredCount - Contagem de tarefas pendentes
 * @param {Array} projects - Lista de projetos
 * @param {string} filter - Filtro ativo (hoje | id do projeto)
 * @param {boolean} isModalOpen - Se modal de criação está aberto
 * @param {Function} setIsModalOpen - Toggle modal de criação
 * @param {Function} addTask - Handler para criar tarefa
 * @param {Function} toggleTask - Marca/desmarca tarefa
 * @param {Function} deleteTask - Deleta tarefa
 * @param {Function} updateTask - Atualiza tarefa
 * @param {Function} addNewProject - Handler para criar novo projeto
 */
export default function TaskList({
  user,
  filteredTasks,
  filteredCount,
  projects,
  filter,
  isModalOpen,
  setIsModalOpen,
  isLoadingTasks,
  addTask,
  toggleTask,
  deleteTask,
  updateTask,
  addNewProject,
}) {
  const [editingTask, setEditingTask] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [pageSize, setPageSize] = useState(() => {
    const saved = localStorage.getItem('taskflow_pageSize');
    return saved ? parseInt(saved, 10) : 10;
  });
  const [currentPage, setCurrentPage] = useState(() => {
    const saved = localStorage.getItem('taskflow_currentPage');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Persistir pageSize no localStorage
  useEffect(() => {
    localStorage.setItem('taskflow_pageSize', String(pageSize));
    // Reset page to 0 quando mudar pageSize
    setCurrentPage(0);
  }, [pageSize]);

  // Persistir currentPage no localStorage
  useEffect(() => {
    localStorage.setItem('taskflow_currentPage', String(currentPage));
  }, [currentPage]);

  /**
   * Handler para iniciar edição de tarefa
   * @param {Object} task - Tarefa a editar
   */
  const handleEditTask = (task) => {
    setEditingTask(task);
  };

  /**
   * Handler para salvar tarefa editada
   * Chama updateTask via prop e fecha modal
   * @param {Object} updatedData - Dados atualizados
   */
  const handleSaveTask = async (updatedData) => {
    setIsUpdating(true);
    try {
      await updateTask(editingTask.id, updatedData);
      setEditingTask(null);
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Handler para cancelar edição
   */
  const handleCancelEdit = () => {
    setEditingTask(null);
  };

  /**
   * Calcula índices de paginação
   * @returns {Object} { startIdx, endIdx, totalPages }
   */
  const calculatePagination = () => {
    const totalPages = Math.ceil(filteredTasks.length / pageSize);
    const startIdx = currentPage * pageSize;
    const endIdx = Math.min(startIdx + pageSize, filteredTasks.length);
    return { startIdx, endIdx, totalPages };
  };

  const { startIdx, endIdx, totalPages } = calculatePagination();
  const displayedTasks = filteredTasks.slice(startIdx, endIdx);
  const canGoNext = currentPage < totalPages - 1;
  const canGoPrev = currentPage > 0;

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 md:p-10 max-w-3xl mx-auto w-full">
        <header className="mb-8 hidden md:block">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Olá, {user?.name || 'usuário'} 👋</h1>
          <p className="text-slate-500">
            Você tem {filteredCount} tarefas pendentes em <span className="font-semibold text-blue-600">{filter === 'hoje' ? 'Hoje' : projects.find(p => p.id === filter)?.name}</span>.
          </p>
        </header>

        {/* Seletor de Visualização */}
        <div className="mb-6 flex items-center gap-3">
          <label htmlFor="page-size-select" className="text-sm font-medium text-slate-700">
            Mostrar por página:
          </label>
          <select
            id="page-size-select"
            value={pageSize}
            onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Selecionar quantidade de tarefas por página"
          >
            <option value={10}>10 tarefas</option>
            <option value={20}>20 tarefas</option>
            <option value={50}>50 tarefas</option>
          </select>
        </div>

        <div className="space-y-3">
          {isLoadingTasks ? (
            [1, 2, 3, 4, 5].map((_, i) => (

              /* "Podia ter feito Array.from({length: 5}), mas ainda não tô acostumado com ele.
              E fazer cada item na raça da preguiça."- Paulo Gabriel */

              <div key={i} className="animate-pulse flex items-center gap-4 p-4 bg-white rounded-md shadow-sm">
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))
          ) : (
            <>
              {displayedTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  toggleTask={toggleTask}
                  deleteTask={deleteTask}
                  onEdit={handleEditTask}
                />
              ))}

              {/* Se não tem tarefas, ele avisa */}

              {filteredTasks.length === 0 && (
                <p className="text-center text-gray-400 py-8">Nenhuma tarefa encontrada</p>
              )}
            </>
          )}
        </div>

        {/* Controles de Paginação */}
        {filteredTasks.length > 0 && !isLoadingTasks && (
          <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
            <button
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={!canGoPrev} // Esse deu um trabalhinho pra entender o macete por pura lerdeza
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Página anterior"
            >
              <ChevronLeft size={18} />
              Anterior
            </button>

            <span className="text-sm text-gray-600 font-medium">
              Página {currentPage + 1} de {totalPages} ({filteredTasks.length} total)
            </span>

            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={!canGoNext}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Próxima página"
            >
              Próxima
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        <div className="h-24"></div>
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        disabled={isLoadingTasks}
        className={"absolute bottom-6 right-6 md:bottom-10 md:right-10 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-30 " + (isLoadingTasks ? 'opacity-60 pointer-events-none' : '')}
        aria-label="Adicionar nova tarefa"
      >
        <Plus size={28} />
      </button>

      {/* Modal de Nova Tarefa */}
      {isModalOpen && (
        <TaskFormModal
          mode="create"
          projects={projects}
          defaultCategory={filter === 'hoje' ? 'pessoal' : filter}
          onSave={addTask}
          onCancel={() => setIsModalOpen(false)}
          onCreateProject={addNewProject}
          isLoading={false}
        />
      )}

      {/* Modal de Edição de Tarefa */}
      {editingTask && (
        <TaskFormModal
          mode="edit"
          task={editingTask}
          projects={projects}
          onSave={handleSaveTask}
          onCancel={handleCancelEdit}
          onCreateProject={addNewProject}
          isLoading={isUpdating}
        />
      )}
    </>
  )
}
