using FluentValidation;
using MapsterMapper;
using MediatR;
using MyAlbumPro.Application.Abstractions.Auth;
using MyAlbumPro.Application.Abstractions.Persistence;
using MyAlbumPro.Application.Features.Assets.Dtos;
using MyAlbumPro.Domain.Entities;

namespace MyAlbumPro.Application.Features.Assets.Commands;

public record IngestAssetCommand(
    string ObjectKey,
    string FileName,
    string MimeType,
    int Width,
    int Height,
    long Bytes,
    string ThumbnailKey) : IRequest<AssetDto>;

public sealed class IngestAssetCommandValidator : AbstractValidator<IngestAssetCommand>
{
    public IngestAssetCommandValidator()
    {
        RuleFor(x => x.ObjectKey).NotEmpty();
        RuleFor(x => x.FileName).NotEmpty();
        RuleFor(x => x.MimeType).NotEmpty();
        RuleFor(x => x.Width).GreaterThan(0);
        RuleFor(x => x.Height).GreaterThan(0);
        RuleFor(x => x.Bytes).GreaterThan(0);
        RuleFor(x => x.ThumbnailKey).NotEmpty();
    }
}

public sealed class IngestAssetCommandHandler : IRequestHandler<IngestAssetCommand, AssetDto>
{
    private readonly IAssetRepository _assetRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;
    private readonly IMapper _mapper;

    public IngestAssetCommandHandler(
        IAssetRepository assetRepository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUser,
        IMapper mapper)
    {
        _assetRepository = assetRepository;
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
        _mapper = mapper;
    }

    public async Task<AssetDto> Handle(IngestAssetCommand request, CancellationToken cancellationToken)
    {
        var asset = Asset.Create(
            Guid.NewGuid(),
            _currentUser.UserId,
            request.FileName,
            request.MimeType,
            request.ObjectKey,
            request.ThumbnailKey,
            request.Width,
            request.Height,
            request.Bytes);

        await _assetRepository.AddAsync(asset, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<AssetDto>(asset);
    }
}
