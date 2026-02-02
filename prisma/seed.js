import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Script de seed para popular o banco com dados iniciais
 * Versão idempotente: só cria se não existir (seguro para produção)
 */
async function seed() {
  console.log('🌱 Iniciando seed do banco de dados...');

  try {
    // Verifica se usuário de teste já existe
    let testUser = await prisma.user.findUnique({
      where: { email: 'teste@taskflow.com' }
    });

    if (testUser) {
      console.log('ℹ️  Usuário de teste já existe, pulando criação...');
    } else {
      // Cria usuário de teste com senha hash
      const hashedPassword = await bcrypt.hash('123456', 10);
      
      testUser = await prisma.user.create({
        data: {
          email: 'teste@taskflow.com',
          password: hashedPassword,
          name: 'Usuário Teste'
        }
      });

      console.log('✅ Usuário de teste criado:', testUser.email);
    }

    // Verifica se projetos já existem
    const existingProjects = await prisma.project.count({
      where: { userId: testUser.id }
    });

    if (existingProjects > 0) {
      console.log(`ℹ️  ${existingProjects} projeto(s) já existem, pulando criação...`);
    } else {
      // Cria projeto de exemplo
      const project1 = await prisma.project.create({
        data: {
          name: 'Projeto Pessoal',
          description: 'Tarefas pessoais e estudos',
          userId: testUser.id
        }
      });

      const project2 = await prisma.project.create({
        data: {
          name: 'Trabalho',
          description: 'Tarefas profissionais',
          userId: testUser.id
        }
        });

      console.log('✅ Projetos criados:', project1.name, ',', project2.name);

      // Cria tarefas de exemplo
      const tasks = await prisma.task.createMany({
        data: [
          {
            title: 'Estudar React',
            description: 'Revisar hooks e context API',
            status: 'pending',
            projectId: project1.id,
            userId: testUser.id
          },
          {
            title: 'Implementar backend',
            description: 'Criar rotas REST com Express',
            status: 'completed',
            projectId: project1.id,
            userId: testUser.id
          },
          {
            title: 'Reunião com cliente',
            description: 'Apresentar protótipo do projeto',
            status: 'pending',
            projectId: project2.id,
            userId: testUser.id
          },
          {
            title: 'Code review',
            description: 'Revisar PRs da equipe',
            status: 'pending',
            projectId: project2.id,
            userId: testUser.id
          },
          {
            title: 'Documentar API',
            description: 'Escrever README com endpoints',
            status: 'completed',
            projectId: project2.id,
            userId: testUser.id
          }
        ]
      });

      console.log(`✅ ${tasks.count} tarefas criadas`);
    }

    console.log('\n🎉 Seed concluído com sucesso!');
    console.log('📧 Login de teste: teste@taskflow.com');
    console.log('🔑 Senha: 123456\n');

  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executa seed
seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
