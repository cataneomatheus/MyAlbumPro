using Xunit;
using FluentAssertions;
using MapsterMapper;
using Moq;
using MyAlbumPro.Application.Abstractions.Auth;
using MyAlbumPro.Application.Abstractions.Persistence;
using MyAlbumPro.Application.Features.Assets.Commands;

namespace MyAlbumPro.ApplicationTests;

public class IngestAssetCommandHandlerTests
{
    private readonly Mock<IAssetRepository> _assetRepository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly Mock<ICurrentUserService> _currentUser = new();
    private readonly IMapper _mapper = MapperFixture.CreateMapper();

    public IngestAssetCommandHandlerTests()
    {
        _currentUser.SetupGet(x => x.UserId).Returns(Guid.NewGuid());
        _unitOfWork.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
    }

    [Fact]
    public async Task Handle_PersistsAsset()
    {
        var handler = new IngestAssetCommandHandler(
            _assetRepository.Object,
            _unitOfWork.Object,
            _currentUser.Object,
            _mapper);

        var result = await handler.Handle(new IngestAssetCommand("key", "photo.jpg", "image/jpeg", 100, 100, 12345, "thumb"), CancellationToken.None);

        result.FileName.Should().Be("photo.jpg");
        _assetRepository.Verify(x => x.AddAsync(It.IsAny<MyAlbumPro.Domain.Entities.Asset>(), It.IsAny<CancellationToken>()), Times.Once);
    }
}

