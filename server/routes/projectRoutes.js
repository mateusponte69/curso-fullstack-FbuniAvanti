import express from 'express';
import * as projectRepo from '../repository/projectRepository.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/projects - Lista todos os projetos do usuário
 */
router.get('/projects', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const projects = await projectRepo.findAllProjects(userId);

    res.json({
      httpStatus: "https://http.dog/200.json",
      success: true,
      data: projects,
      message: `${projects.length} projetos encontrados`
    });
  } catch (error) {
    console.error('Erro ao listar projetos:', error);
    res.status(500).json({
      httpStatus: "https://http.dog/500.json",
      success: false,
      data: null,
      message: 'Erro ao buscar projetos'
    });
  }
});

/**
 * GET /api/projects/:id - Busca um projeto específico com suas tarefas
 */
router.get('/projects/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const projectId = parseInt(req.params.id);

    if (isNaN(projectId)) {
      return res.status(400).json({
        httpStatus: "https://http.dog/400.json",
        success: false,
        data: null,
        message: 'ID inválido'
      });
    }

    const project = await projectRepo.findProjectById(projectId, userId);

    if (!project) {
      return res.status(404).json({
        httpStatus: "https://http.dog/404.json",
        success: false,
        data: null,
        message: 'Projeto não encontrado'
      });
    }

    res.json({
      httpStatus: "https://http.dog/200.json",
      success: true,
      data: project,
      message: 'Projeto encontrado'
    });
  } catch (error) {
    console.error('Erro ao buscar projeto:', error);
    res.status(500).json({
      httpStatus: "https://http.dog/500.json",
      success: false,
      data: null,
      message: 'Erro ao buscar projeto'
    });
  }
});

/**
 * POST /api/projects - Cria um novo projeto
 * Body: { name, description? }
 */
router.post('/projects', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { name, description } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        httpStatus: "https://http.dog/400.json",
        success: false,
        data: null,
        message: 'Nome é obrigatório'
      });
    }

    const projectData = {
      name: name.trim(),
      description: description?.trim() || null,
      userId
    };

    const newProject = await projectRepo.createProject(projectData);

    res.status(201).json({
      httpStatus: "https://http.dog/201.json",
      success: true,
      data: newProject,
      message: 'Projeto criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    res.status(500).json({
      httpStatus: "https://http.dog/500.json",
      success: false,
      data: null,
      message: 'Erro ao criar projeto'
    });
  }
});

/**
 * PUT /api/projects/:id - Atualiza um projeto
 * Body: { name?, description? }
 */
router.put('/projects/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const projectId = parseInt(req.params.id);
    const { name, description } = req.body;

    if (isNaN(projectId)) {
      return res.status(400).json({
        httpStatus: "https://http.dog/400.json",
        success: false,
        data: null,
        message: 'ID inválido'
      });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;

    const updatedProject = await projectRepo.updateProject(projectId, userId, updateData);

    if (!updatedProject) {
      return res.status(404).json({
        httpStatus: "https://http.dog/404.json",
        success: false,
        data: null,
        message: 'Projeto não encontrado'
      });
    }

    res.json({
      httpStatus: "https://http.dog/200.json",
      success: true,
      data: updatedProject,
      message: 'Projeto atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
    res.status(500).json({
      httpStatus: "https://http.dog/500.json",
      success: false,
      data: null,
      message: 'Erro ao atualizar projeto'
    });
  }
});

/**
 * DELETE /api/projects/:id - Deleta um projeto
 */
router.delete('/projects/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const projectId = parseInt(req.params.id);

    if (isNaN(projectId)) {
      return res.status(400).json({
        httpStatus: "https://http.dog/400.json",
        success: false,
        data: null,
        message: 'ID inválido'
      });
    }

    const deleted = await projectRepo.deleteProject(projectId, userId);

    if (!deleted) {
      return res.status(404).json({
        httpStatus: "https://http.dog/404.json",
        success: false,
        data: null,
        message: 'Projeto não encontrado'
      });
    }

    res.json({
      httpStatus: "https://http.dog/200.json",
      success: true,
      data: null,
      message: 'Projeto deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar projeto:', error);
    res.status(500).json({
      httpStatus: "https://http.dog/500.json",
      success: false,
      data: null,
      message: 'Erro ao deletar projeto'
    });
  }
});

export default router;
