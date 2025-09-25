using Minio;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MyAlbumPro.Infrastructure.Configurations;

namespace MyAlbumPro.Infrastructure.Services;

public sealed class StorageInitializer : IHostedService
{
    private readonly IMinioClient _minioClient;
    private readonly StorageOptions _options;
    private readonly ILogger<StorageInitializer> _logger;

    public StorageInitializer(IMinioClient minioClient, IOptions<StorageOptions> options, ILogger<StorageInitializer> logger)
    {
        _minioClient = minioClient;
        _options = options.Value;
        _logger = logger;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        await EnsureBucketAsync(_options.AssetsBucket, cancellationToken);
        await EnsureBucketAsync(_options.ThumbnailsBucket, cancellationToken);
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    private async Task EnsureBucketAsync(string bucketName, CancellationToken cancellationToken)
    {
        try
        {
            var exists = await _minioClient.BucketExistsAsync(new Minio.DataModel.Args.BucketExistsArgs().WithBucket(bucketName), cancellationToken);
            if (!exists)
            {
                await _minioClient.MakeBucketAsync(new Minio.DataModel.Args.MakeBucketArgs().WithBucket(bucketName), cancellationToken);
                _logger.LogInformation("Created bucket {Bucket}", bucketName);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to ensure bucket {Bucket}", bucketName);
            throw;
        }
    }
}
