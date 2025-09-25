using Xunit;
using FluentAssertions;
using MyAlbumPro.Domain.Entities;
using MyAlbumPro.Domain.ValueObjects;

namespace MyAlbumPro.UnitTests;

public class PageTests
{
    private static LayoutSlotDefinition[] Slots => new[]
    {
        LayoutSlotDefinition.Create("slot-1", BoundingBox.Create(0, 0, 0.5, 0.5)),
        LayoutSlotDefinition.Create("slot-2", BoundingBox.Create(0.5, 0.5, 0.5, 0.5)),
    };

    [Fact]
    public void AssignAsset_Fails_WhenSlotMissing()
    {
        var page = Page.Create(Guid.NewGuid(), 0, Guid.NewGuid(), Slots.Select(s => s.SlotId));
        var result = page.AssignAsset("missing", SlotPlacement.Create(Guid.NewGuid()));
        result.IsFailure.Should().BeTrue();
    }

    [Fact]
    public void AssignAsset_Succeeds_ForExistingSlot()
    {
        var assetId = Guid.NewGuid();
        var page = Page.Create(Guid.NewGuid(), 0, Guid.NewGuid(), Slots.Select(s => s.SlotId));

        var result = page.AssignAsset("slot-1", SlotPlacement.Create(assetId, 0.1, 0.2));
        result.IsSuccess.Should().BeTrue();
        page.Slots.First(s => s.SlotId == "slot-1").Placement!.AssetId.Should().Be(assetId);
    }
}

