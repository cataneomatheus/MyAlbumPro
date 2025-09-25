namespace MyAlbumPro.Application.Features.Assets.Dtos;

public record AssetDto(
    Guid AssetId,
    string FileName,
    string MimeType,
    string S3Key,
    string ThumbKey,
    int Width,
    int Height,
    long Bytes,
    string ThumbnailUrl);
