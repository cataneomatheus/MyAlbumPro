using Minio;
using Minio.DataModel.Args;
using Microsoft.Extensions.Options;
using MyAlbumPro.Application.Abstractions.Storage;
using MyAlbumPro.Infrastructure.Configurations;

namespace MyAlbumPro.Infrastructure.Storage;

public sealed class MinioStorageService : IStorageService
{
    private readonly IMinioClient _minioClient;
    private readonly StorageOptions _options;

    public MinioStorageService(IMinioClient minioClient, IOptions<StorageOptions> options)
    {
        _minioClient = minioClient;
        _options = options.Value;
    }

    public async Task<PresignedUpload> CreatePresignedUploadAsync(string objectKey, string contentType, TimeSpan expiry, CancellationToken cancellationToken = default)
    {
        var bucket = _options.AssetsBucket;

        var url = await _minioClient.PresignedPutObjectAsync(new PresignedPutObjectArgs()
            .WithBucket(bucket)
            .WithObject(objectKey)
            .WithExpiry((int)expiry.TotalSeconds)
            .WithHeaders(new Dictionary<string, string> { ["Content-Type"] = contentType }));

        return new PresignedUpload(url, new Dictionary<string, string> { ["Content-Type"] = contentType }, DateTimeOffset.UtcNow.Add(expiry));
    }

    public async Task<string> GetPresignedDownloadAsync(string objectKey, TimeSpan expiry, CancellationToken cancellationToken = default)
    {
        var bucket = _options.AssetsBucket;
        var url = await _minioClient.PresignedGetObjectAsync(new PresignedGetObjectArgs()
            .WithBucket(bucket)
            .WithObject(objectKey)
            .WithExpiry((int)expiry.TotalSeconds));

        return url;
    }
}
