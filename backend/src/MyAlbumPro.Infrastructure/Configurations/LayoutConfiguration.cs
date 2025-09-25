using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyAlbumPro.Domain.Entities;
using MyAlbumPro.Domain.ValueObjects;

namespace MyAlbumPro.Infrastructure.Configurations;

public class LayoutConfiguration : IEntityTypeConfiguration<Layout>
{
    public void Configure(EntityTypeBuilder<Layout> builder)
    {
        builder.ToTable("Layouts");
        builder.HasKey(l => l.Id);

        builder.Property(l => l.Name)
            .HasMaxLength(80)
            .IsRequired();

        builder.OwnsMany(l => l.Slots, slots =>
        {
            slots.ToTable("LayoutSlots");
            slots.WithOwner().HasForeignKey("LayoutId");
            slots.HasKey("Id");
            slots.Property<Guid>("Id").ValueGeneratedOnAdd();
            slots.Property(s => s.SlotId).HasColumnName("SlotId").HasMaxLength(40);

            slots.OwnsOne(s => s.BoundingBox, box =>
            {
                box.Property(b => b.X).HasColumnName("X");
                box.Property(b => b.Y).HasColumnName("Y");
                box.Property(b => b.Width).HasColumnName("Width");
                box.Property(b => b.Height).HasColumnName("Height");
            });
        });

        builder.Navigation(l => l.Slots).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
