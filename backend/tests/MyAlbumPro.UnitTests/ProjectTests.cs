using Xunit;
using FluentAssertions;
using MyAlbumPro.Domain.Entities;
using MyAlbumPro.Domain.ValueObjects;

namespace MyAlbumPro.UnitTests;

public class ProjectTests
{
    private static readonly AlbumSize Album30 = AlbumSize.Presets.First();
    private static readonly Layout Layout = Layout.CreatePreset(Guid.NewGuid(), "single", new[]
    {
        LayoutSlotDefinition.Create("slot", BoundingBox.Create(0, 0, 1, 1))
    });

    [Fact]
    public void ChangeAlbumSize_UpdatesSize()
    {
        var project = CreateProject();
        var newSize = AlbumSize.Presets.Last();

        project.ChangeAlbumSize(newSize);

        project.AlbumSize.Should().Be(newSize);
    }

    [Fact]
    public void ReplacePages_ReplacesContent()
    {
        var project = CreateProject();
        var newPage = Page.Create(Guid.NewGuid(), 0, Layout.Id, Layout.Slots.Select(s => s.SlotId));

        project.ReplacePages(new[] { newPage });

        project.Pages.Should().ContainSingle(p => p.Id == newPage.Id);
    }

    private static Project CreateProject()
    {
        var page = Page.Create(Guid.NewGuid(), 0, Layout.Id, Layout.Slots.Select(s => s.SlotId));
        return Project.Create(Guid.NewGuid(), Guid.NewGuid(), "Album", Album30, new[] { page });
    }
}

