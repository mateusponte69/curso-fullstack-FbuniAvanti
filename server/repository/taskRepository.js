import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Busca todas as tarefas de um usuário
 * @param {number} userId - ID do usuário
 * @param {number} limit - Limite de tarefas (max 100)
 * @returns {Promise<Array>} Array de tarefas
 */
export async function findAllTasks(userId, limit = 100) {
  const maxLimit = Math.min(limit, 100); // Limita a 100 conforme documentação
  return await prisma.task.findMany({
    where: { userId },
    take: maxLimit,
    orderBy: { createdAt: 'desc' },
    include: {
      project: {
        select: { id: true, name: true }
      }
    }
  });
}

/**
 * Busca uma tarefa específica por ID
 * @param {number} id - ID da tarefa
 * @param {number} userId - ID do usuário (para validação)
 * @returns {Promise<Object|null>} Tarefa ou null
 */
export async function findTaskById(id, userId) {
  return await prisma.task.findFirst({
    where: { id, userId },
    include: {
      project: {
        select: { id: true, name: true }
      }
    }
  });
}

/**
 * Cria uma nova tarefa
 * @param {Object} taskData - Dados da tarefa {title, description, status, projectId, userId}
 * @returns {Promise<Object>} Tarefa criada
 */
export async function createTask(taskData) {
  return await prisma.task.create({
    data: taskData,
    include: {
      project: {
        select: { id: true, name: true }
      }
    }
  });
}

/**
 * Atualiza uma tarefa existente
 * @param {number} id - ID da tarefa
 * @param {number} userId - ID do usuário (para validação)
 * @param {Object} updateData - Dados a atualizar {title?, description?, status?, projectId?}
 * @returns {Promise<Object|null>} Tarefa atualizada ou null
 */
export async function updateTask(id, userId, updateData) {
  // Verifica se a tarefa pertence ao usuário
  const task = await findTaskById(id, userId);
  if (!task) return null;

  return await prisma.task.update({
    where: { id },
    data: updateData,
    include: {
      project: {
        select: { id: true, name: true }
      }
    }
  });
}

/**
 * Deleta uma tarefa
 * @param {number} id - ID da tarefa
 * @param {number} userId - ID do usuário (para validação)
 * @returns {Promise<boolean>} true se deletada, false se não encontrada
 */
export async function deleteTask(id, userId) {
  // Verifica se a tarefa pertence ao usuário
  const task = await findTaskById(id, userId);
  if (!task) return false;

  await prisma.task.delete({ where: { id } });
  return true;
}

/**
 * Busca tarefas filtradas por status
 * @param {number} userId - ID do usuário
 * @param {string} status - Status ('pending' ou 'completed')
 * @param {number} limit - Limite de tarefas
 * @returns {Promise<Array>} Array de tarefas
 */
export async function findTasksByStatus(userId, status, limit = 100) {
  const maxLimit = Math.min(limit, 100);
  return await prisma.task.findMany({
    where: { userId, status },
    take: maxLimit,
    orderBy: { createdAt: 'desc' },
    include: {
      project: {
        select: { id: true, name: true }
      }
    }
  });
}
