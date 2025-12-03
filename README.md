# Metrilive

Sistema para gerenciamento e visualização de métricas de lives do Facebook.

## 🚀 Como Rodar o Projeto

### Pré-requisitos

- Java 17 ou superior
- Node.js 18 ou superior
- Docker e Docker Compose (para o banco de dados PostgreSQL)
- Maven (ou use o wrapper `mvnw` incluído)

### Passo 1: Iniciar o Banco de Dados

O projeto usa PostgreSQL via Docker Compose. Execute:

```bash
docker-compose up -d
```

Isso irá iniciar o PostgreSQL na porta 5432 com:

- Database: `metrilivedb`
- Usuário: `metrilive`
- Senha: `password`

### Passo 2: Rodar o Backend

1. Entre na pasta do backend:

```bash
cd backend
```

2. Execute o backend Spring Boot:

```bash
# Windows
.\mvnw.cmd spring-boot:run

# Linux/Mac
./mvnw spring-boot:run
```

Ou se tiver Maven instalado:

```bash
mvn spring-boot:run
```

O backend estará disponível em `http://localhost:8080`

### Passo 3: Rodar o Frontend

1. Abra um novo terminal e entre na pasta do frontend:

```bash
cd frontend
```

2. Instale as dependências (primeira vez apenas):

```bash
npm install
```

3. Execute o frontend:

```bash
npm run dev
```

O frontend estará disponível em `http://localhost:3000` (ou outra porta se 3000 estiver ocupada)

### Passo 4: Acessar a Aplicação

1. Abra o navegador em `http://localhost:3000`
2. Faça login com suas credenciais (você precisará criar um usuário primeiro via API ou banco de dados)

## 📝 Criando o Primeiro Usuário

Para criar um usuário, você pode:

1. **Via API** (com ferramenta como Postman ou curl):

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "usuario",
    "email": "usuario@example.com",
    "password": "senha123"
  }'
```

2. **Ou usar o endpoint de autenticação** se já tiver um usuário criado

## 🛠️ Estrutura do Projeto

```
metrilive/
├── backend/          # Aplicação Spring Boot
│   ├── src/
│   └── pom.xml
├── frontend/         # Aplicação React + TypeScript
│   ├── src/
│   └── package.json
└── docker-compose.yml # Configuração do PostgreSQL
```

## 🔧 Tecnologias

### Backend

- Spring Boot 3.3.1
- Spring Security (JWT)
- PostgreSQL
- JPA/Hibernate

### Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios

## 📚 Endpoints da API

### Autenticação

- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/authenticate` - Fazer login
- `POST /api/auth/logout` - Fazer logout

### Dashboard

- `GET /api/dashboard/metrics` - Obter métricas (requer autenticação)
- `GET /api/dashboard/report` - Download do relatório CSV (requer autenticação)

### Usuários

- `GET /api/users/me` - Obter usuário atual (requer autenticação)

### Facebook

- `GET /api/facebook/pages` - Listar páginas do Facebook
- `GET /api/facebook/pages/{pageId}/lives` - Listar lives de uma página
- `GET /api/facebook/lives/{liveVideoId}/comments` - Obter comentários de uma live

## 🐛 Troubleshooting

### Backend não inicia

- Verifique se o PostgreSQL está rodando: `docker ps`
- Verifique se a porta 8080 está livre
- Verifique os logs do backend

### Frontend não conecta ao backend

- Verifique se o backend está rodando em `http://localhost:8080`
- Verifique o console do navegador para erros de CORS
- Certifique-se de que o proxy no `vite.config.ts` está configurado corretamente

### Erro de autenticação

- Verifique se o token JWT está sendo enviado no header `Authorization`
- Verifique se o token não expirou (expira em 24 horas por padrão)

## 📄 Licença

Este projeto foi desenvolvido para a Oficina de Integração da UTFPR.
