using MyAlbumPro.Domain.Common;

namespace MyAlbumPro.Domain.ValueObjects;

public sealed class BoundingBox : ValueObject
{
    private BoundingBox()
    {
        X = 0;
        Y = 0;
        Width = 1;
        Height = 1;
    }

    private BoundingBox(double x, double y, double width, double height)
    {
        X = x;
        Y = y;
        Width = width;
        Height = height;
    }

    public double X { get; private set; }

    public double Y { get; private set; }

    public double Width { get; private set; }

    public double Height { get; private set; }

    public static BoundingBox Create(double x, double y, double width, double height)
    {
        if (width <= 0 || height <= 0)
        {
            throw new ArgumentException("Width and height must be positive dimensions.");
        }

        if (x < 0 || y < 0 || x + width > 1 || y + height > 1)
        {
            throw new ArgumentException("Bounding boxes must reside in the unit square (0..1).");
        }

        return new BoundingBox(x, y, width, height);
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return X;
        yield return Y;
        yield return Width;
        yield return Height;
    }

    public bool Overlaps(BoundingBox other)
    {
        var xOverlap = X < other.X + other.Width && X + Width > other.X;
        var yOverlap = Y < other.Y + other.Height && Y + Height > other.Y;
        return xOverlap && yOverlap;
    }
}
