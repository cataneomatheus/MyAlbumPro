using MyAlbumPro.Domain.Common;

namespace MyAlbumPro.Domain.Entities;

public sealed class Asset : Entity
{
    private Asset(
        Guid id,
        Guid ownerId,
        string fileName,
        string mimeType,
        string s3Key,
        string thumbKey,
        int width,
        int height,
        long bytes)
        : base(id)
    {
        OwnerId = ownerId;
        FileName = fileName;
        MimeType = mimeType;
        S3Key = s3Key;
        ThumbKey = thumbKey;
        Width = width;
        Height = height;
        Bytes = bytes;
        CreatedAt = DateTimeOffset.UtcNow;
    }

    public Guid OwnerId { get; }

    public string FileName { get; }

    public string MimeType { get; }

    public string S3Key { get; }

    public string ThumbKey { get; private set; }

    public int Width { get; }

    public int Height { get; }

    public long Bytes { get; }

    public DateTimeOffset CreatedAt { get; }

    public static Asset Create(
        Guid id,
        Guid ownerId,
        string fileName,
        string mimeType,
        string s3Key,
        string thumbKey,
        int width,
        int height,
        long bytes)
    {
        if (ownerId == Guid.Empty)
        {
            throw new ArgumentException("Owner id must be valid.", nameof(ownerId));
        }

        if (string.IsNullOrWhiteSpace(fileName))
        {
            throw new ArgumentException("File name must be provided", nameof(fileName));
        }

        if (string.IsNullOrWhiteSpace(mimeType))
        {
            throw new ArgumentException("Mime type must be provided", nameof(mimeType));
        }

        return new Asset(id, ownerId, fileName.Trim(), mimeType.Trim(), s3Key, thumbKey, width, height, bytes);
    }

    public void UpdateThumbnail(string thumbKey)
    {
        if (string.IsNullOrWhiteSpace(thumbKey))
        {
            throw new ArgumentException("Thumbnail key must be provided.", nameof(thumbKey));
        }

        ThumbKey = thumbKey.Trim();
    }
}
