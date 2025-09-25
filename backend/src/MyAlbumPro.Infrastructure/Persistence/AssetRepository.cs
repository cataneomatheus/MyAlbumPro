using Microsoft.EntityFrameworkCore;
using MyAlbumPro.Application.Abstractions.Persistence;
using MyAlbumPro.Domain.Entities;

namespace MyAlbumPro.Infrastructure.Persistence;

public sealed class AssetRepository : IAssetRepository
{
    private readonly AppDbContext _context;

    public AssetRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Asset asset, CancellationToken cancellationToken = default)
    {
        await _context.Assets.AddAsync(asset, cancellationToken);
    }

    public async Task<Asset?> GetByIdAsync(Guid assetId, Guid ownerId, CancellationToken cancellationToken = default)
    {
        return await _context.Assets
            .FirstOrDefaultAsync(a => a.Id == assetId && a.OwnerId == ownerId, cancellationToken);
    }

    public async Task<IReadOnlyList<Asset>> ListByOwnerAsync(Guid ownerId, CancellationToken cancellationToken = default)
    {
        return await _context.Assets
            .Where(a => a.OwnerId == ownerId)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(cancellationToken);
    }
}
