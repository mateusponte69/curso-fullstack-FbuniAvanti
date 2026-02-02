import express from 'express';
import * as taskRepo from '../repository/taskRepository.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/tasks - Lista todas as tarefas do usuário
 * Query params: limit (opcional, max 100)
 */
router.get('/tasks', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId; // Tá no token JWT
    const limit = parseInt(req.query.limit) || 100;
    
    const tasks = await taskRepo.findAllTasks(userId, limit);

    res.json({
      httpStatus: "https://http.dog/200.json",
      success: true,
      data: tasks,
      message: `${tasks.length} tarefas encontradas`
    });
  } catch (error) {
    console.error('Erro ao listar tarefas:', error);
    res.status(500).json({
      httpStatus: "https://http.dog/500.json",
      success: false,
      data: null,
      message: 'Erro ao buscar tarefas'
    });
  }
});

/**
 * GET /api/tasks/:id - Busca uma tarefa específica
 */
router.get('/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const taskId = parseInt(req.params.id);

    if (isNaN(taskId)) {
      return res.status(400).json({
        httpStatus: "https://http.dog/400.json",
        success: false,
        data: null,
        message: 'ID inválido'
      });
    }

    const task = await taskRepo.findTaskById(taskId, userId);

    if (!task) {
      return res.status(404).json({
        httpStatus: "https://http.dog/404.json",
        success: false,
        data: null,
        message: 'Tarefa não encontrada'
      });
    }

    res.json({
      httpStatus: "https://http.dog/200.json",
      success: true,
      data: task,
      message: 'Tarefa encontrada'
    });
  } catch (error) {
    console.error('Erro ao buscar tarefa:', error);
    res.status(500).json({
      httpStatus: "https://http.dog/500.json",
      success: false,
      data: null,
      message: 'Erro ao buscar tarefa'
    });
  }
});

/**
 * POST /api/tasks - Cria uma nova tarefa
 * Body: { title, description?, status?, projectId? }
 */
router.post('/tasks', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { title, description, status, projectId } = req.body;

    // Validação básica
    if (!title || title.trim() === '') {
      return res.status(400).json({
        httpStatus: "https://http.dog/400.json",
        success: false,
        data: null,
        message: 'Título é obrigatório'
      });
    }

    const taskData = {
      title: title.trim(),
      description: description?.trim() || null,
      status: status || 'pending',
      projectId: projectId ? parseInt(projectId) : null,
      userId
    };

    const newTask = await taskRepo.createTask(taskData);

    res.status(201).json({
      httpStatus: "https://http.dog/201.json",
      success: true,
      data: newTask,
      message: 'Tarefa criada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    res.status(500).json({
      httpStatus: "https://http.dog/500.json",
      success: false,
      data: null,
      message: 'Erro ao criar tarefa'
    });
  }
});

/**
 * PUT /api/tasks/:id - Atualiza uma tarefa
 * Body: { title?, description?, status?, projectId? }
 */
router.put('/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const taskId = parseInt(req.params.id);
    const { title, description, status, projectId } = req.body;

    if (isNaN(taskId)) {
      return res.status(400).json({
        httpStatus: "https://http.dog/400.json",
        success: false,
        data: null,
        message: 'ID inválido'
      });
    }

    // Monta objeto de atualização apenas com campos fornecidos
    // const updateData = {};
    // if (title !== undefined) updateData.title = title.trim();
    // if (description !== undefined) updateData.description = description?.trim() || null;
    // if (status !== undefined) updateData.status = status;
    // if (projectId !== undefined) updateData.projectId = projectId ? parseInt(projectId) : null;
    
    const updateData = {
      ...(title !== undefined && { title: title.trim() }),
      ...(description !== undefined && { description: description?.trim() || null }),
      ...(status !== undefined && { status }),
      ...(projectId !== undefined && { projectId: projectId ? parseInt(projectId) : null }),
    } // É mais rápido já deixar as coisas montadas 

    const updatedTask = await taskRepo.updateTask(taskId, userId, updateData);

    if (!updatedTask) {
      return res.status(404).json({
        httpStatus: "https://http.dog/404.json",
        success: false,
        data: null,
        message: 'Tarefa não encontrada'
      });
    }

    res.json({
      httpStatus: "https://http.dog/200.json",
      success: true,
      data: updatedTask,
      message: 'Tarefa atualizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    res.status(500).json({
      httpStatus: "https://http.dog/500.json",
      success: false,
      data: null,
      message: 'Erro ao atualizar tarefa'
    });
  }
});

/**
 * DELETE /api/tasks/:id - Deleta uma tarefa
 */
router.delete('/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const taskId = parseInt(req.params.id);

    if (isNaN(taskId)) {
      return res.status(400).json({
        httpStatus: "https://http.dog/400.json",
        success: false,
        data: null,
        message: 'ID inválido'
      });
    }

    const deleted = await taskRepo.deleteTask(taskId, userId);

    if (!deleted) {
      return res.status(404).json({
        httpStatus: "https://http.dog/404.json",
        success: false,
        data: null,
        message: 'Tarefa não encontrada'
      });
    }

    res.json({
      httpStatus: "https://http.dog/200.json",
      success: true,
      data: null,
      message: 'Tarefa deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar tarefa:', error);
    res.status(500).json({
      httpStatus: "https://http.dog/500.json",
      success: false,
      data: null,
      message: 'Erro ao deletar tarefa'
    });
  }
});

export default router;
