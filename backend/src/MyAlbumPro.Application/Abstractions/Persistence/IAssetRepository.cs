using MyAlbumPro.Domain.Entities;

namespace MyAlbumPro.Application.Abstractions.Persistence;

public interface IAssetRepository
{
    Task<Asset?> GetByIdAsync(Guid assetId, Guid ownerId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Asset>> ListByOwnerAsync(Guid ownerId, CancellationToken cancellationToken = default);
    Task AddAsync(Asset asset, CancellationToken cancellationToken = default);
}
