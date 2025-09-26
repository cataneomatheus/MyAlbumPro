using MapsterMapper;
using MediatR;
using MyAlbumPro.Application.Abstractions.Auth;
using MyAlbumPro.Application.Abstractions.Persistence;
using MyAlbumPro.Application.Features.Assets.Dtos;

namespace MyAlbumPro.Application.Features.Assets.Queries;

public record ListAssetsQuery() : IRequest<IReadOnlyCollection<AssetDto>>;

public sealed class ListAssetsQueryHandler : IRequestHandler<ListAssetsQuery, IReadOnlyCollection<AssetDto>>
{
    private readonly IAssetRepository _assetRepository;
    private readonly ICurrentUserService _currentUser;
    private readonly IMapper _mapper;

    public ListAssetsQueryHandler(
        IAssetRepository assetRepository,
        ICurrentUserService currentUser,
        IMapper mapper)
    {
        _assetRepository = assetRepository;
        _currentUser = currentUser;
        _mapper = mapper;
    }

    public async Task<IReadOnlyCollection<AssetDto>> Handle(ListAssetsQuery request, CancellationToken cancellationToken)
    {
        var assets = await _assetRepository.ListByOwnerAsync(_currentUser.UserId, cancellationToken);

        return assets.Select(asset =>
        {
            var dto = _mapper.Map<AssetDto>(asset);
            return dto with { ThumbnailUrl = $"/assets/{dto.AssetId}/thumbnail" };
        }).ToList();
    }
}
