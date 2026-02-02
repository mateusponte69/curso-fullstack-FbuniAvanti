/**
 * Serviço de API para comunicação com o backend
 * Centraliza todas as chamadas HTTP e tratamento de erros
 * 
 * @module api
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Retorna headers padrão para requisições
 * Inclui token JWT se disponível
 * 
 * @returns {Object} Headers HTTP
 */
function getHeaders() {
  const user = JSON.parse(localStorage.getItem('taskflow_user') || 'null');
  const headers = {
    'Content-Type': 'application/json',
  };

  if (user?.token) {
    headers['Authorization'] = `Bearer ${user.token}`;
  }

  return headers;
}

/**
 * Faz requisição HTTP genérica
 * 
 * @param {string} endpoint - Endpoint da API (ex: '/tasks')
 * @param {Object} options - Opções do fetch
 * @returns {Promise<Object>} Resposta da API
 * @throws {Error} Se requisição falhar
 */
async function request(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getHeaders(),
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Erro ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`Erro na requisição ${endpoint}:`, error);
    throw error;
  }
}

// ==================== AUTH ====================

/**
 * Realiza login no sistema
 * @param {string} email - Email do usuário
 * @param {string} password - Senha
 * @returns {Promise<Object>} { token, user }
 */
export async function login(email, password) {
  const response = await request('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return response.data;
}

/**
 * Registra novo usuário
 * @param {Object} userData - {email, password, name}
 * @returns {Promise<Object>} Usuário criado
 */
export async function register(userData) {
  const response = await request('/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  return response.data;
}

// ==================== TASKS ====================

/**
 * Lista todas as tarefas do usuário
 * @param {number} [limit=100] - Limite de tarefas
 * @returns {Promise<Array>} Array de tarefas
 */
export async function getTasks(limit = 100) {
  const response = await request(`/tasks?limit=${limit}`);
  return response.data;
}

/**
 * Busca tarefa específica por ID
 * @param {number} id - ID da tarefa
 * @returns {Promise<Object>} Tarefa
 */
export async function getTask(id) {
  const response = await request(`/tasks/${id}`);
  return response.data;
}

/**
 * Cria nova tarefa
 * @param {Object} taskData - {title, description?, status?, projectId?}
 * @returns {Promise<Object>} Tarefa criada
 */
export async function createTask(taskData) {
  const response = await request('/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData),
  });
  return response.data;
}

/**
 * Atualiza tarefa existente
 * @param {number} id - ID da tarefa
 * @param {Object} updateData - Dados a atualizar
 * @returns {Promise<Object>} Tarefa atualizada
 */
export async function updateTask(id, updateData) {
  const response = await request(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });
  return response.data;
}

/**
 * Deleta tarefa
 * @param {number} id - ID da tarefa
 * @returns {Promise<void>}
 */
export async function deleteTask(id) {
  await request(`/tasks/${id}`, {
    method: 'DELETE',
  });
}

// ==================== PROJECTS ====================

/**
 * Lista todos os projetos do usuário
 * @returns {Promise<Array>} Array de projetos
 */
export async function getProjects() {
  const response = await request('/projects');
  return response.data;
}

/**
 * Busca projeto específico por ID
 * @param {number} id - ID do projeto
 * @returns {Promise<Object>} Projeto com tarefas
 */
export async function getProject(id) {
  const response = await request(`/projects/${id}`);
  return response.data;
}

/**
 * Cria novo projeto
 * @param {Object} projectData - {name, description?}
 * @returns {Promise<Object>} Projeto criado
 */
export async function createProject(projectData) {
  const response = await request('/projects', {
    method: 'POST',
    body: JSON.stringify(projectData),
  });
  return response.data;
}

/**
 * Atualiza projeto existente
 * @param {number} id - ID do projeto
 * @param {Object} updateData - Dados a atualizar
 * @returns {Promise<Object>} Projeto atualizado
 */
export async function updateProject(id, updateData) {
  const response = await request(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });
  return response.data;
}

/**
 * Deleta projeto
 * @param {number} id - ID do projeto
 * @returns {Promise<void>}
 */
export async function deleteProject(id) {
  await request(`/projects/${id}`, {
    method: 'DELETE',
  });
}
