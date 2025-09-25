namespace MyAlbumPro.Application.Abstractions.Auth;

public record GoogleUserPayload(string Sub, string Email, string Name, string Picture);

public interface IGoogleAuthService
{
    Task<GoogleUserPayload> ValidateIdTokenAsync(string idToken, CancellationToken cancellationToken = default);
}
