# Backend - Sistema de Rastreamento Veicular

## Descrição
Backend completo desenvolvido em Node.js com Express, Prisma e PostgreSQL.

## Funcionalidades
- Autenticação (JWT, Recuperação de Senha)
- Gestão de Veículos (CRUD)
- Rastreamento em tempo real (Histórico, Cálculo de Distância)
- Segurança (Helmet, Rate Limit, Validação)
- Documentação API (Swagger)

## Configuração

1. Instale as dependências:
   ```bash
   cd backend
   npm install
   ```

2. Configure o banco de dados no arquivo `.env`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/vehicle_tracking"
   JWT_SECRET="sua_chave_secreta"
   ```

3. Execute as migrações do banco:
   ```bash
   npx prisma migrate dev
   ```

4. Inicie o servidor:
   ```bash
   npm start
   # ou para desenvolvimento
   npm run dev
   ```

5. Execute os testes:
   ```bash
   npm test
   ```

## Documentação
Acesse `/api-docs` para visualizar a documentação Swagger da API.
