# Backend do Metrilive

## Descrição
Este é o serviço de backend para a aplicação Metrilive, desenvolvido com Spring Boot. Ele fornece APIs RESTful para autenticação de usuários, gerenciamento de perfis, integração com a API do Facebook para coleta e análise de métricas de vídeos/lives, funcionalidades de dashboard e relatórios.

## Tecnologias Utilizadas
*   **Java:** 17
*   **Framework:** Spring Boot 3.3.1
*   **Ferramenta de Build:** Apache Maven
*   **Banco de Dados:** PostgreSQL (via Docker)
*   **Segurança:** Spring Security, JWT (JSON Web Tokens) com invalidação de tokens
*   **Outras Bibliotecas:** Lombok, RestFB (para integração com a API do Facebook)

## Funcionalidades Principais
*   **Autenticação e Autorização:** Registro, login, logout e controle de acesso baseado em JWT e roles.
*   **Gerenciamento de Usuários:** Endpoints CRUD para administrar usuários.
*   **Integração com Facebook:**
    *   Coleta de Páginas, Vídeos ao Vivo e Comentários de usuários autorizados.
    *   Processamento de links diretos de vídeos/lives do Facebook para coletar dados.
    *   Persistência dos dados coletados (Páginas, Vídeos, Comentários) no banco de dados.
    *   Histórico de Métricas de Vídeos: Armazenamento de snapshots de visualizações, comentários e compartilhamentos ao longo do tempo.
*   **Dashboard de Métricas:** Endpoint para agregação de métricas (visualizações, comentários, compartilhamentos) por data e tipo de postagem.
*   **Geração de Relatórios:** Exportação de métricas agregadas em formato CSV.

## Configuração

### Pré-requisitos
*   Java Development Kit (JDK) 17 instalado.
*   Maven (ou utilize o Maven Wrapper incluído).
*   Docker e Docker Compose instalados e em execução.

### Construindo o Projeto
1.  **Clone o repositório:**
    ```bash
    git clone <url_do_repositorio>
    cd metrilive/backend
    ```
2.  **Certifique-se de que o Java 17 esteja ativo:**
    Verifique sua versão do Java:
    ```bash
    java -version
    ```
    Se não estiver usando Java 17, por favor, mude para ele (por exemplo, usando `sdkman` ou configurando `JAVA_HOME`).
3.  **Construa com o Maven Wrapper:**
    ```bash
    ./mvnw clean install
    ```
    Este comando irá compilar o código, executar testes (se houver) e empacotar a aplicação em um arquivo JAR.

## Executando a Aplicação

### 1. Iniciar o Banco de Dados PostgreSQL (com Docker Compose)
Navegue até o diretório raiz do projeto (`metrilive/`) e inicie o container do PostgreSQL:
```bash
docker compose up -d
```
Verifique se o container `metrilive-postgres` está rodando:
```bash
docker ps
```

### 2. Executar o Backend Spring Boot
Após uma construção bem-sucedida e com o banco de dados rodando, navegue até o diretório do backend (`metrilive/backend`) e execute a aplicação Spring Boot usando o arquivo JAR gerado:

```bash
java -jar target/metrilive-0.0.1-SNAPSHOT.jar
```
A aplicação geralmente será iniciada em `http://localhost:8080` (ou em uma porta configurada em `application.properties`).

## Documentação da API (Guia de Integração)

Todos os endpoints protegidos requerem o cabeçalho:
`Authorization: Bearer <seu_token_jwt>`

### 1. Autenticação (`/api/auth`)

#### Registrar Usuário
*   **POST** `/api/auth/register`
*   **Body:**
    ```json
    {
      "username": "usuario_teste",
      "email": "teste@email.com",
      "password": "senha_segura",
      "role": "ADMIN" // Opções: ADMIN, GESTOR_DE_LIVES, EQUIPE_DE_PRODUCAO
    }
    ```
*   **Response:**
    ```json
    {
      "access_token": "eyJhbGciOiJIUzI1Ni..."
    }
    ```

#### Login
*   **POST** `/api/auth/authenticate`
*   **Body:**
    ```json
    {
      "username": "usuario_teste",
      "password": "senha_segura"
    }
    ```
*   **Response:** `{"access_token": "..."}`

#### Logout
*   **POST** `/api/auth/logout`
*   **Header:** `Authorization: Bearer <token>`
*   **Descrição:** Invalida o token atual na blacklist (memória).

---

### 2. Usuários (`/api/users`)

#### Dados do Usuário Atual
*   **GET** `/api/users/me`
*   **Response:** Objeto completo do usuário (id, username, email, role, etc).

#### Listar Todos (Apenas Admin)
*   **GET** `/api/users`
*   **Response:** Lista `[]` de usuários.

#### Atualizar Usuário (Admin ou Próprio)
*   **PUT** `/api/users/{id}`
*   **Body** (Campos opcionais):
    ```json
    {
      "email": "novo_email@teste.com",
      "password": "nova_senha"
    }
    ```

#### Deletar Usuário (Apenas Admin)
*   **DELETE** `/api/users/{id}`

---

### 3. Integração Facebook (`/api/facebook`)

#### Vincular Token do Facebook
*   **POST** `/api/facebook/token`
*   **Body:**
    ```json
    {
      "accessToken": "EAAb..." // Token obtido via Login do Facebook no front
    }
    ```

#### Importar Dados via Link (Vídeo/Live)
*   **POST** `/api/facebook/process-url`
*   **Descrição:** Extrai dados, salva página, vídeo, comentários e métricas no banco.
*   **Body:**
    ```json
    {
      "url": "https://www.facebook.com/pagina/videos/123456789"
    }
    ```

#### Listar Páginas Vinculadas
*   **GET** `/api/facebook/pages`
*   **Response:** Lista de páginas salvas/vinculadas.

#### Listar Lives de uma Página
*   **GET** `/api/facebook/pages/{pageId}/lives`

#### Listar Comentários de uma Live
*   **GET** `/api/facebook/lives/{liveVideoId}/comments`

---

### 4. Dashboard e Relatórios (`/api/dashboard`)

#### Métricas Agregadas
*   **GET** `/api/dashboard/metrics`
*   **Response:** Lista de métricas diárias.
    ```json
    [
      {
        "date": "2023-10-27",
        "type": "VIDEO",
        "totalViews": 1500,
        "totalComments": 300,
        "totalShares": 0
      }
    ]
    ```

#### Download Relatório (CSV)
*   **GET** `/api/dashboard/report`
*   **Response:** Arquivo `.csv` (Content-Disposition: attachment).
    *   Formato: `Data;Tipo;Visualizações;Comentários;Compartilhamentos`

## Perfis (Roles)
A aplicação atualmente suporta os seguintes perfis de usuário:
*   `ADMIN` (Administrador)
*   `GESTOR_DE_LIVES` (Gestor de Mídia)
*   `EQUIPE_DE_PRODUCAO` (Equipe de Produção)
Durante o registro de usuário, o perfil pode ser especificado na requisição.

## Considerações de Segurança (Logout)
A funcionalidade de logout utiliza uma lista de tokens invalidados (invalidatedTokens) em **memória**. Isso significa que, em caso de reinício do servidor, os tokens previamente invalidados voltarão a ser válidos até sua expiração natural. Para ambientes de produção, recomenda-se a persistência dessa lista (por exemplo, em um cache como o Redis).