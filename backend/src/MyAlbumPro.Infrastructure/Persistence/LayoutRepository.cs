using Microsoft.EntityFrameworkCore;
using MyAlbumPro.Application.Abstractions.Persistence;
using MyAlbumPro.Domain.Entities;

namespace MyAlbumPro.Infrastructure.Persistence;

public sealed class LayoutRepository : ILayoutRepository
{
    private readonly AppDbContext _context;

    public LayoutRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Layout?> GetByIdAsync(Guid layoutId, CancellationToken cancellationToken = default)
    {
        return await _context.Layouts
            .Include(l => l.Slots)
            .FirstOrDefaultAsync(l => l.Id == layoutId, cancellationToken);
    }

    public async Task<IReadOnlyList<Layout>> ListAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Layouts
            .Include(l => l.Slots)
            .OrderBy(l => l.Name)
            .ToListAsync(cancellationToken);
    }
}
