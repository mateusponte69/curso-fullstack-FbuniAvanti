import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Busca usuário por email
 * @param {string} email - Email do usuário
 * @returns {Promise<Object|null>} Usuário ou null
 */

export async function findUserByEmail(email) {
  return await prisma.user.findUnique({
    where: { email }
  });
}

/**
 * Cria um novo usuário
 * @param {Object} userData - Dados do usuário {email, password, name}
 * @returns {Promise<Object>} Usuário criado
 */
export async function createUser(userData) {
  // Hash da senha com bcrypt com 11 salt rounds (2048 iterações)
  const hashedPassword = await bcrypt.hash(userData.password, 11);

  return await prisma.user.create({
    data: {
      ...userData,
      password: hashedPassword
    }
  });
}

/**
 * Valida login com bcrypt
 * @param {string} email - Email
 * @param {string} password - Senha
 * @returns {Promise<Object|null>} Usuário se válido, null caso contrário
 */
export async function validateLogin(email, password) {
  const user = await findUserByEmail(email);
  
  if (!user) {
    return null;
  }

  // Compara senha com hash usando bcrypt
  const isPasswordValid = await bcrypt.compare(password, user.password);
  
  if (isPasswordValid) {
    return user;
  }
  
  return null;
}
