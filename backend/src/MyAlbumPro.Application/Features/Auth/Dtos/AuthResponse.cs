namespace MyAlbumPro.Application.Features.Auth.Dtos;

public record AuthResponse(string AccessToken, DateTimeOffset ExpiresAt, string Name, string Email, string PictureUrl);
