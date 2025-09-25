# MyAlbumPro

Aplicação full-stack para criação e gerenciamento de álbuns fotográficos. O backend é construído com .NET 8, utiliza PostgreSQL e MinIO (compatível com S3) para armazenamento de assets, enquanto o frontend é uma SPA em React + Vite.

## Arquitetura
- **API (.NET 8 / Minimal APIs)**: autenticação via Google, emissão de tokens JWT, endpoints REST para projetos, layouts e assets.
- **Aplicação Frontend (React + Vite)**: interface para login, gerenciamento de projetos e consumo da API.
- **PostgreSQL**: banco relacional principal.
- **MinIO**: armazenamento de arquivos e miniaturas compatível com S3.
- **pgAdmin**: interface web opcional para gerenciar o PostgreSQL.

## Requisitos
- Docker e Docker Compose v2
- Porta 5173 livre para o frontend
- Porta 8080 livre para a API
- Portas 5432, 9000 e 9001 livres para PostgreSQL e MinIO
- Porta 5050 livre para pgAdmin

## Variáveis de Ambiente Principais
As variáveis abaixo estão definidas em `docker-compose.yml` e podem ser customizadas conforme necessário:

| Serviço | Variável | Descrição | Valor padrão |
| --- | --- | --- | --- |
| api | `ASPNETCORE_ENVIRONMENT` | Ambiente ASP.NET Core | `Development` |
| api | `ASPNETCORE_URLS` | Endereço de escuta da API | `http://+:8080` |
| web | `VITE_API_BASE` | Endpoint da API utilizado pelo frontend | `http://localhost:8080` |
| web | `VITE_GOOGLE_CLIENT_ID` | Client ID do OAuth Google usado no login (opcional) | `""` |
| pgadmin | `PGADMIN_DEFAULT_EMAIL` | Login no pgAdmin | `admin@local.test` |
| pgadmin | `PGADMIN_DEFAULT_PASSWORD` | Senha do pgAdmin | `admin` |
| postgres | `POSTGRES_*` | Configurações padrão do banco | `postgres`/`postgres` |
| minio | `MINIO_ROOT_*` | Credenciais do console MinIO | `minioadmin`/`minioadmin` |

> **Observação**: se você não configurar `VITE_GOOGLE_CLIENT_ID`, o botão de login continua funcionando com fallback para o endpoint `/auth/google/callback`, porém é necessário fornecer um token válido manualmente.

## Como Subir com Docker Compose
1. Construa e inicialize os serviços:
   ```bash
   docker compose up -d --build
   ```
2. Verifique os logs da API (útil para acompanhar migrações EF Core, seed de layouts e inicialização do MinIO):
   ```bash
   docker compose logs -f api
   ```

Os serviços principais ficarão disponíveis em:
- Frontend: http://localhost:5173
- API + Swagger: http://localhost:8080/swagger
- MinIO Console: http://localhost:9001 (usuário/senha: `minioadmin` / `minioadmin`)
- pgAdmin: http://localhost:5050 (e-mail/senha: `admin@local.test` / `admin`)

### Acessar o PostgreSQL via pgAdmin
1. Abra http://localhost:5050 e entre com as credenciais padrão (`admin@local.test` / `admin`).
2. Crie um novo servidor (`Add New Server`).
   - **Name**: qualquer identificador (ex.: `MyAlbumPro`).
   - **Connection → Host name/address**: `postgres`
   - **Port**: `5432`
   - **Username**: `postgres`
   - **Password**: `postgres`
3. Salve. O pgAdmin conectará no container `postgres` e você poderá navegar pelos bancos/tabelas diretamente no navegador.

### Estrutura de Dados e Seeds
- A API executa automaticamente as migrações do Entity Framework Core no startup quando em `Development`.
- O serviço `LayoutSeeder` insere layouts padrão se o banco estiver vazio.
- O serviço `StorageInitializer` garante a criação dos buckets de assets e thumbnails no MinIO.

## Execução Manual (Opcional)
Caso queira rodar apenas um dos serviços:
- Somente backend: `docker compose up -d postgres minio api`
- Somente frontend (assumindo API rodando localmente): `docker compose up -d web`

## Testes
- Backend: `dotnet test` dentro da pasta `backend`
- Frontend: `npm test` (vitest), após `npm install` na pasta `frontend/app`

## Próximos Passos
- Configurar um Client ID válido do Google OAuth e preencher `VITE_GOOGLE_CLIENT_ID` no `docker-compose.yml` ou via `.env`.
- Ajustar DNS/hostnames se for publicar os containers em infraestrutura externa.
