using Xunit;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using MyAlbumPro.Domain.Entities;
using MyAlbumPro.Domain.ValueObjects;
using MyAlbumPro.Infrastructure.Persistence;

namespace MyAlbumPro.InfrastructureTests;

public class ProjectRepositoryTests
{
    private readonly DbContextOptions<AppDbContext> _options;

    public ProjectRepositoryTests()
    {
        _options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
    }

    [Fact]
    public async Task ListByOwnerAsync_ReturnsProjects()
    {
        await using var context = new AppDbContext(_options);
        var layout = Layout.CreatePreset(Guid.NewGuid(), "layout", new[]
        {
            LayoutSlotDefinition.Create("slot", BoundingBox.Create(0, 0, 1, 1))
        });
        context.Layouts.Add(layout);

        var page = Page.Create(Guid.NewGuid(), 0, layout.Id, layout.Slots.Select(s => s.SlotId));
        var project = Project.Create(Guid.NewGuid(), Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), "Album", AlbumSize.Presets.First(), new[] { page });
        context.Projects.Add(project);
        await context.SaveChangesAsync();

        var repository = new ProjectRepository(context);
        var result = await repository.ListByOwnerAsync(project.OwnerId);

        result.Should().HaveCount(1);
    }
}

