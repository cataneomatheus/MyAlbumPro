namespace MyAlbumPro.Infrastructure.Configurations;

public sealed class StorageOptions
{
    public const string SectionName = "Storage";

    public string Endpoint { get; set; } = string.Empty;
    public string AccessKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public bool UseSsl { get; set; }
    public string AssetsBucket { get; set; } = "albums";
    public string ThumbnailsBucket { get; set; } = "thumbnails";
}
