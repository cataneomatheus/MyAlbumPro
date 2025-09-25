using Microsoft.EntityFrameworkCore;
using MyAlbumPro.Domain.Entities;

namespace MyAlbumPro.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Page> Pages => Set<Page>();
    public DbSet<Asset> Assets => Set<Asset>();
    public DbSet<Layout> Layouts => Set<Layout>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
