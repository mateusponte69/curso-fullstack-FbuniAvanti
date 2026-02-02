import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkeybackup';

/**
 * Middleware de autenticação JWT
 * Valida o token enviado no header Authorization
 * Adiciona userId ao req para uso nas rotas
 */

export function authMiddleware(req, res, next) {
  try {
    // Extrai token do header Authorization: Bearer + <token>
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        httpStatus: "https://http.dog/401.json",
        success: false,
        data: null,
        message: 'Token não fornecido'
      });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        httpStatus: "https://http.dog/401.json",
        success: false,
        data: null,
        message: 'Formato de token inválido. Use: Bearer + <token>'
      });
    }

    const token = parts[1];

    // Verifica e decodifica o token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Add userId e o userEmail no request pra usar nas rotas
    req.userId = decoded.userId;
    req.userEmail = decoded.email;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        httpStatus: "https://http.dog/401.json",
        success: false,
        data: null,
        message: 'Token expirado'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        httpStatus: "https://http.dog/401.json",
        success: false,
        data: null,
        message: 'Token inválido'
      });
    }

    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({
      httpStatus: "https://http.dog/500.json",
      success: false,
      data: null,
      message: 'Erro ao validar token'
    });
  }
}

/**
 * Gera um token JWT para o usuário
 * @param {Object} user - Objeto do usuário {id, email}
 * @returns {string} Token JWT
 */
export function generateToken(user) {
  const payload = {
    userId: user.id,
    email: user.email
  };

  // Token expira em 24 horas
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '24h'
  });
}
