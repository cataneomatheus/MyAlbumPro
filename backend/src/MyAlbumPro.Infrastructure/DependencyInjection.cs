using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Minio;
using MyAlbumPro.Application.Abstractions.Auth;
using MyAlbumPro.Application.Abstractions.Observability;
using MyAlbumPro.Application.Abstractions.Persistence;
using MyAlbumPro.Application.Abstractions.Storage;
using MyAlbumPro.Infrastructure.Auth;
using MyAlbumPro.Infrastructure.Configurations;
using MyAlbumPro.Infrastructure.Persistence;
using MyAlbumPro.Infrastructure.Services;
using MyAlbumPro.Infrastructure.Storage;

namespace MyAlbumPro.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<DatabaseOptions>(configuration.GetSection(DatabaseOptions.SectionName));
        services.Configure<StorageOptions>(configuration.GetSection(StorageOptions.SectionName));
        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));
        services.Configure<GoogleOptions>(configuration.GetSection(GoogleOptions.SectionName));

        services.AddDbContext<AppDbContext>((sp, options) =>
        {
            var dbOptions = sp.GetRequiredService<IOptions<DatabaseOptions>>().Value;
            options.UseNpgsql(dbOptions.ConnectionString);
        });

        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IProjectRepository, ProjectRepository>();
        services.AddScoped<IAssetRepository, AssetRepository>();
        services.AddScoped<ILayoutRepository, LayoutRepository>();

        services.AddSingleton<ITokenService, JwtTokenService>();
        services.AddSingleton<IGoogleAuthService, GoogleAuthService>();

        services.AddSingleton<IMinioClient>(sp =>
        {
            var options = sp.GetRequiredService<IOptions<StorageOptions>>().Value;
            return new MinioClient()
                .WithEndpoint(options.Endpoint)
                .WithCredentials(options.AccessKey, options.SecretKey)
                .WithSSL(options.UseSsl)
                .Build();
        });

        services.AddSingleton<IStorageService, MinioStorageService>();
        services.AddSingleton<ICorrelationIdProvider, CorrelationIdProvider>();

        services.AddHostedService<StorageInitializer>();
        services.AddHostedService<LayoutSeeder>();

        return services;
    }
}
