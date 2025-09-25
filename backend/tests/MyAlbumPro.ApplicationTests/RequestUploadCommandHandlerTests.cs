using Xunit;
using FluentAssertions;
using Moq;
using MyAlbumPro.Application.Abstractions.Auth;
using MyAlbumPro.Application.Abstractions.Storage;
using MyAlbumPro.Application.Features.Assets.Commands;

namespace MyAlbumPro.ApplicationTests;

public class RequestUploadCommandHandlerTests
{
    private readonly Mock<IStorageService> _storage = new();
    private readonly Mock<ICurrentUserService> _currentUser = new();

    [Fact]
    public async Task Handle_ReturnsPresignedUpload()
    {
        _storage.Setup(x => x.CreatePresignedUploadAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<TimeSpan>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PresignedUpload("http://upload", new Dictionary<string, string>(), DateTimeOffset.UtcNow.AddMinutes(5)));
        _currentUser.SetupGet(x => x.UserId).Returns(Guid.NewGuid());

        var handler = new RequestUploadCommandHandler(_storage.Object, _currentUser.Object);
        var result = await handler.Handle(new RequestUploadCommand("photo.jpg", "image/jpeg"), CancellationToken.None);

        result.Url.Should().Be("http://upload");
        result.ObjectKey.Should().Contain("originals");
    }
}

