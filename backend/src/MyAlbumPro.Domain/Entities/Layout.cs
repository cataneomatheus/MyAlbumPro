using MyAlbumPro.Domain.Common;
using MyAlbumPro.Domain.ValueObjects;

namespace MyAlbumPro.Domain.Entities;

public sealed class Layout : Entity
{
    private readonly List<LayoutSlotDefinition> _slots = new();
    private Layout() : base(Guid.Empty) { }

    private Layout(Guid id, string name, IEnumerable<LayoutSlotDefinition> slots)
        : base(id)
    {
        Name = name;
        _slots.AddRange(slots);
        EnsureNoOverlap();
    }

    public string Name { get; private set; } = string.Empty;

    public IReadOnlyCollection<LayoutSlotDefinition> Slots => _slots.AsReadOnly();

    public static Layout CreatePreset(Guid id, string name, IEnumerable<LayoutSlotDefinition> slots)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Layout name must be provided.", nameof(name));
        }

        return new Layout(id, name.Trim(), slots);
    }

    private void EnsureNoOverlap()
    {
        for (var i = 0; i < _slots.Count; i++)
        {
            for (var j = i + 1; j < _slots.Count; j++)
            {
                if (_slots[i].BoundingBox.Overlaps(_slots[j].BoundingBox))
                {
                    throw new InvalidOperationException("Layout slots cannot overlap.");
                }
            }
        }
    }
}


