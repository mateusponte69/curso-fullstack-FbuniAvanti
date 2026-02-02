#!/usr/bin/env node

/**
 * Script para testar conexão com o banco de dados PostgreSQL.
 * Útil para validar DATABASE_URL antes do deploy.
 * 
 * Uso:
 *   node test-db-connection.js
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  console.log('🔍 Testando conexão com o banco de dados...\n');
  
  try {
    // Testa conexão básica
    await prisma.$connect();
    console.log('✅ Conexão estabelecida com sucesso!\n');
    
    // Verifica tabelas existentes
    const users = await prisma.user.count();
    const projects = await prisma.project.count();
    const tasks = await prisma.task.count();
    
    console.log('📊 Estatísticas do banco:');
    console.log(`   - Usuários: ${users}`);
    console.log(`   - Projetos: ${projects}`);
    console.log(`   - Tarefas: ${tasks}\n`);
    
    // Info do database
    const dbUrl = process.env.DATABASE_URL || 'Não configurado';
    const dbType = dbUrl.startsWith('postgresql') ? 'PostgreSQL' : 
                   dbUrl.startsWith('file:') ? 'SQLite' : 'Desconhecido';
    
    console.log('🗄️  Configuração:');
    console.log(`   - Tipo: ${dbType}`);
    console.log(`   - SSL: ${dbUrl.includes('sslmode=require') ? 'Sim ✓' : 'Não ✗'}`);
    
    if (dbType === 'PostgreSQL' && !dbUrl.includes('sslmode=require')) {
      console.log('\n⚠️  AVISO: Para produção no Render, adicione ?sslmode=require na DATABASE_URL\n');
    }
    
    console.log('\n✨ Tudo pronto para o deploy!');
    
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco:\n');
    console.error(`   Mensagem: ${error.message}\n`);
    
    if (error.message.includes('certificate')) {
      console.error('💡 Solução: Adicione ?sslmode=require no final da DATABASE_URL');
    } else if (error.message.includes('authentication')) {
      console.error('💡 Solução: Verifique usuário e senha na DATABASE_URL');
    } else if (error.message.includes('does not exist')) {
      console.error('💡 Solução: Rode npx prisma migrate deploy ou npx prisma db push');
    } else {
      console.error('💡 Solução: Verifique se a DATABASE_URL está correta no .env');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
