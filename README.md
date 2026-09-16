<div align="center">
  <img src="Frontend/public/assets/LogoProdutosduNego2.png" alt="Logo Produtos Du Nego" width="100" />
  <h1>Produtos Du Nego</h1>
  <p>Sistema de e-commerce e gestão para um comércio local de produtos artesanais.</p>
  <p>
    <img src="https://img.shields.io/badge/Java-21-ED8B00?style=flat&logo=openjdk&logoColor=white" alt="Java 21"/>
    <img src="https://img.shields.io/badge/Spring_Boot-3.3.1-6DB33F?style=flat&logo=spring-boot&logoColor=white" alt="Spring Boot"/>
    <img src="https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js&logoColor=white" alt="Next.js"/>
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript"/>
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat&logo=tailwindcss&logoColor=white" alt="Tailwind"/>
  </p>
</div>

---

## 📋 Sobre o Projeto

**Produtos Du Nego** é um sistema web fullstack desenvolvido como **Trabalho de Conclusão de Curso (TCC)** do curso técnico em Informática, realizado em dupla.

O sistema atende a duas perspectivas distintas:

- 🛒 **Loja (Cliente):** vitrine de produtos, carrinho de compras, checkout, histórico de pedidos e gerenciamento de endereços.
- 🔧 **Painel Administrativo:** gestão completa de produtos, categorias, fornecedores, compras, vendas, formas de pagamento, usuários e geração de relatórios em PDF.

---

## 🗂️ Estrutura do Repositório

```
TCC-ProdutosDuNego/
├── Backend/     # API REST — Spring Boot (Java 21)
└── Frontend/    # Interface Web — Next.js 15 (TypeScript)
```

---

## 🛠️ Stack Tecnológica

### Backend

| Tecnologia                      | Versão | Uso                                                        |
| ------------------------------- | ------ | ---------------------------------------------------------- |
| **Java**                        | 21     | Linguagem principal                                        |
| **Spring Boot**                 | 3.3.1  | Framework da aplicação                                     |
| **Spring Web**                  | —      | Criação de APIs RESTful                                    |
| **Spring Data JPA**             | —      | Mapeamento e persistência de dados                         |
| **Spring Security**             | —      | Camada de autenticação e controle de acesso                |
| **Auth0 Java JWT**              | 4.4.0  | Geração e validação de tokens de autenticação              |
| **H2 Database**                 | —      | Banco de dados em memória para ambiente de desenvolvimento |
| **SQL Server (MSSQL)**          | —      | Banco de dados relacional para ambiente de produção        |
| **Lombok**                      | —      | Otimização de código com redução de métodos utilitários    |
| **OpenPDF**                     | 1.3.30 | Geração de relatórios em PDF                               |
| **SpringDoc OpenAPI (Swagger)** | 2.5.0  | Documentação interativa da API                             |
| **Bean Validation**             | —      | Validação declarativa de requisições                       |

### Frontend

| Tecnologia            | Versão | Uso                                                               |
| --------------------- | ------ | ----------------------------------------------------------------- |
| **Next.js**           | 15.3.3 | Framework React com App Router                                    |
| **React**             | 19     | Biblioteca para interfaces de usuário                             |
| **TypeScript**        | 5      | Tipagem estática                                                  |
| **Tailwind CSS**      | 4      | Estilização utilitária                                            |
| **Zod**               | 3      | Validação de esquemas e dados de formulários                      |
| **jwt-decode**        | 4      | Leitura de informações do token JWT no cliente                    |
| **jsPDF + AutoTable** | 3 / 5  | Exportação e impressão de relatórios em PDF                       |
| **react-icons**       | 5      | Biblioteca de ícones                                              |
| **react-imask**       | 7      | Formatação e máscaras para campos de entrada (CPF, telefone, CEP) |
| **Sonner**            | 2      | Notificações e alertas visuais                                    |
| **use-debounce**      | 10     | Controle de frequência em buscas e digitação                      |

---

## ✨ Funcionalidades

### 🛒 Área da Loja (Cliente)

- Vitrine de produtos organizados por categoria
- Carrinho de compras integrado
- Checkout com seleção de endereço de entrega e forma de pagamento
- Cadastro e login de clientes
- Gerenciamento de múltiplos endereços de entrega
- Histórico de pedidos com acompanhamento de status
- Painel de gerenciamento de dados pessoais

### 🔧 Painel Administrativo

- **Visão Geral:** indicadores e dados operacionais
- **Produtos:** cadastro, edição, ajuste de estoque e controle de status
- **Categorias e Medidas:** organização e padronização dos itens
- **Fornecedores:** cadastro de parceiros comerciais
- **Compras:** registro de entradas e reposição de estoque
- **Vendas:** controle do ciclo dos pedidos (separação, pagamento e entrega)
- **Formas de Pagamento:** configuração das opções disponíveis (PIX, Cartão, Dinheiro, etc.)
- **Usuários:** consulta e controle de clientes cadastrados
- **Relatórios:** emissão de relatórios em formato PDF

### 🔒 Segurança

- Autenticação sem estado (_stateless_) via token **JWT**
- Criptografia de senhas com **BCrypt**
- Controle de permissões por perfil (`ROLE_ADMIN` e `ROLE_USER`)
- Configuração de CORS para comunicação entre serviços

---

## 🚀 Como Rodar o Projeto Localmente

### Pré-requisitos

Para executar a aplicação em seu ambiente, é necessário ter instalado:

- [**Java 21**](https://adoptium.net/) (JDK)
- [**Maven**](https://maven.apache.org/) (ou utilizar o Maven Wrapper `mvnw` já presente na pasta do projeto)
- [**Node.js**](https://nodejs.org/) (versão 18 ou superior)
- **npm** (incluso com a instalação do Node.js)

> 💡 Em ambiente de desenvolvimento, não é necessário instalar nenhum banco de dados externo. O backend utiliza o banco em memória **H2** de forma automática.

---

### 1️⃣ Inicializando o Backend (Spring Boot)

1. Abra um terminal e acesse a pasta do backend:

```bash
cd Backend
```

2. Execute o projeto com o perfil de desenvolvimento:

**No Windows (PowerShell / Prompt de Comando):**

```powershell
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=desenvolvimento"
```

**No Linux ou macOS:**

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=desenvolvimento
```

_(Caso prefira usar o Maven já instalado globalmente: `mvn spring-boot:run -Dspring-boot.run.profiles=desenvolvimento`)_

A API iniciará no endereço: **`http://localhost:8080`**

- **Documentação Swagger:** `http://localhost:8080/swagger-ui.html`
- **Console do banco H2:** `http://localhost:8080/h2-console` _(caso habilitado no perfil)_

> 🌱 O perfil de desenvolvimento já inclui uma carga inicial de dados via `data.sql` para testes:
>
> | Usuário      | Nível de Acesso | Senha Padrão |
> | ------------ | --------------- | ------------ |
> | `admin`      | Administrador   | `senha123`   |
> | `ana.silva`  | Cliente         | `senha123`   |
> | `joao.costa` | Cliente         | `senha123`   |

---

### 2️⃣ Inicializando o Frontend (Next.js)

1. Em **outro terminal**, acesse a pasta do frontend:

```bash
cd Frontend
```

2. Instale as dependências necessárias:

```bash
npm install
```

3. Verifique o arquivo de configuração de variáveis de ambiente:

O arquivo `.env.local` na raiz de `Frontend` deve conter as seguintes configurações:

```env
# Endereço base da API REST
NEXT_PUBLIC_BASE_URL=http://localhost:8080/api

# Identificador da chave de autenticação no armazenamento do navegador
NEXT_PUBLIC_AUTH_TOKEN_KEY=produtosDuNego:auth-token
```

4. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

A interface web estará disponível em: **`http://localhost:3000`**

---

### ✅ Links de Acesso Rápido

| Interface / Recurso               | Endereço                                |
| --------------------------------- | --------------------------------------- |
| Loja Virtual (Cliente)            | `http://localhost:3000`                 |
| Painel Administrativo             | `http://localhost:3000/dashboard`       |
| Endereço Base da API              | `http://localhost:8080/api`             |
| Documentação Interativa (Swagger) | `http://localhost:8080/swagger-ui.html` |

---

## 📁 Principais Rotas da API

| Método | Rota                | Permissão     | Descrição                              |
| ------ | ------------------- | ------------- | -------------------------------------- |
| `POST` | `/login`            | Pública       | Realiza login e gera o token de acesso |
| `POST` | `/usuario/salvar`   | Pública       | Cadastra um novo cliente               |
| `GET`  | `/produto`          | Pública       | Lista os produtos disponíveis          |
| `GET`  | `/categoria`        | Pública       | Lista as categorias existentes         |
| `GET`  | `/venda/obterTodas` | Administrador | Exibe todas as vendas registradas      |
| `POST` | `/venda/salvar`     | Autenticado   | Registra um novo pedido                |
| `GET`  | `/relatorios/**`    | Administrador | Exporta relatórios do sistema          |

---

## 👨‍💻 Autores

Projeto idealizado e implementado em dupla como Trabalho de Conclusão de Curso (TCC) do curso técnico em Informática.
