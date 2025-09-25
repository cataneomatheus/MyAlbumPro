﻿namespace MyAlbumPro.Application.Abstractions.Auth;

public interface ICurrentUserService
{
    Guid UserId { get; }
    string Email { get; }
    string Name { get; }
    bool IsAuthenticated { get; }
}
