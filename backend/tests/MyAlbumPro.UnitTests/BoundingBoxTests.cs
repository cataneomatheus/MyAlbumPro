using Xunit;
using FluentAssertions;
using MyAlbumPro.Domain.ValueObjects;

namespace MyAlbumPro.UnitTests;

public class BoundingBoxTests
{
    [Fact]
    public void Overlaps_ReturnsTrue_WhenBoxesIntersect()
    {
        var first = BoundingBox.Create(0, 0, 0.5, 0.5);
        var second = BoundingBox.Create(0.25, 0.25, 0.5, 0.5);

        first.Overlaps(second).Should().BeTrue();
    }

    [Fact]
    public void Create_Throws_WhenDimensionsInvalid()
    {
        var act = () => BoundingBox.Create(0, 0, -1, 1);
        act.Should().Throw<ArgumentException>();
    }
}

