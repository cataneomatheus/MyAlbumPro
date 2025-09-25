namespace MyAlbumPro.Application.Features.Layouts.Dtos;

public record LayoutSlotDto(string SlotId, double X, double Y, double Width, double Height);

public record LayoutDto(Guid Id, string Name, IReadOnlyCollection<LayoutSlotDto> Slots);
