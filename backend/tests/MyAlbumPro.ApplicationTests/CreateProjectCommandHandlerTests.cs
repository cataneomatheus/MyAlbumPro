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

public class CreateProjectCommandHandlerTests
{
    private readonly Mock<IProjectRepository> _projectRepository = new();
    private readonly Mock<ILayoutRepository> _layoutRepository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly Mock<ICurrentUserService> _currentUser = new();
    private readonly IMapper _mapper = MapperFixture.CreateMapper();

    public CreateProjectCommandHandlerTests()
    {
        _currentUser.SetupGet(x => x.UserId).Returns(Guid.NewGuid());
        var layout = Layout.CreatePreset(Guid.Parse("11111111-1111-1111-1111-111111111111"), "single", new[]
        {
            LayoutSlotDefinition.Create("full", BoundingBox.Create(0, 0, 1, 1))
        });
        _layoutRepository.Setup(x => x.GetByIdAsync(layout.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(layout);
        _unitOfWork.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
    }

    [Fact]
    public async Task Handle_CreatesProject()
    {
        var handler = new CreateProjectCommandHandler(
            _projectRepository.Object,
            _layoutRepository.Object,
            _unitOfWork.Object,
            _currentUser.Object,
            _mapper);

        var response = await handler.Handle(new CreateProjectCommand("Test", "30x30", Guid.Parse("11111111-1111-1111-1111-111111111111"), 2), CancellationToken.None);

        response.Pages.Should().HaveCount(2);
        _projectRepository.Verify(x => x.AddAsync(It.IsAny<Project>(), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWork.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}

