using MediatR;
using MyAlbumPro.Domain.ValueObjects;

namespace MyAlbumPro.Application.Features.Albums.Queries;

public record GetAlbumSizesQuery() : IRequest<IReadOnlyCollection<AlbumSizeResponse>>;

public record AlbumSizeResponse(string Code, int WidthCm, int HeightCm);

public sealed class GetAlbumSizesQueryHandler : IRequestHandler<GetAlbumSizesQuery, IReadOnlyCollection<AlbumSizeResponse>>
{
    public Task<IReadOnlyCollection<AlbumSizeResponse>> Handle(GetAlbumSizesQuery request, CancellationToken cancellationToken)
    {
        var sizes = AlbumSize.Presets.Select(x => new AlbumSizeResponse(x.Code, x.WidthCm, x.HeightCm)).ToList();
        return Task.FromResult<IReadOnlyCollection<AlbumSizeResponse>>(sizes);
    }
}
