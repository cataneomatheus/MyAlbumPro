namespace MyAlbumPro.Application.Features.Projects.Dtos;

public record SlotDto(string SlotId, Guid? AssetId, double OffsetX, double OffsetY, double Scale);

public record PageDto(Guid PageId, int Index, Guid LayoutId, IReadOnlyCollection<SlotDto> Slots);

public record ProjectDto(
    Guid ProjectId,
    string Title,
    string AlbumSize,
    Guid OwnerId,
    IReadOnlyCollection<PageDto> Pages,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
