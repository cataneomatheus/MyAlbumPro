using MyAlbumPro.Domain.Common;

namespace MyAlbumPro.Domain.ValueObjects;

public sealed class AlbumSize : ValueObject
{
    private AlbumSize(string code, int widthCm, int heightCm)
    {
        Code = code;
        WidthCm = widthCm;
        HeightCm = heightCm;
    }

    public string Code { get; }

    public int WidthCm { get; }

    public int HeightCm { get; }

    public override string ToString() => $"{WidthCm}x{HeightCm}";

    public static AlbumSize Create(string code, int widthCm, int heightCm)
    {
        if (string.IsNullOrWhiteSpace(code))
        {
            throw new ArgumentException("Code must be provided", nameof(code));
        }

        if (widthCm <= 0 || heightCm <= 0)
        {
            throw new ArgumentException("Width and height must be positive dimensions");
        }

        return new AlbumSize(code.ToUpperInvariant(), widthCm, heightCm);
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Code;
    }

    public static IReadOnlyCollection<AlbumSize> Presets { get; } = new List<AlbumSize>
    {
        Create("30x30", 30, 30),
        Create("40x40", 40, 40),
        Create("20x30", 20, 30)
    };
}
