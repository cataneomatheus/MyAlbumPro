using FluentValidation;
using MediatR;
using MyAlbumPro.Application.Abstractions.Auth;
using MyAlbumPro.Application.Common.Utilities;
using MyAlbumPro.Application.Features.Auth.Dtos;

namespace MyAlbumPro.Application.Features.Auth.Commands;

public record GoogleSignInCommand(string IdToken) : IRequest<AuthResponse>;

public sealed class GoogleSignInCommandValidator : AbstractValidator<GoogleSignInCommand>
{
    public GoogleSignInCommandValidator()
    {
        RuleFor(x => x.IdToken).NotEmpty();
    }
}

public sealed class GoogleSignInCommandHandler : IRequestHandler<GoogleSignInCommand, AuthResponse>
{
    private readonly IGoogleAuthService _googleAuthService;
    private readonly ITokenService _tokenService;

    public GoogleSignInCommandHandler(IGoogleAuthService googleAuthService, ITokenService tokenService)
    {
        _googleAuthService = googleAuthService;
        _tokenService = tokenService;
    }

    public async Task<AuthResponse> Handle(GoogleSignInCommand request, CancellationToken cancellationToken)
    {
        var payload = await _googleAuthService.ValidateIdTokenAsync(request.IdToken, cancellationToken);

        var userId = DeterministicGuid.FromString(payload.Sub);
        var token = _tokenService.Generate(userId, payload.Email, payload.Name, payload.Picture, Array.Empty<string>());

        return new AuthResponse(userId, token.AccessToken, token.ExpiresAt, payload.Name, payload.Email, payload.Picture);
    }
}
