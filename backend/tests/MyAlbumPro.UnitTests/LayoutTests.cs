using Xunit;
using FluentAssertions;
using MyAlbumPro.Domain.Entities;
using MyAlbumPro.Domain.ValueObjects;

namespace MyAlbumPro.UnitTests;

public class LayoutTests
{
    [Fact]
    public void CreatePreset_Throws_WhenSlotsOverlap()
    {
        var overlapping = new[]
        {
            LayoutSlotDefinition.Create("a", BoundingBox.Create(0, 0, 0.6, 0.6)),
            LayoutSlotDefinition.Create("b", BoundingBox.Create(0.5, 0.5, 0.5, 0.5))
        };

        Action act = () => Layout.CreatePreset(Guid.NewGuid(), "invalid", overlapping);
        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void CreatePreset_Succeeds_ForValidSlots()
    {
        var slots = new[]
        {
            LayoutSlotDefinition.Create("a", BoundingBox.Create(0, 0, 0.4, 0.4)),
            LayoutSlotDefinition.Create("b", BoundingBox.Create(0.6, 0.6, 0.3, 0.3))
        };

        var layout = Layout.CreatePreset(Guid.NewGuid(), "ok", slots);
        layout.Slots.Should().HaveCount(2);
    }
}

