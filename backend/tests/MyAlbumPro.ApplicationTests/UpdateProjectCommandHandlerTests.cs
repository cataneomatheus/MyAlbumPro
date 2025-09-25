using Xunit;
using FluentAssertions;
using MapsterMapper;
using Moq;
using MyAlbumPro.Application.Abstractions.Auth;
using MyAlbumPro.Application.Abstractions.Persistence;
using MyAlbumPro.Application.Features.Projects.Commands;
using MyAlbumPro.Domain.Entities;
using MyAlbumPro.Domain.ValueObjects;

namespace MyAlbumPro.ApplicationTests;

public class UpdateProjectCommandHandlerTests
{
    private readonly Mock<IProjectRepository> _projectRepository = new();
    private readonly Mock<ILayoutRepository> _layoutRepository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly Mock<ICurrentUserService> _currentUser = new();
    private readonly IMapper _mapper = MapperFixture.CreateMapper();
    private readonly Layout _layout;
    private readonly Project _project;

    public UpdateProjectCommandHandlerTests()
    {
        _currentUser.SetupGet(x => x.UserId).Returns(Guid.NewGuid());
        _layout = Layout.CreatePreset(Guid.Parse("11111111-1111-1111-1111-111111111111"), "single", new[]
        {
            LayoutSlotDefinition.Create("slot", BoundingBox.Create(0, 0, 1, 1))
        });
        _layoutRepository.Setup(x => x.GetByIdAsync(_layout.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(_layout);
        var page = Page.Create(Guid.NewGuid(), 0, _layout.Id, _layout.Slots.Select(s => s.SlotId));
        _project = Project.Create(Guid.NewGuid(), _currentUser.Object.UserId, "Album", AlbumSize.Presets.First(), new[] { page });
        _projectRepository.Setup(x => x.GetByIdAsync(_project.Id, _currentUser.Object.UserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(_project);
        _unitOfWork.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
    }

    [Fact]
    public async Task Handle_UpdatesProject()
    {
        var handler = new UpdateProjectCommandHandler(
            _projectRepository.Object,
            _layoutRepository.Object,
            _unitOfWork.Object,
            _currentUser.Object,
            _mapper);

        var request = new UpdateProjectCommand(
            _project.Id,
            "Updated",
            "40x40",
            new[]
            {
                new UpdatePageRequest(
                    _project.Pages.First().Id,
                    _layout.Id,
                    new []
                    {
                        new UpdateSlotRequest("slot", Guid.NewGuid(), 0.1, 0.2, 1.1)
                    })
            });

        var response = await handler.Handle(request, CancellationToken.None);

        response.Title.Should().Be("Updated");
        _unitOfWork.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}

