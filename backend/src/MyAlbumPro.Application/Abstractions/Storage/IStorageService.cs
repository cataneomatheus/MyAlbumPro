namespace MyAlbumPro.Application.Abstractions.Storage;

public record PresignedUpload(string Url, IDictionary<string, string> Fields, DateTimeOffset ExpiresAt);

public interface IStorageService
{
    Task<PresignedUpload> CreatePresignedUploadAsync(string objectKey, string contentType, TimeSpan expiry, CancellationToken cancellationToken = default);
    Task<string> GetPresignedDownloadAsync(string objectKey, TimeSpan expiry, CancellationToken cancellationToken = default);
}
