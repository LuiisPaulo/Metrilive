# Frontend do Metrilive

## Descrição
Aplicação frontend do Metrilive desenvolvida com React, TypeScript e Tailwind CSS.

## Tecnologias
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios

## Configuração

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente (se necessário):
O frontend está configurado para se comunicar com o backend em `http://localhost:8080` através do proxy do Vite.

## Executando a Aplicação

Para executar em modo de desenvolvimento:
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000` (ou outra porta se 3000 estiver ocupada).

## Estrutura do Projeto

- `src/pages/` - Páginas da aplicação (Home, Download, View, Login)
- `src/components/` - Componentes reutilizáveis (Layout)
- `src/services/` - Serviços de API (authService, dashboardService, commentService)
- `src/contexts/` - Contextos React (AuthContext)

## Funcionalidades

- **Autenticação**: Login e gerenciamento de sessão com JWT
- **Início**: Página de boas-vindas com FAQ
- **Baixar**: Visualização e download de métricas filtradas por data
- **Visualizar**: Feed de comentários das lives do Facebook
