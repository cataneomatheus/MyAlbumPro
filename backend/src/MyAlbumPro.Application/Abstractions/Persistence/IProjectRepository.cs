using MyAlbumPro.Domain.Entities;

namespace MyAlbumPro.Application.Abstractions.Persistence;

public interface IProjectRepository
{
    Task<Project?> GetByIdAsync(Guid projectId, Guid ownerId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Project>> ListByOwnerAsync(Guid ownerId, CancellationToken cancellationToken = default);
    Task AddAsync(Project project, CancellationToken cancellationToken = default);
    Task RemoveAsync(Project project, CancellationToken cancellationToken = default);
}
