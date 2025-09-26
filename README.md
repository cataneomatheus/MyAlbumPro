# MyAlbumPro

MyAlbumPro e uma aplicacao full-stack para criacao e gerenciamento de albuns fotografico-profissionais. O backend utiliza .NET 8, PostgreSQL e MinIO (compatibilidade S3) para armazenar dados e imagens. O frontend e uma SPA moderna em React com Vite.

## Visao geral da arquitetura
- **API (.NET 8 / Minimal APIs)**: autenticacao com Google, emissao de JWT, endpoints REST para projetos, layouts e assets.
- **Aplicacao frontend (React + Vite + Tailwind)**: interface responsiva para login, gerenciamento de projetos e visualizacao dos albuns.
- **PostgreSQL**: banco relacional principal.
- **MinIO**: armazenamento de objetos (originais e miniaturas) compatível com AWS S3.
- **pgAdmin**: console opcional para inspecionar o PostgreSQL via navegador.

## Requisitos locais
- Docker Desktop (Compose v2)
- Portas livres: 8080 (API), 8081 (frontend), 5432 (PostgreSQL), 9000/9001 (MinIO) e 5050 (pgAdmin)

## Variaveis de ambiente principais
As variaveis sao definidas em `docker-compose.yml`. Ajuste conforme necessario:

| Servico   | Variavel                     | Descricao                                         | Valor padrao                                 |
|-----------|-----------------------------|---------------------------------------------------|-----------------------------------------------|
| api       | `ASPNETCORE_ENVIRONMENT`    | Ambiente ASP.NET Core                             | `Development`                                 |
| api       | `Jwt__SigningKey`           | Chave HMAC usada para assinar os JWTs             | `change-me-development-secret`                |
| api       | `Google__ClientId`          | Client ID OAuth do Google                         | `missing-google-client-id`                    |
| web       | `VITE_API_BASE`             | Endpoint da API consumido pelo frontend           | `http://localhost:8080`                       |
| web       | `VITE_GOOGLE_CLIENT_ID`     | Client ID do Google usado no build do frontend    | `missing-google-client-id`                    |
| minio     | `MINIO_ROOT_USER/PASSWORD`  | Credenciais do console MinIO                      | `minioadmin` / `minioadmin`                   |
| postgres  | `POSTGRES_USER/PASSWORD`    | Credenciais do banco                              | `postgres` / `postgres`                       |
| pgadmin   | `PGADMIN_DEFAULT_EMAIL` etc | Credenciais do pgAdmin                            | `admin@local.test` / `admin`                  |

> Importante: para login real com Google configure `Google__ClientId` (backend) e `VITE_GOOGLE_CLIENT_ID` (frontend) com um client id valido criado no Google Cloud Console.

## Subir toda a stack
```bash
docker compose up -d --build
```

Servicos disponiveis apos o build:
- Frontend: http://localhost:8081
- API + Swagger: http://localhost:8080/swagger
- MinIO Console: http://localhost:9001 (usuario/senha `minioadmin` / `minioadmin`)
- pgAdmin: http://localhost:5050 (usuario/senha `admin@local.test` / `admin`)

A API aplica migracoes do Entity Framework automaticamente quando roda em `Development`. Um seeder popula layouts padrao e o `StorageInitializer` garante os buckets `albums` e `thumbnails` no MinIO.

## Executar localmente sem Docker
### Backend
```bash
cd backend
 dotnet restore
 dotnet test
 dotnet run --project src/MyAlbumPro.Api
```

A API espera PostgreSQL (porta 5432) e MinIO (9000/9001) disponiveis.

### Frontend
```bash
cd frontend/app
npm install
npm run dev   # http://localhost:5173
```
Defina `VITE_API_BASE` e `VITE_GOOGLE_CLIENT_ID` em um arquivo `.env.local` se precisar sobrescrever valores durante o desenvolvimento.

## Testes
- Backend: `dotnet test`
- Frontend: `npm run test`

> Notas: Os testes de integracao completos do EditorPage e o snapshot do App estao marcados com `skip` ate que o novo fluxo de autenticacao seja regravado no harness de testes. O restante da suite permanece verdinho.

## Build de producao manual do frontend
```bash
cd frontend/app
npm install
npm run build
```
O resultado e gerado em `frontend/app/dist`. O Dockerfile do frontend ja realiza esse processo e publica os assets com nginx.

## Fluxo basico de uso
1. Suba a stack com `docker compose up -d --build`.
2. Acesse o frontend em http://localhost:8081.
3. Clique em "Entrar com Google" (exige client id valido para fluxo real; sem configuracao voce pode enviar manualmente um token JWT de teste para `/auth/google/callback`).
4. Crie projetos, explore layouts, faça upload das imagens para o MinIO usando os endpoints `/uploads/presign` + `/assets`.

## Estrutura de pastas
```
MyAlbumPro/
|-- backend/               # Solucao .NET 8
|   |-- src/
|   |   |-- MyAlbumPro.Api
|   |   |-- MyAlbumPro.Application
|   |   |-- MyAlbumPro.Domain
|   |   |-- MyAlbumPro.Infrastructure
|   |-- tests/
|-- frontend/
|   |-- app/               # SPA React + Vite
|-- ops/                   # (placeholder para scripts de deploy)
|-- docker-compose.yml
```

## Pendencias / melhorias sugeridas
- Regravar os testes de integracao do editor apos estabilizar o fluxo completo (upload + presign) com mocks.
- Ajustar as mensagens de erro do login para lidar com diferentes respostas do Google.
- Integrar pipeline de CI/CD (build + testes + lint) e enviar imagem para registry.

Bom uso do MyAlbumPro! Abra issues/sugestoes caso precise de novos recursos.
