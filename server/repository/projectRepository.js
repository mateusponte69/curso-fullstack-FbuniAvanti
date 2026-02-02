import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Busca todos os projetos de um usuário
 * @param {number} userId - ID do usuário
 * @returns {Promise<Array>} Array de projetos
 */
export async function findAllProjects(userId) {
  return await prisma.project.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { tasks: true }
      }
    }
  });
}

/**
 * Busca um projeto específico por ID
 * @param {number} id - ID do projeto
 * @param {number} userId - ID do usuário (para validação)
 * @returns {Promise<Object|null>} Projeto ou null
 */
export async function findProjectById(id, userId) {
  return await prisma.project.findFirst({
    where: { id, userId },
    include: {
      tasks: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });
}

/**
 * Cria um novo projeto
 * @param {Object} projectData - Dados do projeto {name, description?, userId}
 * @returns {Promise<Object>} Projeto criado
 */
export async function createProject(projectData) {
  return await prisma.project.create({
    data: projectData
  });
}

/**
 * Atualiza um projeto existente
 * @param {number} id - ID do projeto
 * @param {number} userId - ID do usuário (para validação)
 * @param {Object} updateData - Dados a atualizar {name?, description?}
 * @returns {Promise<Object|null>} Projeto atualizado ou null
 */
export async function updateProject(id, userId, updateData) {
  const project = await findProjectById(id, userId);
  if (!project) return null;

  return await prisma.project.update({
    where: { id },
    data: updateData
  });
}

/**
 * Deleta um projeto
 * @param {number} id - ID do projeto
 * @param {number} userId - ID do usuário (para validação)
 * @returns {Promise<boolean>} true se deletado, false se não encontrado
 */
export async function deleteProject(id, userId) {
  const project = await findProjectById(id, userId);
  if (!project) return false;

  await prisma.project.delete({ where: { id } });
  return true;
}
