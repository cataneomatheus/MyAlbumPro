using MyAlbumPro.Domain.Common;

namespace MyAlbumPro.Domain.ValueObjects;

public sealed class LayoutSlotDefinition : ValueObject
{
    private LayoutSlotDefinition()
    {
        SlotId = string.Empty;
        BoundingBox = BoundingBox.Create(0, 0, 1, 1);
    }

    public string SlotId { get; private set; }

    public BoundingBox BoundingBox { get; private set; }

    public static LayoutSlotDefinition Create(string slotId, BoundingBox boundingBox)
    {
        if (string.IsNullOrWhiteSpace(slotId))
        {
            throw new ArgumentException("Slot id must be provided.", nameof(slotId));
        }

        var instance = new LayoutSlotDefinition
        {
            SlotId = slotId.Trim().ToLowerInvariant(),
            BoundingBox = boundingBox
        };

        return instance;
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return SlotId;
        yield return BoundingBox;
    }
}
