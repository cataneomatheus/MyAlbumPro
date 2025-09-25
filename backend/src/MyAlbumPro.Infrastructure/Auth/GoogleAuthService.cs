using Google.Apis.Auth;
using Microsoft.Extensions.Options;
using MyAlbumPro.Application.Abstractions.Auth;
using MyAlbumPro.Infrastructure.Configurations;

namespace MyAlbumPro.Infrastructure.Auth;

public sealed class GoogleAuthService : IGoogleAuthService
{
    private readonly GoogleOptions _options;

    public GoogleAuthService(IOptions<GoogleOptions> options)
    {
        _options = options.Value;
    }

    public async Task<GoogleUserPayload> ValidateIdTokenAsync(string idToken, CancellationToken cancellationToken = default)
    {
        var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, new GoogleJsonWebSignature.ValidationSettings
        {
            Audience = new List<string> { _options.ClientId }
        });

        return new GoogleUserPayload(payload.Subject, payload.Email, payload.Name, payload.Picture ?? string.Empty);
    }
}
