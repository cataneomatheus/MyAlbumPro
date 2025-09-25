using FluentValidation;
using MapsterMapper;
using MediatR;
using MyAlbumPro.Application.Abstractions.Auth;
using MyAlbumPro.Application.Abstractions.Persistence;
using MyAlbumPro.Application.Features.Projects.Dtos;
using MyAlbumPro.Domain.Entities;
using MyAlbumPro.Domain.ValueObjects;

namespace MyAlbumPro.Application.Features.Projects.Commands;

public record CreateProjectCommand(
    string Title,
    string AlbumSizeCode,
    Guid LayoutId,
    int PageCount) : IRequest<ProjectDto>;

public sealed class CreateProjectCommandValidator : AbstractValidator<CreateProjectCommand>
{
    public CreateProjectCommandValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(120);
        RuleFor(x => x.AlbumSizeCode).NotEmpty();
        RuleFor(x => x.PageCount).InclusiveBetween(1, 40);
        RuleFor(x => x.LayoutId).NotEmpty();
    }
}

public sealed class CreateProjectCommandHandler : IRequestHandler<CreateProjectCommand, ProjectDto>
{
    private readonly IProjectRepository _projectRepository;
    private readonly ILayoutRepository _layoutRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;
    private readonly IMapper _mapper;

    public CreateProjectCommandHandler(
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

    public async Task<ProjectDto> Handle(CreateProjectCommand request, CancellationToken cancellationToken)
    {
        var layout = await _layoutRepository.GetByIdAsync(request.LayoutId, cancellationToken)
            ?? throw new InvalidOperationException("Layout not found");

        var albumSize = AlbumSize.Presets.FirstOrDefault(x => x.Code.Equals(request.AlbumSizeCode, StringComparison.OrdinalIgnoreCase))
            ?? throw new InvalidOperationException("Album size not available");

        var pages = new List<Page>();
        for (var index = 0; index < request.PageCount; index++)
        {
            var page = Page.Create(Guid.NewGuid(), index, layout.Id, layout.Slots.Select(slot => slot.SlotId));
            pages.Add(page);
        }

        var project = Project.Create(Guid.NewGuid(), _currentUser.UserId, request.Title, albumSize, pages);
        await _projectRepository.AddAsync(project, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<ProjectDto>(project);
    }
}
