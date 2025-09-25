using MapsterMapper;
using MediatR;
using MyAlbumPro.Application.Abstractions.Auth;
using MyAlbumPro.Application.Abstractions.Persistence;
using MyAlbumPro.Application.Features.Projects.Dtos;

namespace MyAlbumPro.Application.Features.Projects.Queries;

public record GetProjectQuery(Guid ProjectId) : IRequest<ProjectDto>;

public sealed class GetProjectQueryHandler : IRequestHandler<GetProjectQuery, ProjectDto>
{
    private readonly IProjectRepository _projectRepository;
    private readonly ICurrentUserService _currentUser;
    private readonly IMapper _mapper;

    public GetProjectQueryHandler(
        IProjectRepository projectRepository,
        ICurrentUserService currentUser,
        IMapper mapper)
    {
        _projectRepository = projectRepository;
        _currentUser = currentUser;
        _mapper = mapper;
    }

    public async Task<ProjectDto> Handle(GetProjectQuery request, CancellationToken cancellationToken)
    {
        var project = await _projectRepository.GetByIdAsync(request.ProjectId, _currentUser.UserId, cancellationToken)
            ?? throw new InvalidOperationException("Project not found");

        return _mapper.Map<ProjectDto>(project);
    }
}
