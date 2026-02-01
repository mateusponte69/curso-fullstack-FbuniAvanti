import React from 'react';
import { CheckCircle2, X, Calendar, Plus, LogOut, Briefcase, Home, Folder, Trash2 } from 'lucide-react';
import NavItem from '../../shared/components/NavItem';

/**
 * Retorna o ícone apropriado para o projeto
 * @param {string} id - ID do projeto
 * @returns {React.Element} Ícone do projeto
 */
function getProjectIcon(id) {
  if (id === 'trabalho') return <Briefcase size={20} />;
  if (id === 'pessoal') return <Home size={20} />;
  return <Folder size={20} />;
}

/**
 * Sidebar com navegação de projetos e perfil do usuário
 * @param {Object} props
 * @param {boolean} props.isMobileMenuOpen - Se o menu mobile está aberto
 * @param {Function} props.setIsMobileMenuOpen - Handler para abrir/fechar menu mobile
 * @param {string} props.filter - Filtro ativo atual
 * @param {Function} props.setFilter - Handler para mudar filtro
 * @param {Array} props.tasks - Lista de tarefas
 * @param {Array} props.projects - Lista de projetos
 * @param {Function} props.addNewProject - Handler para adicionar novo projeto
 * @param {Function} props.deleteProject - Handler para deletar projeto
 * @param {Object} props.user - Dados do usuário logado
 * @param {Function} props.handleLogout - Handler de logout
 */
export default function Sidebar({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  filter,
  setFilter,
  tasks,
  projects,
  addNewProject,
  deleteProject,
  user,
  handleLogout,
}) {
  return (
    <>
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      >
        <div className="p-6 flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-xl text-blue-600">
            <CheckCircle2 className="w-6 h-6" />
            <span>TaskFlow</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-500">
            <X size={24} />
          </button>
        </div>

        <nav className="px-4 space-y-1 flex-1">
          <NavItem
            icon={<Calendar size={20} />}
            label="Hoje"
            active={filter === 'hoje'}
            onClick={() => setFilter('hoje')}
            count={tasks.filter((t) => !t.completed).length}
          />

          <div className="flex items-center justify-between pt-6 pb-2 px-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Projetos</span>
            <button
              onClick={addNewProject}
              className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded p-1 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>

          {projects.map((proj) => (
            <div key={proj.id} className="relative group">
              <NavItem
                icon={getProjectIcon(proj.id)}
                label={proj.name}
                active={filter === proj.id}
                onClick={() => setFilter(proj.id)}
              />
              {proj.type === 'custom' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteProject(proj.id);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded p-1 transition-all"
                  aria-label={`Deletar projeto ${proj.name}`}
                  title="Deletar projeto"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </nav>

        {/* Rodapé do Sidebar com botão de Sair */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="text-sm overflow-hidden">
              <p className="font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-sm text-red-600 hover:bg-red-50 py-2 rounded-lg transition-colors border border-transparent hover:border-red-100"
          >
            <LogOut size={16} /> Sair
          </button>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}
    </>
  );
}
