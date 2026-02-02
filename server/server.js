import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import taskRoutes from './routes/taskRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import authRoutes from './routes/authRoutes.js';

// Para usar __dirname em ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega variáveis de ambiente
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Inicia o Express
const app = express();

// ==================== MIDDLEWARES ====================

/* 
"Não sei o que faz exatamente, 
mas vi que esse Helmet adiciona várias camadas de segurança" 
- Paulo Gabriel
*/

app.use(helmet());

// CORS configurado para o frontend (dev e prod)
app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:5173'],
  credentials: true
}));

// Parser de JSON
app.use(express.json({ limit: '10kb' })); // Nada de JSON de 5GB por aqui!

// Logger simples de requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ==================== ROTAS ====================

// Health check
app.get('/health', (req, res) => {
  res.json({
    httpStatus: "https://http.dog/200.json",
    success: true,
    data: { status: 'OK', timestamp: new Date().toISOString() },
    message: 'Server is running'
  });
});

// API Routes
app.use('/api', authRoutes);
app.use('/api', taskRoutes);
app.use('/api', projectRoutes);

// ==================== SERVIR FRONTEND EM PRODUÇÃO ====================

// Serve arquivos estáticos do build do React (apenas em produção)
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  const staticPath = path.join(__dirname, '../client/dist');
  console.log(`📦 Servindo frontend de: ${staticPath}`);
  
  app.use(express.static(staticPath));
  
  // Fallback para SPA - todas as rotas não-API vão pro index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
} else {
  console.log('⚠️  Modo desenvolvimento: frontend não está sendo servido pelo Express');
  console.log('   Use npm run dev para o frontend ou adicione NODE_ENV=production');
  
  // Em dev, retorna 404 para rotas não encontradas
  app.use((req, res) => {
    res.status(404).json({
      httpStatus: "https://http.dog/404.json",
      success: false,
      data: null,
      message: `Rota ${req.method} ${req.path} não encontrada`
    });
  });
}

// ==================== ERROR HANDLER ====================

// Handler global de erros
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  
  res.status(err.status || 500).json({
    httpStatus: `https://http.dog/${err.status || 500}.json`,
    success: false,
    data: null,
    message: err.message || 'Erro interno do servidor'
  });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║   🚀 TaskFlow Server Online          ║
  ║   📡 Port: ${PORT}                      ║
  ║   🌐 URL: http://localhost:${PORT}      ║
  ║   ✨ Environment: Development        ║
  ╚══════════════════════════════════════╝
  `);
  console.log('Available routes:');
  console.log('  GET    /health');
  console.log('  POST   /api/login');
  console.log('  POST   /api/register');
  console.log('  GET    /api/tasks');
  console.log('  POST   /api/tasks');
  console.log('  PUT    /api/tasks/:id');
  console.log('  DELETE /api/tasks/:id');
  console.log('  GET    /api/projects');
  console.log('  POST   /api/projects');
  console.log('  PUT    /api/projects/:id');
  console.log('  DELETE /api/projects/:id');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido, encerrando servidor...');
  process.exit(0);
});

export default app;
