namespace MyAlbumPro.Application.Abstractions.Auth;

public interface ICurrentUserService
{
    Guid UserId { get; }
    string Email { get; }
    string Name { get; }
    string PictureUrl { get; }
    bool IsAuthenticated { get; }
}
