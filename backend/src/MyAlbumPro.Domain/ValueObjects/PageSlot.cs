using MyAlbumPro.Domain.Common;

namespace MyAlbumPro.Domain.ValueObjects;

public sealed class PageSlot : ValueObject
{
    private PageSlot()
    {
        SlotId = string.Empty;
    }

    public string SlotId { get; private set; }

    public SlotPlacement? Placement { get; private set; }

    public static PageSlot Empty(string slotId)
    {
        if (string.IsNullOrWhiteSpace(slotId))
        {
            throw new ArgumentException("Slot id must be provided.", nameof(slotId));
        }

        return new PageSlot
        {
            SlotId = slotId.Trim().ToLowerInvariant(),
            Placement = null
        };
    }

    public PageSlot AssignAsset(SlotPlacement placement)
        => new()
        {
            SlotId = SlotId,
            Placement = placement
        };

    public PageSlot Clear()
        => new()
        {
            SlotId = SlotId,
            Placement = null
        };

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return SlotId;
        yield return Placement;
    }
}
