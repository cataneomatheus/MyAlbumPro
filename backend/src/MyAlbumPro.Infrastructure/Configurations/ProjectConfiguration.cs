using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyAlbumPro.Domain.Entities;
using MyAlbumPro.Domain.ValueObjects;

namespace MyAlbumPro.Infrastructure.Configurations;

public class ProjectConfiguration : IEntityTypeConfiguration<Project>
{
    public void Configure(EntityTypeBuilder<Project> builder)
    {
        builder.ToTable("Projects");
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Title)
            .HasMaxLength(120)
            .IsRequired();

        builder.Property(p => p.OwnerId)
            .IsRequired();

        builder.OwnsOne(p => p.AlbumSize, albumSize =>
        {
            albumSize.Property(a => a.Code).HasColumnName("AlbumSizeCode").HasMaxLength(20).IsRequired();
            albumSize.Property(a => a.WidthCm).HasColumnName("AlbumWidth");
            albumSize.Property(a => a.HeightCm).HasColumnName("AlbumHeight");
        });

        builder.HasMany(p => p.Pages)
            .WithOne()
            .HasForeignKey("ProjectId")
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(p => p.Pages).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
