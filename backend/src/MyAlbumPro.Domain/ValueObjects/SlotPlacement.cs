using MyAlbumPro.Domain.Common;

namespace MyAlbumPro.Domain.ValueObjects;

public sealed class SlotPlacement : ValueObject
{
    private SlotPlacement()
    {
        AssetId = Guid.Empty;
        OffsetX = 0;
        OffsetY = 0;
        Scale = 1;
    }

    public Guid AssetId { get; private set; }

    public double OffsetX { get; private set; }

    public double OffsetY { get; private set; }

    public double Scale { get; private set; }

    public static SlotPlacement Create(Guid assetId, double offsetX = 0, double offsetY = 0, double scale = 1.0)
    {
        if (assetId == Guid.Empty)
        {
            throw new ArgumentException("Asset id must be valid.", nameof(assetId));
        }

        if (scale is <= 0 or > 2)
        {
            throw new ArgumentException("Scale must be between 0 and 2.", nameof(scale));
        }

        if (offsetX is < -1 or > 1)
        {
            throw new ArgumentException("OffsetX must stay within [-1, 1].", nameof(offsetX));
        }

        if (offsetY is < -1 or > 1)
        {
            throw new ArgumentException("OffsetY must stay within [-1, 1].", nameof(offsetY));
        }

        return new SlotPlacement
        {
            AssetId = assetId,
            OffsetX = offsetX,
            OffsetY = offsetY,
            Scale = scale
        };
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return AssetId;
        yield return OffsetX;
        yield return OffsetY;
        yield return Scale;
    }
}
