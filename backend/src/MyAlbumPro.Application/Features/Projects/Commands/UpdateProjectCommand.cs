using FluentValidation;
using MapsterMapper;
using MediatR;
using MyAlbumPro.Application.Abstractions.Auth;
using MyAlbumPro.Application.Abstractions.Persistence;
using MyAlbumPro.Application.Features.Projects.Dtos;
using MyAlbumPro.Domain.Entities;
using MyAlbumPro.Domain.ValueObjects;

namespace MyAlbumPro.Application.Features.Projects.Commands;

public record UpdateProjectCommand(
    Guid ProjectId,
    string Title,
    string AlbumSizeCode,
    IReadOnlyCollection<UpdatePageRequest> Pages) : IRequest<ProjectDto>;

public record UpdatePageRequest(
    Guid PageId,
    Guid LayoutId,
    IReadOnlyCollection<UpdateSlotRequest> Slots);

public record UpdateSlotRequest(
    string SlotId,
    Guid? AssetId,
    double OffsetX,
    double OffsetY,
    double Scale);

public sealed class UpdateProjectCommandValidator : AbstractValidator<UpdateProjectCommand>
{
    public UpdateProjectCommandValidator()
    {
        RuleFor(x => x.ProjectId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(120);
        RuleFor(x => x.AlbumSizeCode).NotEmpty();
        RuleForEach(x => x.Pages).SetValidator(new UpdatePageRequestValidator());
    }

    private sealed class UpdatePageRequestValidator : AbstractValidator<UpdatePageRequest>
    {
        public UpdatePageRequestValidator()
        {
            RuleFor(x => x.PageId).NotEmpty();
            RuleFor(x => x.LayoutId).NotEmpty();
            RuleForEach(x => x.Slots).SetValidator(new UpdateSlotRequestValidator());
        }
    }

    private sealed class UpdateSlotRequestValidator : AbstractValidator<UpdateSlotRequest>
    {
        public UpdateSlotRequestValidator()
        {
            RuleFor(x => x.SlotId).NotEmpty();
            RuleFor(x => x.Scale).InclusiveBetween(0.25, 2.0);
            RuleFor(x => x.OffsetX).InclusiveBetween(-1, 1);
            RuleFor(x => x.OffsetY).InclusiveBetween(-1, 1);
        }
    }
}

public sealed class UpdateProjectCommandHandler : IRequestHandler<UpdateProjectCommand, ProjectDto>
{
    private readonly IProjectRepository _projectRepository;
    private readonly ILayoutRepository _layoutRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;
    private readonly IMapper _mapper;

    public UpdateProjectCommandHandler(
        IProjectRepository projectRepository,
        ILayoutRepository layoutRepository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUser,
        IMapper mapper)
    {
        _projectRepository = projectRepository;
        _layoutRepository = layoutRepository;
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
        _mapper = mapper;
    }

    public async Task<ProjectDto> Handle(UpdateProjectCommand request, CancellationToken cancellationToken)
    {
        var project = await _projectRepository.GetByIdAsync(request.ProjectId, _currentUser.UserId, cancellationToken)
            ?? throw new InvalidOperationException("Project not found");

        var albumSize = AlbumSize.Presets.FirstOrDefault(x => x.Code.Equals(request.AlbumSizeCode, StringComparison.OrdinalIgnoreCase))
            ?? throw new InvalidOperationException("Album size not available");

        project.Rename(request.Title);
        project.ChangeAlbumSize(albumSize);

        var pages = new List<Page>();
        foreach (var pageRequest in request.Pages.OrderBy(p => p.PageId))
        {
            var layout = await _layoutRepository.GetByIdAsync(pageRequest.LayoutId, cancellationToken)
                ?? throw new InvalidOperationException("Layout not found");

            var existingPage = project.Pages.FirstOrDefault(p => p.Id == pageRequest.PageId)
                ?? Page.Create(pageRequest.PageId, project.Pages.Count, layout.Id, layout.Slots.Select(s => s.SlotId));

            existingPage.ChangeLayout(layout.Id, layout.Slots.Select(s => s.SlotId));

            foreach (var slotRequest in pageRequest.Slots)
            {
                if (slotRequest.AssetId is { } assetId)
                {
                    var placement = SlotPlacement.Create(assetId, slotRequest.OffsetX, slotRequest.OffsetY, slotRequest.Scale);
                    var assignResult = existingPage.AssignAsset(slotRequest.SlotId, placement);
                    if (assignResult.IsFailure)
                    {
                        throw new InvalidOperationException(assignResult.Error);
                    }
                }
                else
                {
                    existingPage.ClearSlot(slotRequest.SlotId);
                }
            }

            pages.Add(existingPage);
        }

        project.ReplacePages(pages.OrderBy(p => p.Index));

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<ProjectDto>(project);
    }
}
