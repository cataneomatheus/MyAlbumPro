using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MyAlbumPro.Domain.Entities;
using MyAlbumPro.Domain.ValueObjects;
using MyAlbumPro.Infrastructure.Persistence;

namespace MyAlbumPro.Infrastructure.Services;

public sealed class LayoutSeeder : IHostedService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<LayoutSeeder> _logger;

    public LayoutSeeder(IServiceProvider serviceProvider, ILogger<LayoutSeeder> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        if (await context.Layouts.AnyAsync(cancellationToken))
        {
            return;
        }

        var layouts = CreateDefaultLayouts();
        await context.Layouts.AddRangeAsync(layouts, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Seeded {Count} layouts", layouts.Count);
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    private static List<Layout> CreateDefaultLayouts()
    {
        return new List<Layout>
        {
            Layout.CreatePreset(Guid.Parse("11111111-1111-1111-1111-111111111111"), "Single Full Page", new []
            {
                LayoutSlotDefinition.Create("full", BoundingBox.Create(0.05, 0.05, 0.9, 0.9))
            }),
            Layout.CreatePreset(Guid.Parse("22222222-2222-2222-2222-222222222222"), "Two Halves", new []
            {
                LayoutSlotDefinition.Create("left", BoundingBox.Create(0.05, 0.1, 0.42, 0.8)),
                LayoutSlotDefinition.Create("right", BoundingBox.Create(0.53, 0.1, 0.42, 0.8))
            }),
            Layout.CreatePreset(Guid.Parse("33333333-3333-3333-3333-333333333333"), "Four Grid", new []
            {
                LayoutSlotDefinition.Create("top-left", BoundingBox.Create(0.05, 0.05, 0.42, 0.42)),
                LayoutSlotDefinition.Create("top-right", BoundingBox.Create(0.53, 0.05, 0.42, 0.42)),
                LayoutSlotDefinition.Create("bottom-left", BoundingBox.Create(0.05, 0.53, 0.42, 0.42)),
                LayoutSlotDefinition.Create("bottom-right", BoundingBox.Create(0.53, 0.53, 0.42, 0.42))
            })
        };
    }
}
