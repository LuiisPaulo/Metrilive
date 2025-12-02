# Backend do Metrilive

## Descrição
Este é o serviço de backend para a aplicação Metrilive, desenvolvido com Spring Boot. Ele fornece APIs RESTful para autenticação de usuários, gerenciamento de perfis (roles) e outras funcionalidades principais.

## Tecnologias Utilizadas
*   **Java:** 17
*   **Framework:** Spring Boot 3.3.1
*   **Ferramenta de Build:** Apache Maven
*   **Banco de Dados:** H2 Database (para desenvolvimento/testes)
*   **Segurança:** Spring Security, JWT
*   **Outras Bibliotecas:** Lombok, RestFB (para integração com a API do Facebook)

## Configuração

### Pré-requisitos
*   Java Development Kit (JDK) 17 instalado.
*   Maven (ou utilize o Maven Wrapper incluído).

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
    Este comando irá compilar o código, executar testes e empacotar a aplicação em um arquivo JAR.

## Executando a Aplicação
Após uma construção bem-sucedida, você pode executar a aplicação Spring Boot usando o arquivo JAR gerado:

```bash
java -jar target/metrilive-0.0.1-SNAPSHOT.jar
```

A aplicação geralmente será iniciada em `http://localhost:8080` (ou em uma porta configurada em `application.properties`).

## Documentação da API
(A ser adicionada)

## Perfis (Roles)
A aplicação atualmente suporta os seguintes perfis de usuário:
*   `ADMIN` (Administrador)
*   `GESTOR_DE_LIVES` (Gestor de Mídia)
*   `EQUIPE_DE_PRODUCAO` (Equipe de Produção)
Durante o registro de usuário, o perfil pode ser especificado na requisição.