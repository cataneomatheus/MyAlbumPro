using MapsterMapper;
using MediatR;
using MyAlbumPro.Application.Abstractions.Auth;
using MyAlbumPro.Application.Abstractions.Persistence;
using MyAlbumPro.Application.Features.Projects.Dtos;

namespace MyAlbumPro.Application.Features.Projects.Queries;

public record ListProjectsQuery() : IRequest<IReadOnlyCollection<ProjectDto>>;

public sealed class ListProjectsQueryHandler : IRequestHandler<ListProjectsQuery, IReadOnlyCollection<ProjectDto>>
{
    private readonly IProjectRepository _projectRepository;
    private readonly ICurrentUserService _currentUser;
    private readonly IMapper _mapper;

    public ListProjectsQueryHandler(
        IProjectRepository projectRepository,
        ICurrentUserService currentUser,
        IMapper mapper)
    {
        _projectRepository = projectRepository;
        _currentUser = currentUser;
        _mapper = mapper;
    }

    public async Task<IReadOnlyCollection<ProjectDto>> Handle(ListProjectsQuery request, CancellationToken cancellationToken)
    {
        var projects = await _projectRepository.ListByOwnerAsync(_currentUser.UserId, cancellationToken);
        return projects.Select(project => _mapper.Map<ProjectDto>(project)).ToList();
    }
}
