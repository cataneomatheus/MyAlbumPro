using MapsterMapper;
using MediatR;
using MyAlbumPro.Application.Abstractions.Auth;
using MyAlbumPro.Application.Abstractions.Persistence;
using MyAlbumPro.Application.Features.Projects.Dtos;
using MyAlbumPro.Domain.ValueObjects;

namespace MyAlbumPro.Application.Features.Projects.Commands;

public record AutofillProjectCommand(Guid ProjectId) : IRequest<ProjectDto>;

public sealed class AutofillProjectCommandHandler : IRequestHandler<AutofillProjectCommand, ProjectDto>
{
    private readonly IProjectRepository _projectRepository;
    private readonly IAssetRepository _assetRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;
    private readonly IMapper _mapper;

    public AutofillProjectCommandHandler(
        IProjectRepository projectRepository,
        IAssetRepository assetRepository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUser,
        IMapper mapper)
    {
        _projectRepository = projectRepository;
        _assetRepository = assetRepository;
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
        _mapper = mapper;
    }

    public async Task<ProjectDto> Handle(AutofillProjectCommand request, CancellationToken cancellationToken)
    {
        var project = await _projectRepository.GetByIdAsync(request.ProjectId, _currentUser.UserId, cancellationToken)
            ?? throw new InvalidOperationException("Project not found");

        var assets = await _assetRepository.ListByOwnerAsync(_currentUser.UserId, cancellationToken);
        var queue = new Queue<Guid>(assets.Select(a => a.Id));

        foreach (var page in project.Pages.OrderBy(p => p.Index))
        {
            foreach (var slot in page.Slots.ToList())
            {
                if (slot.Placement is not null)
                {
                    continue;
                }

                if (queue.Count == 0)
                {
                    break;
                }

                var assetId = queue.Dequeue();
                var placement = SlotPlacement.Create(assetId);
                page.AssignAsset(slot.SlotId, placement);
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return _mapper.Map<ProjectDto>(project);
    }
}

