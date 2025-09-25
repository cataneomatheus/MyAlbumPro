using FluentValidation;
using MediatR;
using MyAlbumPro.Application.Abstractions.Auth;
using MyAlbumPro.Application.Abstractions.Storage;
using MyAlbumPro.Application.Features.Assets.Dtos;

namespace MyAlbumPro.Application.Features.Assets.Commands;

public record RequestUploadCommand(string FileName, string ContentType) : IRequest<PresignedUploadDto>;

public sealed class RequestUploadCommandValidator : AbstractValidator<RequestUploadCommand>
{
    private static readonly string[] AllowedContentTypes =
    {
        "image/jpeg", "image/png", "image/webp"
    };

    public RequestUploadCommandValidator()
    {
        RuleFor(x => x.FileName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.ContentType)
            .NotEmpty()
            .Must(type => AllowedContentTypes.Contains(type))
            .WithMessage("Unsupported content type");
    }
}

public sealed class RequestUploadCommandHandler : IRequestHandler<RequestUploadCommand, PresignedUploadDto>
{
    private readonly IStorageService _storageService;
    private readonly ICurrentUserService _currentUser;

    public RequestUploadCommandHandler(IStorageService storageService, ICurrentUserService currentUser)
    {
        _storageService = storageService;
        _currentUser = currentUser;
    }

    public async Task<PresignedUploadDto> Handle(RequestUploadCommand request, CancellationToken cancellationToken)
    {
        var objectKey = $"users/{_currentUser.UserId}/originals/{Guid.NewGuid()}";
        var presigned = await _storageService.CreatePresignedUploadAsync(objectKey, request.ContentType, TimeSpan.FromMinutes(10), cancellationToken);
        return new PresignedUploadDto(presigned.Url, presigned.Fields, presigned.ExpiresAt, objectKey);
    }
}
