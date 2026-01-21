import React, { useState, useEffect } from 'react';
import { 
  Menu, X, Plus, Calendar, CheckCircle2, Circle, 
  Trash2, Briefcase, Home, Clock, Folder, LogOut, Loader2 
} from 'lucide-react';

// --- Componente: TELA DE LOGIN ---
const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // SIMULAÇÃO DE BACKEND (Delay de 1.5s)
    setTimeout(() => {
      // Regra simples: aceita qualquer email, mas senha tem que ter 3+ digitos
      if (password.length < 3) {
        setError('A senha deve ter no mínimo 3 caracteres.');
        setIsLoading(false);
      } else {
        // Sucesso!
        onLogin({ name: 'Mateus', email: email });
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Bem-vindo ao TaskFlow</h1>
          <p className="text-slate-500 mt-2">Organize sua vida com simplicidade.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg text-center">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} /> Entrando...
              </>
            ) : (
              'Entrar no Sistema'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Dica: Use qualquer senha com mais de 3 dígitos.
        </p>
      </div>
    </div>
  );
};

// --- Componentes UI Reutilizáveis ---

const Badge = ({ type }) => {
  const styles = {
    urgente: "bg-red-100 text-red-700 border-red-200",
    trabalho: "bg-orange-100 text-orange-700 border-orange-200",
    pessoal: "bg-purple-100 text-purple-700 border-purple-200",
    padrao: "bg-gray-100 text-gray-600 border-gray-200"
  };
  const styleClass = styles[type] || "bg-blue-100 text-blue-700 border-blue-200";
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${styleClass}`}>
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
};

// --- Aplicação Principal (Dashboard + Lógica) ---

export default function App() {
  // ESTADO DE USUÁRIO (O Porteiro)
  // Se null = Mostra Login. Se tiver dados = Mostra App.
  const [user, setUser] = useState(null);

  // Estados do App
  const [projects, setProjects] = useState([
    { id: 'trabalho', name: 'Trabalho', type: 'fixed' },
    { id: 'pessoal', name: 'Pessoal', type: 'fixed' }
  ]);
  const [tasks, setTasks] = useState([
    { id: 1, text: "Pagar fatura do cartão", category: "pessoal", priority: "urgente", completed: false, time: "10:00" },
    { id: 2, text: "Enviar relatório final", category: "trabalho", priority: "trabalho", completed: false, time: "14:00" },
  ]);
  const [filter, setFilter] = useState('hoje'); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");

  // --- Renderização Condicional (A Mágica acontece aqui) ---
  if (!user) {
    return <LoginScreen onLogin={(userData) => setUser(userData)} />;
  }

  // ... (Funções do App) ...
  const getProjectIcon = (id) => {
    if (id === 'trabalho') return <Briefcase size={20} />;
    if (id === 'pessoal') return <Home size={20} />;
    return <Folder size={20} />;
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'hoje') return true;
    return task.category === filter;
  });

  const toggleTask = (id) => setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  const deleteTask = (id) => setTasks(tasks.filter(t => t.id !== id));
  
  const addTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const newTask = {
      id: Date.now(),
      text: newTaskText,
      category: filter === 'hoje' ? 'pessoal' : filter, 
      priority: 'padrao',
      completed: false,
      time: null
    };
    setTasks([newTask, ...tasks]);
    setNewTaskText("");
    setIsModalOpen(false);
  };

  const addNewProject = () => {
    const projectName = prompt("Qual o nome do novo projeto?");
    if (projectName && projectName.trim() !== "") {
      const newId = projectName.toLowerCase().replace(/\s/g, '-');
      if (!projects.find(p => p.id === newId)) {
        setProjects([...projects, { id: newId, name: projectName, type: 'custom' }]);
        setFilter(newId);
      }
    }
  };

  const handleLogout = () => {
    if(confirm("Deseja sair do sistema?")) {
      setUser(null); // Volta para a tela de login
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-slate-800 overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
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
          <NavItem icon={<Calendar size={20}/>} label="Hoje" active={filter === 'hoje'} onClick={() => setFilter('hoje')} count={tasks.filter(t => !t.completed).length} />
          
          <div className="flex items-center justify-between pt-6 pb-2 px-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Projetos</span>
            <button onClick={addNewProject} className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded p-1 transition-colors">
              <Plus size={16} />
            </button>
          </div>

          {projects.map((proj) => (
            <NavItem 
              key={proj.id}
              icon={getProjectIcon(proj.id)} 
              label={proj.name} 
              active={filter === proj.id} 
              onClick={() => setFilter(proj.id)}
            />
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

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-10">
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-600">
            <Menu size={24} />
          </button>
          <span className="font-semibold text-lg">
            {filter === 'hoje' ? 'Hoje' : projects.find(p => p.id === filter)?.name}
          </span>
          <div className="w-6"></div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 max-w-3xl mx-auto w-full">
          <header className="mb-8 hidden md:block">
            <h1 className="text-3xl font-bold text-slate-900 mb-1">
              Olá, {user.name} 👋
            </h1>
            <p className="text-slate-500">
              Você tem {filteredTasks.filter(t => !t.completed).length} tarefas pendentes em 
              <span className="font-semibold text-blue-600"> {filter === 'hoje' ? 'Hoje' : projects.find(p => p.id === filter)?.name}</span>.
            </p>
          </header>

          <div className="space-y-3">
            {filteredTasks.map((task) => (
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
                <button onClick={() => deleteTask(task.id)} className="text-gray-300 hover:text-red-500 md:opacity-0 md:group-hover:opacity-100 transition-opacity p-2">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
          <div className="h-24"></div>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="absolute bottom-6 right-6 md:bottom-10 md:right-10 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-30"
        >
          <Plus size={28} />
        </button>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <form onSubmit={addTask} className="bg-white w-full md:w-[500px] md:rounded-2xl rounded-t-2xl p-6 shadow-2xl relative z-10 animate-slide-up">
            <h3 className="text-lg font-semibold mb-4">Nova Tarefa</h3>
            <input 
              autoFocus
              type="text" 
              placeholder="O que precisa ser feito?"
              className="w-full text-lg border-none focus:ring-0 p-0 mb-6 placeholder:text-gray-300 outline-none"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
            />
            <div className="flex justify-end">
              <button type="submit" disabled={!newTaskText.trim()} className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">Salvar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function NavItem({ icon, label, active, onClick, count }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg mb-1 transition-colors ${active ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-gray-100'}`}>
      <div className="flex items-center gap-3">
        {React.cloneElement(icon, { size: 20, className: active ? 'text-blue-600' : 'text-gray-400' })}
        <span className="font-medium text-sm truncate max-w-[120px] text-left">{label}</span>
      </div>
      {count !== undefined && count > 0 && <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full font-bold">{count}</span>}
    </button>
  );
}