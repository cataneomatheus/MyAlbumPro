using MapsterMapper;
using MediatR;
using MyAlbumPro.Application.Abstractions.Persistence;
using MyAlbumPro.Application.Features.Layouts.Dtos;

namespace MyAlbumPro.Application.Features.Layouts.Queries;

public record GetLayoutsQuery() : IRequest<IReadOnlyCollection<LayoutDto>>;

public sealed class GetLayoutsQueryHandler : IRequestHandler<GetLayoutsQuery, IReadOnlyCollection<LayoutDto>>
{
    private readonly ILayoutRepository _layoutRepository;
    private readonly IMapper _mapper;

    public GetLayoutsQueryHandler(ILayoutRepository layoutRepository, IMapper mapper)
    {
        _layoutRepository = layoutRepository;
        _mapper = mapper;
    }

    public async Task<IReadOnlyCollection<LayoutDto>> Handle(GetLayoutsQuery request, CancellationToken cancellationToken)
    {
        var layouts = await _layoutRepository.ListAsync(cancellationToken);
        return layouts.Select(layout => _mapper.Map<LayoutDto>(layout)).ToList();
    }
}
