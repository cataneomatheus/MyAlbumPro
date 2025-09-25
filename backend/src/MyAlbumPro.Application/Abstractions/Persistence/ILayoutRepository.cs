using MyAlbumPro.Domain.Entities;

namespace MyAlbumPro.Application.Abstractions.Persistence;

public interface ILayoutRepository
{
    Task<IReadOnlyList<Layout>> ListAsync(CancellationToken cancellationToken = default);
    Task<Layout?> GetByIdAsync(Guid layoutId, CancellationToken cancellationToken = default);
}
