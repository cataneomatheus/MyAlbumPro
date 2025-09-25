using Xunit;
using FluentAssertions;
using Moq;
using MyAlbumPro.Application.Abstractions.Auth;
using MyAlbumPro.Application.Features.Auth.Commands;

namespace MyAlbumPro.ApplicationTests;

public class GoogleSignInCommandHandlerTests
{
    private readonly Mock<IGoogleAuthService> _googleAuth = new();
    private readonly Mock<ITokenService> _tokenService = new();

    [Fact]
    public async Task Handle_ReturnsToken()
    {
        var handler = new GoogleSignInCommandHandler(_googleAuth.Object, _tokenService.Object);
        _googleAuth.Setup(x => x.ValidateIdTokenAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new GoogleUserPayload("sub", "user@example.com", "User", "pic"));
        _tokenService.Setup(x => x.Generate(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<IReadOnlyCollection<string>>()))
            .Returns(new TokenResult("jwt", DateTimeOffset.UtcNow.AddHours(1)));

        var response = await handler.Handle(new GoogleSignInCommand("token"), CancellationToken.None);

        response.AccessToken.Should().Be("jwt");
        response.Email.Should().Be("user@example.com");
    }
}

