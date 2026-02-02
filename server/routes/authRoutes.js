import express from 'express';
import * as userRepo from '../repository/userRepository.js';
import { generateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * POST /api/login - Validação de login
 * Body: { email, password }
 * Retorna: { token (mock), user }
 */

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validação básica
    if (!email || !password) {
      return res.status(400).json({
        httpStatus: "https://http.dog/400.json",
        success: false,
        data: null,
        message: 'Email e senha são obrigatórios'
      });
    }

    // Validação com bcrypt
    const user = await userRepo.validateLogin(email, password);

    if (!user) {
      return res.status(401).json({
        httpStatus: "https://http.dog/401.json",
        success: false,
        data: null,
        message: 'Email ou senha inválidos'
      });
    }

    // Gera um token JWT
    const token = generateToken(user);

    /* 
    "Legal que, dependendo de como você usa,
    esses três pontos podem tanto copiar quanto
    remover coisas de um objeto."
    - Paulo Gabriel
    */
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      httpStatus: "https://http.dog/200.json",
      success: true,
      data: {
        token,
        user: userWithoutPassword
      },
      message: 'Login realizado com sucesso'
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      httpStatus: "https://http.dog/500.json",
      success: false,
      data: null,
      message: 'Erro ao realizar login'
    });
  }
});

/**
 * POST /api/register - Registro de novo usuário
 * Body: { email, password, name }
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validação básica
    if (!email || !password || !name) {
      return res.status(400).json({
        httpStatus: "https://http.dog/400.json",
        success: false,
        data: null,
        message: 'Email, senha e nome são obrigatórios'
      });
    }

    // Verifica se usuário já existe
    const existingUser = await userRepo.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        httpStatus: "https://http.dog/409.json",
        success: false,
        data: null,
        message: 'Email já cadastrado'
      });
    }

    // Cria usuário com senha hash usando bcrypt
    const newUser = await userRepo.createUser({
      email: email.trim(),
      password,
      name: name.trim()
    });

    // Remove senha da resposta
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      httpStatus: "https://http.dog/201.json",
      success: true,
      data: userWithoutPassword,
      message: 'Usuário criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({
      httpStatus: "https://http.dog/500.json",
      success: false,
      data: null,
      message: 'Erro ao criar usuário'
    });
  }
});

export default router;
