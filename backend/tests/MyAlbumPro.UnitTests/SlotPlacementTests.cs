using Xunit;
using FluentAssertions;
using MyAlbumPro.Domain.ValueObjects;

namespace MyAlbumPro.UnitTests;

public class SlotPlacementTests
{
    [Fact]
    public void Create_Throws_WhenScaleInvalid()
    {
        Action act = () => SlotPlacement.Create(Guid.NewGuid(), scale: 3);
        act.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Create_ReturnsPlacement()
    {
        var placement = SlotPlacement.Create(Guid.NewGuid(), 0.1, 0.2, 1.2);
        placement.Scale.Should().BeApproximately(1.2, 0.001);
    }
}

