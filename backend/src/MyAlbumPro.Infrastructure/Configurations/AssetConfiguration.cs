using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyAlbumPro.Domain.Entities;

namespace MyAlbumPro.Infrastructure.Configurations;

public class AssetConfiguration : IEntityTypeConfiguration<Asset>
{
    public void Configure(EntityTypeBuilder<Asset> builder)
    {
        builder.ToTable("Assets");
        builder.HasKey(a => a.Id);

        builder.Property(a => a.OwnerId).IsRequired();
        builder.Property(a => a.FileName).HasMaxLength(200).IsRequired();
        builder.Property(a => a.MimeType).HasMaxLength(80).IsRequired();
        builder.Property(a => a.S3Key).HasMaxLength(260).IsRequired();
        builder.Property(a => a.ThumbKey).HasMaxLength(260).IsRequired();
        builder.Property(a => a.Width).IsRequired();
        builder.Property(a => a.Height).IsRequired();
        builder.Property(a => a.Bytes).IsRequired();
    }
}
