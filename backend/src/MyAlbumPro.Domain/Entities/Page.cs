using MyAlbumPro.Domain.Common;
using MyAlbumPro.Domain.ValueObjects;

namespace MyAlbumPro.Domain.Entities;

public sealed class Page : Entity
{
    private readonly List<PageSlot> _slots = new();
    private Page() : base(Guid.Empty) { }

    private Page(Guid id, int index, Guid layoutId, IEnumerable<PageSlot> slots)
        : base(id)
    {
        Index = index;
        LayoutId = layoutId;
        _slots.AddRange(slots);
    }

    public int Index { get; private set; }

    public Guid LayoutId { get; private set; }

    public IReadOnlyCollection<PageSlot> Slots => _slots.AsReadOnly();

    public static Page Create(Guid id, int index, Guid layoutId, IEnumerable<string> slotIds)
    {
        if (index < 0)
        {
            throw new ArgumentException("Index must be non-negative.", nameof(index));
        }

        var slots = slotIds.Select(PageSlot.Empty).ToList();
        return new Page(id, index, layoutId, slots);
    }

    public Result AssignAsset(string slotId, SlotPlacement placement)
    {
        var slot = _slots.FirstOrDefault(s => s.SlotId == slotId);
        if (slot is null)
        {
            return Result.Failure($"Slot {slotId} does not exist in this page.");
        }

        var updated = slot.AssignAsset(placement);
        ReplaceSlot(slot, updated);
        return Result.Success();
    }

    public Result ClearSlot(string slotId)
    {
        var slot = _slots.FirstOrDefault(s => s.SlotId == slotId);
        if (slot is null)
        {
            return Result.Failure($"Slot {slotId} does not exist in this page.");
        }

        ReplaceSlot(slot, slot.Clear());
        return Result.Success();
    }

    public void ChangeLayout(Guid layoutId, IEnumerable<string> slotIds)
    {
        LayoutId = layoutId;
        _slots.Clear();
        _slots.AddRange(slotIds.Select(PageSlot.Empty));
    }

    private void ReplaceSlot(PageSlot target, PageSlot replacement)
    {
        var index = _slots.IndexOf(target);
        if (index >= 0)
        {
            _slots[index] = replacement;
        }
    }
}

