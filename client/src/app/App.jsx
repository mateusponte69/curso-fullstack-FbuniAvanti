import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import LoginScreen from '../features/auth/LoginScreen';
import Sidebar from '../features/navigation/Sidebar';
import TaskList from '../features/tasks/TaskList';
import { useAuth } from '../shared/AuthContext';

/**
 * Componente principal da aplicação TaskFlow - Dashboard
 * 
 * Responsabilidades:
 * - Gerenciar autenticação do usuário (login/logout)
 * - Manter global states dos projetos e das tarefas
 * - Providenciar handlers para operações CRUD de tarefas
 * - Gerenciar componentes da interface (LoginScreen, Sidebar, TaskList)
 * 
 * Fluxo:
 * 1. Se usuário não for autenticado, ele exibe LoginScreen
 * 2. Se o login for bem-sucedido, ele carrega tarefas/projetos via fetch
 * 3. Exibe dashboard com Sidebar (navegação) e TaskList (conteúdo)
 * 
 * @component
 */
export default function App() {
  // ==================== Estado da Autenticação (via Context) ====================
  const { user, login, logout } = useAuth();
  

  // ==================== Estado dos Dados ====================
  const [projects, setProjects] = useState([
    { id: 'trabalho', name: 'Trabalho', type: 'fixed' },
    { id: 'pessoal', name: 'Pessoal', type: 'fixed' },
  ]);
  const [tasks, setTasks] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  // ==================== Estado da UI ====================
  const [filter, setFilter] = useState('hoje');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ==================== Simulação de Requisição ao Backend ====================
  /**
   * Carrega tarefas iniciais do Mock DB (simula fetch ao backend)
   * Executado ao fazer login com delay de 500ms para simular latência
   * 
   * @async
   * @returns {Promise<void>}
   */
  useEffect(() => {
    if (user) {
      loadInitialTasks();
    }
  }, [user]);

  const loadInitialTasks = async () => {
    setIsLoadingTasks(true);
    try {

      // SIMULAÇÃO DE REQUISIÇÃO AO BACKEND

      await new Promise((resolve) => setTimeout(resolve, 500)); // Dalayzinho

      const mockTasks = [
        {
          id: 1,
          text: 'Pagar fatura do cartão',
          category: 'pessoal',
          priority: 'urgente',
          completed: false,
          time: '10:00',
        },
        {
          id: 2,
          text: 'Enviar relatório final',
          category: 'trabalho',
          priority: 'trabalho',
          completed: false,
          time: '14:00',
        },
      ];

      setTasks(mockTasks);
    } catch (error) {
      console.error('Erro ao carregar tarefas: ', error);
      setTasks([]);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  // ==================== Handlers de Tarefas ====================

  /**
   * Aqui ficam filtradas as tarefas pelo filtro atual (hoje | por projeto)
   * 
   * @returns {Array<Object>} Array de tarefas filtradas
   */

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'hoje') return true;
    return task.category === filter;

    /**
     * Basicamente tem um filtro para "hoje" que mostra todas as tarefas
     * E filtros pra cada projeto que mostram só as tarefas daquela categoria
    */

  });

  /**
   * Alterna o status de conclusão de uma tarefa
   * Mantém imutabilidade com spread operator
   * 
   * @param {number|string} id - ID da tarefa a alternar
   * @returns {void}
   * 
   * @example
   * toggleTask(1); // marca/desmarca tarefa com id=1
   */
  const toggleTask = (id) =>
    setTasks(tasks.map((t) => 
      (t.id === id ? { ...t, completed: !t.completed } : t)

    // Ele só inverte o valor do campo 'completed' da tarefa dependendo do ID

    ));

  /**
   * Remove uma tarefa da lista
   * 
   * @param {number|string} id - ID da tarefa a ser deletada
   * @returns {void}
   * 
   * @example
   * deleteTask(1); // remove tarefa com id=1
   */
  const deleteTask = (id) => setTasks(tasks.filter((t) => t.id !== id));

  /**
   * Atualiza uma tarefa existente
   * Mantém imutabilidade com spread operator
   * Simula persistência no backend com Promise e delay 300ms
   * 
   * @async
   * @param {number|string} id - ID da tarefa a ser atualizada
   * @param {Object} updatedData - Dados que atualizam (text, description, dueDate, priority, etc)
   * @returns {Promise<Object>} Tarefa atualizada
   * 
   * @example
   * await updateTask(1, { text: 'Nova descrição', priority: 'urgente' });
   */

  const updateTask = async (id, updatedData) => {

    // Validação básica

    if (!updatedData || (updatedData.text && !updatedData.text.trim())) {
      throw new Error('Campo de texto não pode estar vazio');
    }

    // Simula requisição ao backend
    await new Promise((resolve) => setTimeout(resolve, 300));

    const updatedTask = tasks.map((t) =>
      t.id === id ? { ...t, ...updatedData } : t
    );

    setTasks(updatedTask);
    
    // Retorna a tarefa atualizada por feedback
    return updatedTask.find((t) => t.id === id);
  };

  /**
   * Adiciona uma nova tarefa
   * Validação: rejeita tarefas com texto vazio
   * Categoria padrão: 'pessoal' (se filter === 'hoje') ou categoria do filtro
   * 
   * @param {Event} e - Evento do formulário (submit)
   * @param {Object} taskData - Dados da tarefa (text, description, category, dueDate)
   * @returns {void}
   */
  const addTask = (e, taskData) => {
    e.preventDefault();

    if (!taskData || !taskData.text || !taskData.text.trim()) return;

    const newTask = {
      id: Date.now(),
      text: taskData.text,
      description: taskData.description || '',
      category: taskData.category || (filter === 'hoje' ? 'pessoal' : filter),
      dueDate: taskData.dueDate || '',
      priority: 'padrao',
      completed: false,
      time: null,
    };

    setTasks([newTask, ...tasks]);
    setIsModalOpen(false);
  };

  // ==================== Handlers de Projetos ====================

  // Modal de criação de projeto
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  
  /**
   * Adiciona um novo projeto customizado
   * Solicita nome do projeto em um modal
   * Valida ID único (lowercase, sem espaços)
   * Muda filtro automaticamente para o novo projeto
   * 
   * @returns {void}
   * 
   * @example
   * addNewProject(); // abre modal para criar projeto
   */

  const addNewProject = () => {
    setIsProjectModalOpen(true);
  };

  const createProject = (e) => {
    if (e && e.preventDefault) e.preventDefault(); // Previne reload da página

    const projectName = (newProjectName || '').trim();

    if (!projectName) return; // Precisa ter nome

    const newId = projectName.toLowerCase().replace(/\s/g, '-');
    if (!projects.find((p) => p.id === newId)) {
      setProjects([...projects, { id: newId, name: projectName, type: 'custom' }]);
      setFilter(newId);
    }
    setNewProjectName('');
    setIsProjectModalOpen(false);
  };

  const cancelCreateProject = () => {
    setNewProjectName('');
    setIsProjectModalOpen(false);
  };

  /**
   * Remove um projeto customizado
   * Valida se é projeto customizado (não deixa apagar projetos fixos)
   * Solicita confirmação antes de excluir
   * Se o filtro atual for o projeto deletado, muda para 'hoje'
   * 
   * @param {string} projectId - ID do projeto a ser deletado
   * @returns {void}
   */

  const deleteProject = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    
    // Não deixa apagar projetos fixos
    if (!project || project.type === 'fixed') {
      alert('Não é possível deletar projetos padrão.');
      return;
    }

    // Confirmação
    if (!confirm(`Tem certeza que deseja excluir o projeto "${project.name}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    // Remove o projeto
    setProjects(projects.filter(p => p.id !== projectId));

    // Se o filtro atual for o projeto deletado, volta para 'hoje'
    if (filter === projectId) {
      setFilter('hoje');
    }
  };

  // ==================== Handlers de Autenticação ====================

  /**
   * Realiza logout do usuário
   * Solicita confirmação antes de desconectar
   * Retorna à tela de login ao confirmar
   * 
   * @returns {void}
   * 
   * @example
   * handleLogout(); // abre diálogo de confirmação
   */
  const handleLogout = () => {
    if (confirm('Deseja sair do sistema?')) {
      logout();
    }
  };

  // ==================== Renderização ====================
  
  /**
   * Renderiza tela de login enquanto usuário não estiver autenticado
   */
  if (!user) {
    return <LoginScreen onLogin={login} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-slate-800 overflow-hidden">
      <Sidebar
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        filter={filter}
        setFilter={setFilter}
        tasks={tasks}
        projects={projects}
        addNewProject={addNewProject}
        deleteProject={deleteProject}
        user={user}
        handleLogout={handleLogout}
      />

      {/* TELA PRINCIPAL */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-10">
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-600">
            <Menu size={24} />
          </button>
          <span className="font-semibold text-lg">
            {filter === 'hoje' ? 'Hoje' : projects.find((p) => p.id === filter)?.name}
          </span>
          <div className="w-6"></div>
        </header>

        <TaskList
          user={user}
          filteredTasks={filteredTasks}
          filteredCount={filteredTasks.filter((t) => !t.completed).length}
          projects={projects}
          filter={filter}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          isLoadingTasks={isLoadingTasks}
          addTask={addTask}
          toggleTask={toggleTask}
          deleteTask={deleteTask}
          updateTask={updateTask}
          addNewProject={addNewProject}
        />
      </main>

      {/* Modal de criação de projeto */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={cancelCreateProject}></div>
          <form onSubmit={createProject} className="bg-white w-full md:w-[500px] md:rounded-2xl rounded-t-2xl p-6 shadow-2xl relative z-10 animate-slide-up">
            <h3 className="text-lg font-semibold mb-4">Novo Projeto</h3>
            <input
              autoFocus
              type="text"
              placeholder="Nome do projeto"
              className="w-full text-lg border-none focus:ring-0 p-0 mb-6 placeholder:text-gray-300 outline-none"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
            />
            <div className="flex justify-end">
              <button type="button" onClick={cancelCreateProject} className="mr-2 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200">Cancelar</button>
              <button type="submit" disabled={!newProjectName.trim()} className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">Criar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
