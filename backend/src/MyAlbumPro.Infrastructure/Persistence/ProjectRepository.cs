using Microsoft.EntityFrameworkCore;
using MyAlbumPro.Application.Abstractions.Persistence;
using MyAlbumPro.Domain.Entities;

namespace MyAlbumPro.Infrastructure.Persistence;

public sealed class ProjectRepository : IProjectRepository
{
    private readonly AppDbContext _context;

    public ProjectRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Project project, CancellationToken cancellationToken = default)
    {
        await _context.Projects.AddAsync(project, cancellationToken);
    }

    public Task RemoveAsync(Project project, CancellationToken cancellationToken = default)
    {
        _context.Projects.Remove(project);
        return Task.CompletedTask;
    }

    public async Task<Project?> GetByIdAsync(Guid projectId, Guid ownerId, CancellationToken cancellationToken = default)
    {
        return await _context.Projects
            .Include(p => p.Pages)
            .ThenInclude(p => p.Slots)
            .FirstOrDefaultAsync(p => p.Id == projectId && p.OwnerId == ownerId, cancellationToken);
    }

    public async Task<IReadOnlyList<Project>> ListByOwnerAsync(Guid ownerId, CancellationToken cancellationToken = default)
    {
        return await _context.Projects
            .Where(p => p.OwnerId == ownerId)
            .Include(p => p.Pages)
            .ThenInclude(p => p.Slots)
            .OrderByDescending(p => p.UpdatedAt)
            .ToListAsync(cancellationToken);
    }
}
