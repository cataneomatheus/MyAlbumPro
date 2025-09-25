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

public class AutofillProjectCommandHandlerTests
{
    private readonly Mock<IProjectRepository> _projectRepository = new();
    private readonly Mock<IAssetRepository> _assetRepository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly Mock<ICurrentUserService> _currentUser = new();
    private readonly IMapper _mapper = MapperFixture.CreateMapper();
    private readonly Project _project;

    public AutofillProjectCommandHandlerTests()
    {
        _currentUser.SetupGet(x => x.UserId).Returns(Guid.NewGuid());
        var layout = Layout.CreatePreset(Guid.NewGuid(), "single", new[]
        {
            LayoutSlotDefinition.Create("slot", BoundingBox.Create(0, 0, 1, 1))
        });
        var page = Page.Create(Guid.NewGuid(), 0, layout.Id, layout.Slots.Select(s => s.SlotId));
        _project = Project.Create(Guid.NewGuid(), _currentUser.Object.UserId, "Album", AlbumSize.Presets.First(), new[] { page });

        _projectRepository.Setup(x => x.GetByIdAsync(_project.Id, _currentUser.Object.UserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(_project);
        _assetRepository.Setup(x => x.ListByOwnerAsync(_currentUser.Object.UserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Asset>
            {
                Asset.Create(Guid.NewGuid(), _currentUser.Object.UserId, "photo.jpg", "image/jpeg", "key", "thumb", 1000, 1000, 1024)
            });
        _unitOfWork.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
    }

    [Fact]
    public async Task Handle_FillsEmptySlots()
    {
        var handler = new AutofillProjectCommandHandler(
            _projectRepository.Object,
            _assetRepository.Object,
            _unitOfWork.Object,
            _currentUser.Object,
            _mapper);

        var response = await handler.Handle(new AutofillProjectCommand(_project.Id), CancellationToken.None);

        response.Pages.First().Slots.First().AssetId.Should().NotBeNull();
    }
}

