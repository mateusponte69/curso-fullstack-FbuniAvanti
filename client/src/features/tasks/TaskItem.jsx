import React from 'react'
import { CheckCircle2, Circle, Trash2, Pencil } from 'lucide-react'
import Badge from '../../shared/Badge'

/**
 * Componente de um item de tarefa individual
 * 
 * Renderiza uma tarefa com checkbox para toggle, badge de categoria,
 * e botões de edição/deleção
 * 
 * @component
 * @param {Object} task - Tarefa a renderizar (id, text, category, completed, etc)
 * @param {Function} toggleTask - Handler para marcar/desmarcar como completa
 * @param {Function} deleteTask - Handler para deletar tarefa
 * @param {Function} onEdit - Handler para editar tarefa
 * 
 * @example
 * <TaskItem 
 *   task={task} 
 *   toggleTask={toggleTask}
 *   deleteTask={deleteTask}
 *   onEdit={onEdit}
 * />
 */
export default function TaskItem({ task, toggleTask, deleteTask, onEdit }) {
  return (
    <div
      key={task.id}
      className={`
        group flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm transition-all duration-200
        hover:shadow-md hover:border-blue-100
        ${task.completed ? 'opacity-60 bg-gray-50' : ''}
      `}
    >
      <div className="flex items-center gap-4 overflow-hidden">
        <button
          onClick={() => toggleTask(task.id)}
          className={`flex-shrink-0 transition-colors ${task.completed ? 'text-blue-500' : 'text-gray-300 hover:text-blue-400'}`}
          aria-label={task.completed ? 'Marcar como pendente' : 'Marcar como completa'}
        >
          {task.completed ? <CheckCircle2 size={24} className="fill-blue-50" /> : <Circle size={24} />}
        </button>
        <div className="min-w-0">
          <p className={`font-medium truncate ${task.completed ? 'line-through text-gray-400' : 'text-slate-700'}`}>{task.text}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge type={task.category} />
          </div>
        </div>
      </div>
      <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(task)}
          className="text-gray-300 hover:text-blue-500 p-2"
          aria-label="Editar tarefa"
        >
          <Pencil size={18} />
        </button>
        <button
          onClick={() => deleteTask(task.id)}
          className="text-gray-300 hover:text-red-500 p-2"
          aria-label="Deletar tarefa"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  )
}
