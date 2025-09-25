FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files
COPY MyAlbumPro.sln ./
COPY src/MyAlbumPro.Domain/*.csproj src/MyAlbumPro.Domain/
COPY src/MyAlbumPro.Application/*.csproj src/MyAlbumPro.Application/
COPY src/MyAlbumPro.Infrastructure/*.csproj src/MyAlbumPro.Infrastructure/
COPY src/MyAlbumPro.Api/*.csproj src/MyAlbumPro.Api/

# Restore only the API project (will restore deps)
RUN dotnet restore "src/MyAlbumPro.Api/MyAlbumPro.Api.csproj"

# Copy the rest of the source
COPY . .

WORKDIR /src/src/MyAlbumPro.Api
RUN dotnet build "MyAlbumPro.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "MyAlbumPro.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Development
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "MyAlbumPro.Api.dll"]

