import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import LoginScreen from '../features/auth/LoginScreen';
import Sidebar from '../features/navigation/Sidebar';
import TaskList from '../features/tasks/TaskList';
import { useAuth } from '../shared/AuthContext';
import * as api from '../shared/services/api';

/**
 * Componente principal da aplicação TaskFlow - Dashboard
 * Integrado com backend real via API REST
 * 
 * RESPONSABILIDADES:
 * - Gerenciar autenticação do usuário (login/logout)
 * - Manter estado global de projetos e tarefas
 * - Sincronizar dados com backend via API REST
 * - Orquestrar comunicação entre Sidebar e TaskList
 * - Controlar modais de criação (tarefas e projetos)
 * 
 * FLUXO DE DADOS:
 * 1. Usuário não autenticado → Exibe LoginScreen
 * 2. Login bem-sucedido → Carrega projetos e tarefas do backend
 * 3. Operações CRUD → Atualiza backend E estado local
 * 4. Mudança de filtro → Re-renderiza TaskList com tarefas filtradas
 * 
 * FORMATO DE DADOS:
 * - Backend usa: {id, title, description, status, projectId}
 * - Frontend usa: {id, text, description, completed, category}
 * - Conversão ocorre em loadTasks(), addTask() e updateTask()
 * 
 * @component
 */
export default function App() {
  // ==================== Autenticação ====================
  const { user, login, logout } = useAuth(); // Context API para compartilhar user entre componentes

  // ==================== Estado dos Dados ====================
  // Projetos: carregados do backend ao fazer login, formato: [{id, name, type}]
  const [projects, setProjects] = useState([]);
  
  // Tarefas: carregadas do backend e convertidas para formato do frontend
  const [tasks, setTasks] = useState([]);
  
  // Flags de loading para exibir skeleton/spinners durante fetch
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  // ==================== Estado da UI ====================
  // Filtro ativo: 'hoje' (todas as tarefas) ou ID do projeto selecionado
  const [filter, setFilter] = useState('hoje');
  
  // Controla abertura do menu lateral em mobile (Sidebar slide-in)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Controla modal de criação de tarefa (TaskFormModal)
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ==================== Carregamento Inicial ====================
  
  /**
   * Efeito executado ao fazer login (quando `user` muda de null para objeto)
   * Dispara fetch paralelo de projetos e tarefas do backend
   * 
   * IMPORTANTE: Este effect só roda quando user existe (após login)
   * Não roda no mount inicial pois user começa null
   * 
   * @dependency {Object} user - Objeto do usuário logado com {id, name, email, token}
   */
  useEffect(() => {
    if (user) {
      loadProjects();
      loadTasks();
    }
  }, [user]);

  /**
   * Carrega todos os projetos do usuário do backend
   * 
   * FLUXO:
   * 1. Ativa loading (para mostrar skeleton na Sidebar)
   * 2. Faz fetch via api.getProjects() → GET /api/projects
   * 3. Atualiza estado com projetos recebidos
   * 4. Em caso de erro, reseta para array vazio (fallback seguro)
   * 
   * FORMATO RECEBIDO: [{id: number, name: string, description: string, userId: number}]
   * FORMATO USADO: [{id: number, name: string, type: 'custom'}]
   * 
   * @async
   * @returns {Promise<void>}
   */
  const loadProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const projectsData = await api.getProjects();
      setProjects(projectsData);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
      setProjects([]); // Fallback: lista vazia em vez de crashar
    } finally {
      setIsLoadingProjects(false);
    }
  };

  /**
   * Carrega todas as tarefas do usuário e converte formato backend → frontend
   * 
   * CONVERSÃO DE FORMATO (CRÍTICO PARA ENTENDER):
   * Backend retorna:   {id, title, description, status, projectId}
   * Frontend espera:   {id, text, description, completed, category}
   * 
   * MAPEAMENTO:
   * - title → text (nome da tarefa exibido)
   * - status ('pending'|'completed') → completed (boolean)
   * - projectId → category (ID do projeto ou 'pessoal' se null)
   * - priority e time são fixos (não vêm do backend ainda)
   * 
   * FLUXO:
   * 1. Ativa loading → TaskList exibe skeleton
   * 2. Fetch via api.getTasks() → GET /api/tasks
   * 3. Mapeia cada tarefa para formato do frontend
   * 4. Atualiza estado local
   * 
   * @async
   * @returns {Promise<void>}
   */
  const loadTasks = async () => {
    setIsLoadingTasks(true);
    try {
      const tasksData = await api.getTasks();
      
      // Converte para o formato esperado pelo frontend
      const formattedTasks = tasksData.map(task => ({
        id: task.id,
        text: task.title,                              // Backend: title → Frontend: text
        description: task.description,
        category: task.projectId || 'pessoal',         // Backend: projectId → Frontend: category
        priority: 'padrao',                            // Fixo por enquanto (não vem do backend)
        completed: task.status === 'completed',        // Backend: status → Frontend: completed (boolean)
        time: null,                                    // Fixo por enquanto (não vem do backend)
      }));
      setTasks(formattedTasks);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
      setTasks([]); // Fallback: lista vazia em vez de crashar
    } finally {
      setIsLoadingTasks(false);
    }
  };

  // ==================== Handlers de Tarefas ====================

  /**
   * COMPUTED VALUE: Filtra tarefas pelo filtro ativo (não é uma função, é recalculado a cada render)
   * 
   * LÓGICA:
   * - Se filter === 'hoje' → Mostra TODAS as tarefas (sem filtro)
   * - Se filter === projectId → Mostra apenas tarefas daquele projeto (task.category === projectId)
   * 
   * IMPORTANTE: Este valor é recalculado a cada render sempre que `tasks` ou `filter` mudam
   * Passado para TaskList que renderiza apenas as tarefas filtradas
   * 
   * @type {Array<Object>} Array de tarefas filtradas
   */
  const filteredTasks = tasks.filter((task) => {
    if (filter === 'hoje') return true;      // 'hoje' = sem filtro (todas as tarefas)
    return task.category === filter;          // Filtra por projeto específico
  });

  /**
   * Alterna status de conclusão de uma tarefa (pendente ↔ concluída)
   * Chamado ao clicar no checkbox da tarefa
   * 
   * FLUXO:
   * 1. Busca tarefa no estado local
   * 2. Determina novo status baseado no atual (inverte)
   * 3. Envia update para backend → PUT /api/tasks/:id
   * 4. Se sucesso, atualiza estado local (toggle do completed)
   * 5. Se erro, mostra alerta (não muda estado local)
   * 
   * IMPORTANTE: Usamos imutabilidade com .map() e spread operator
   * Isso força re-render correto do React
   * 
   * @async
   * @param {number} id - ID da tarefa a alternar
   * @returns {Promise<void>}
   * 
   * @example
   * toggleTask(5); // Marca/desmarca tarefa com id=5
   */
  const toggleTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return; // Guard: tarefa não existe (não deveria acontecer)

    try {
      // Converte completed (boolean) para status (string) esperado pelo backend
      const newStatus = task.completed ? 'pending' : 'completed';
      await api.updateTask(id, { status: newStatus });
      
      // Atualiza estado local mantendo imutabilidade
      setTasks(tasks.map((t) => 
        t.id === id ? { ...t, completed: !t.completed } : t
      ));
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      alert('Erro ao atualizar tarefa');
    }
  };

  /**
   * Deleta uma tarefa permanentemente
   * Chamado ao clicar no botão de deletar no TaskItem
   * 
   * FLUXO:
   * 1. Solicita confirmação do usuário (window.confirm)
   * 2. Se cancelar → Aborta operação
   * 3. Se confirmar → Envia DELETE para backend → DELETE /api/tasks/:id
   * 4. Se sucesso, remove tarefa do estado local via .filter()
   * 5. Se erro, mostra alerta (não remove do estado)
   * 
   * IMPORTANTE: .filter() retorna novo array sem a tarefa deletada (imutabilidade)
   * 
   * @async
   * @param {number} id - ID da tarefa a deletar
   * @returns {Promise<void>}
   * 
   * @example
   * deleteTask(10); // Deleta tarefa com id=10 (após confirmação)
   */
  const deleteTask = async (id) => {
    if (!confirm('Deseja realmente deletar esta tarefa?')) return;

    try {
      await api.deleteTask(id); // DELETE /api/tasks/:id
      setTasks(tasks.filter((t) => t.id !== id)); // Remove do estado local
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
      alert('Erro ao deletar tarefa');
    }
  };

  /**
   * Atualiza dados de uma tarefa existente (título, descrição, projeto)
   * Chamado ao salvar edição no TaskEditModal
   * 
   * CONVERSÃO FRONTEND → BACKEND:
   * Frontend envia: {text, description, category}
   * Backend espera: {title, description, projectId}
   * 
   * MAPEAMENTO:
   * - text → title
   * - category → projectId (null se category === 'pessoal')
   * 
   * FLUXO:
   * 1. Valida que text não está vazio
   * 2. Converte formato frontend → backend
   * 3. Envia update → PUT /api/tasks/:id
   * 4. Backend retorna tarefa atualizada
   * 5. Converte resposta backend → frontend
   * 6. Atualiza estado local com .map() (imutabilidade)
   * 
   * @async
   * @param {number} id - ID da tarefa a atualizar
   * @param {Object} updatedData - Dados em formato frontend {text, description, category}
   * @returns {Promise<Object>} Tarefa atualizada no formato backend
   * @throws {Error} Se text estiver vazio ou ocorrer erro na API
   * 
   * @example
   * await updateTask(3, {text: 'Novo título', description: 'Nova descrição', category: 5});
   */
  const updateTask = async (id, updatedData) => {
    // Validação: text não pode estar vazio
    if (!updatedData || (updatedData.text && !updatedData.text.trim())) {
      throw new Error('Campo de texto não pode estar vazio');
    }

    try {
      // CONVERSÃO: Formato frontend → backend
      const backendData = {
        title: updatedData.text,                    // text → title
        description: updatedData.description,
        projectId: updatedData.category !== 'pessoal' ? updatedData.category : null,
      };

      const updated = await api.updateTask(id, backendData); // PUT /api/tasks/:id

      // Atualiza estado local convertendo backend → frontend
      setTasks(tasks.map((t) =>
        t.id === id ? {
          ...t,
          text: updated.title,                       // Backend: title → Frontend: text
          description: updated.description,
          category: updated.projectId || 'pessoal',  // Backend: projectId → Frontend: category
        } : t
      ));

      return updated;
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      throw error; // Re-throw para que TaskEditModal possa tratar
    }
  };

  /**
   * Cria uma nova tarefa
   * Chamado ao submeter formulário no TaskFormModal
   * 
   * CONVERSÃO FRONTEND → BACKEND → FRONTEND:
   * 1. Modal envia: {text, description, category} (formato frontend)
   * 2. Convertemos para: {title, description, status, projectId} (formato backend)
   * 3. Backend cria e retorna tarefa com ID gerado
   * 4. Convertemos resposta de volta para formato frontend
   * 5. Adicionamos no início do array (tarefas mais recentes primeiro)
   * 
   * FLUXO:
   * 1. Previne reload da página (e.preventDefault)
   * 2. Valida que text não está vazio
   * 3. Converte para formato backend
   * 4. Envia POST → POST /api/tasks
   * 5. Converte resposta para formato frontend
   * 6. Adiciona no início do estado local (spread operator)
   * 7. Fecha modal
   * 
   * @async
   * @param {Event} e - Evento do formulário (submit)
   * @param {Object} taskData - Dados em formato frontend {text, description, category}
   * @returns {Promise<void>}
   * 
   * @example
   * addTask(submitEvent, {text: 'Estudar React', description: 'Revisar hooks', category: 5});
   */
  const addTask = async (e, taskData) => {
    e.preventDefault();

    if (!taskData || !taskData.text || !taskData.text.trim()) return;

    try {
      // CONVERSÃO: Formato frontend → backend
      const backendData = {
        title: taskData.text,                          // text → title
        description: taskData.description || '',
        status: 'pending',                             // Novas tarefas sempre começam pendentes
        projectId: taskData.category !== 'pessoal' ? parseInt(taskData.category) : null,
      };

      const created = await api.createTask(backendData); // POST /api/tasks

      // CONVERSÃO: Formato backend → frontend
      const newTask = {
        id: created.id,                                // ID gerado pelo backend
        text: created.title,                           // Backend: title → Frontend: text
        description: created.description || '',
        category: created.projectId || 'pessoal',      // Backend: projectId → Frontend: category
        priority: 'padrao',                            // Fixo por enquanto
        completed: false,                              // Nova tarefa sempre pendente
        time: null,                                    // Fixo por enquanto
      };

      setTasks([newTask, ...tasks]); // Adiciona no início (spread operator)
      setIsModalOpen(false);         // Fecha modal após sucesso
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      alert('Erro ao criar tarefa');
    }
  };

  // ==================== Handlers de Projetos ====================

  // Estados do modal de criação de projeto
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false); // Controla visibilidade do modal
  const [newProjectName, setNewProjectName] = useState('');             // Nome digitado no input do modal
  
  /**
   * Abre modal para criar novo projeto
   * Apenas define flag que exibe modal no JSX
   * O submit real acontece em createProject()
   */
  const addNewProject = () => {
    setIsProjectModalOpen(true);
  };

  /**
   * Cria novo projeto no backend e adiciona ao estado local
   * Chamado ao submeter formulário do modal de projeto
   * 
   * FLUXO:
   * 1. Previne reload da página
   * 2. Valida que nome não está vazio
   * 3. Envia POST → POST /api/projects
   * 4. Backend retorna projeto com ID gerado
   * 5. Adiciona ao estado local com type: 'custom' (para permitir deleção)
   * 6. Muda filtro para o novo projeto (usuário vê imediatamente)
   * 7. Reseta input e fecha modal
   * 
   * IMPORTANTE: Projetos criados têm type: 'custom' para diferenciá-los de fixos
   * Apenas projetos 'custom' podem ser deletados
   * 
   * @async
   * @param {Event} e - Evento do formulário (submit)
   * @returns {Promise<void>}
   * 
   * @example
   * createProject(submitEvent); // Lê newProjectName do estado
   */
  const createProject = async (e) => {
    if (e && e.preventDefault) e.preventDefault(); // Previne reload da página

    const projectName = (newProjectName || '').trim();
    if (!projectName) return; // Guard: nome vazio

    try {
      const created = await api.createProject({
        name: projectName,
        description: '',
      });

      // Adiciona projeto ao estado local
      setProjects([...projects, {
        id: created.id,           // ID gerado pelo backend
        name: created.name,
        type: 'custom'            // Marca como deletável
      }]);
      
      setFilter(created.id);      // Muda para o novo projeto
      setNewProjectName('');      // Limpa input
      setIsProjectModalOpen(false); // Fecha modal
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      alert('Erro ao criar projeto');
    }
  };

  /**
   * Cancela criação de projeto e fecha modal
   * Limpa input do nome para evitar lixo no próximo uso
   */
  const cancelCreateProject = () => {
    setNewProjectName('');
    setIsProjectModalOpen(false);
  };

  /**
   * Deleta projeto customizado permanentemente
   * Chamado ao clicar no ícone de lixeira na Sidebar
   * 
   * VALIDAÇÕES:
   * - Não permite deletar projetos com type: 'fixed'
   * - Solicita confirmação antes de deletar
   * 
   * FLUXO:
   * 1. Busca projeto no estado local
   * 2. Valida que existe e é 'custom'
   * 3. Solicita confirmação
   * 4. Se confirmar → DELETE /api/projects/:id
   * 5. Remove do estado local via .filter()
   * 6. Se era o filtro ativo, volta para 'hoje'
   * 
   * IMPORTANTE: Se deletar projeto que está sendo visualizado,
   * muda filtro para 'hoje' para evitar tela vazia
   * 
   * @async
   * @param {number} projectId - ID do projeto a deletar
   * @returns {Promise<void>}
   * 
   * @example
   * deleteProject(7); // Deleta projeto com id=7 (após confirmação)
   */
  const deleteProject = async (projectId) => {
    const project = projects.find(p => p.id === projectId);
    
    // Guard: não deixa deletar projetos fixos
    if (!project || project.type === 'fixed') {
      alert('Não é possível deletar projetos padrão.');
      return;
    }

    // Confirmação
    if (!confirm(`Tem certeza que deseja excluir o projeto "${project.name}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      await api.deleteProject(projectId); // DELETE /api/projects/:id
      setProjects(projects.filter(p => p.id !== projectId)); // Remove do estado

      // Se estava visualizando o projeto deletado, volta para 'hoje'
      if (filter === projectId) {
        setFilter('hoje');
      }
    } catch (error) {
      console.error('Erro ao deletar projeto:', error);
      alert('Erro ao deletar projeto');
    }
  };

  // ==================== Handlers de Autenticação ====================

  /**
   * Realiza logout do usuário
   * Solicita confirmação antes de deslogar
   * Se confirmar, chama logout() do AuthContext que:
   * - Remove user do localStorage
   * - Seta user para null
   * - Força re-render que exibe LoginScreen
   */
  const handleLogout = () => {
    if (confirm('Deseja sair do sistema?')) {
      logout();
    }
  };

  // ==================== Renderização ====================
  
  // GUARD: Se usuário não logado, exibe apenas tela de login
  // Quando login for bem-sucedido, user é setado e componente re-renderiza exibindo dashboard
  if (!user) {
    return <LoginScreen onLogin={login} />;
  }

  // DASHBOARD: Layout principal com Sidebar + TaskList

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-slate-800 overflow-hidden">
      {/* 
        SIDEBAR (Navegação Lateral)
        - Mostra lista de projetos
        - Controla filtro ativo
        - Botão de logout
        - Em mobile: slide-in controlado por isMobileMenuOpen
      */}
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

      {/* MAIN CONTENT (Área de Tarefas) */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* HEADER MOBILE: Só aparece em telas pequenas (md:hidden) */}
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-10">
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-600">
            <Menu size={24} />
          </button>
          {/* Título dinâmico: 'Hoje' ou nome do projeto ativo */}
          <span className="font-semibold text-lg">
            {filter === 'hoje' ? 'Hoje' : projects.find((p) => p.id === filter)?.name}
          </span>
          <div className="w-6"></div> {/* Spacer para centralizar título */}
        </header>

        {/* 
          TASKLIST (Lista de Tarefas)
          - Renderiza apenas tarefas filtradas (filteredTasks)
          - Controla modais de criação/edição
          - Recebe handlers de CRUD
        */}
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

      {/* 
        MODAL DE CRIAÇÃO DE PROJETO
        - Renderizado condicionalmente (só se isProjectModalOpen === true)
        - Overlay semi-transparente (clique fecha modal)
        - Formulário com input de texto
        - Animação slide-up no mobile
      */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
          {/* Overlay: Clique fora fecha modal */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={cancelCreateProject}></div>
          
          {/* Formulário de criação */}
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
