namespace MyAlbumPro.Application.Abstractions.Auth;

public record TokenResult(string AccessToken, DateTimeOffset ExpiresAt, string RefreshToken = "");

public interface ITokenService
{
    TokenResult Generate(Guid userId, string email, string name, string pictureUrl, IReadOnlyCollection<string> roles);
}
