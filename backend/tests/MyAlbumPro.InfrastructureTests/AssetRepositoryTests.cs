using Xunit;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using MyAlbumPro.Domain.Entities;
using MyAlbumPro.Infrastructure.Persistence;

namespace MyAlbumPro.InfrastructureTests;

public class AssetRepositoryTests
{
    private readonly DbContextOptions<AppDbContext> _options;

    public AssetRepositoryTests()
    {
        _options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
    }

    [Fact]
    public async Task AddAsync_PersistsAsset()
    {
        await using var context = new AppDbContext(_options);
        var repository = new AssetRepository(context);
        var asset = Asset.Create(Guid.NewGuid(), Guid.NewGuid(), "file.jpg", "image/jpeg", "key", "thumb", 100, 100, 2048);

        await repository.AddAsync(asset);
        await context.SaveChangesAsync();

        var stored = await context.Assets.SingleAsync();
        stored.FileName.Should().Be("file.jpg");
    }
}

