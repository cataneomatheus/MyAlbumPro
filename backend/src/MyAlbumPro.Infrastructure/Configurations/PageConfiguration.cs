using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyAlbumPro.Domain.Entities;
using MyAlbumPro.Domain.ValueObjects;

namespace MyAlbumPro.Infrastructure.Configurations;

public class PageConfiguration : IEntityTypeConfiguration<Page>
{
    public void Configure(EntityTypeBuilder<Page> builder)
    {
        builder.ToTable("Pages");
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Index).IsRequired();
        builder.Property(p => p.LayoutId).IsRequired();

        builder.OwnsMany(p => p.Slots, slots =>
        {
            slots.ToTable("PageSlots");
            slots.WithOwner().HasForeignKey("PageId");
            slots.HasKey("Id");

            slots.Property<Guid>("Id")
                .ValueGeneratedOnAdd();

            slots.Property(s => s.SlotId)
                .HasMaxLength(40)
                .IsRequired();

            slots.OwnsOne(s => s.Placement, placement =>
            {
                placement.Property(p => p.AssetId).HasColumnName("AssetId");
                placement.Property(p => p.OffsetX).HasColumnName("OffsetX");
                placement.Property(p => p.OffsetY).HasColumnName("OffsetY");
                placement.Property(p => p.Scale).HasColumnName("Scale");
            });
        });

        builder.Navigation(p => p.Slots).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
