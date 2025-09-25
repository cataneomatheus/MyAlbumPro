using Mapster;
using MyAlbumPro.Application.Features.Assets.Dtos;
using MyAlbumPro.Application.Features.Layouts.Dtos;
using MyAlbumPro.Application.Features.Projects.Dtos;
using MyAlbumPro.Domain.Entities;
using MyAlbumPro.Domain.ValueObjects;

namespace MyAlbumPro.Application.Mappings;

public sealed class ProjectMappingConfig : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.ForType<Project, ProjectDto>()
            .Map(dest => dest.ProjectId, src => src.Id)
            .Map(dest => dest.Title, src => src.Title)
            .Map(dest => dest.OwnerId, src => src.OwnerId)
            .Map(dest => dest.AlbumSize, src => src.AlbumSize.Code)
            .Map(dest => dest.Pages, src => src.Pages)
            .Map(dest => dest.CreatedAt, src => src.CreatedAt)
            .Map(dest => dest.UpdatedAt, src => src.UpdatedAt);

        config.ForType<Page, PageDto>()
            .Map(dest => dest.PageId, src => src.Id)
            .Map(dest => dest.Index, src => src.Index)
            .Map(dest => dest.LayoutId, src => src.LayoutId)
            .Map(dest => dest.Slots, src => src.Slots);

        config.ForType<PageSlot, SlotDto>()
            .Map(dest => dest.SlotId, src => src.SlotId)
            .Map(dest => dest.AssetId, src => src.Placement != null ? src.Placement.AssetId : (Guid?)null)
            .Map(dest => dest.OffsetX, src => src.Placement != null ? src.Placement.OffsetX : 0)
            .Map(dest => dest.OffsetY, src => src.Placement != null ? src.Placement.OffsetY : 0)
            .Map(dest => dest.Scale, src => src.Placement != null ? src.Placement.Scale : 1);

        config.ForType<Layout, LayoutDto>()
            .Map(dest => dest.Id, src => src.Id)
            .Map(dest => dest.Name, src => src.Name)
            .Map(dest => dest.Slots, src => src.Slots);

        config.ForType<LayoutSlotDefinition, LayoutSlotDto>()
            .Map(dest => dest.SlotId, src => src.SlotId)
            .Map(dest => dest.X, src => src.BoundingBox.X)
            .Map(dest => dest.Y, src => src.BoundingBox.Y)
            .Map(dest => dest.Width, src => src.BoundingBox.Width)
            .Map(dest => dest.Height, src => src.BoundingBox.Height);

        config.ForType<Asset, AssetDto>()
            .Map(dest => dest.AssetId, src => src.Id)
            .Map(dest => dest.FileName, src => src.FileName)
            .Map(dest => dest.MimeType, src => src.MimeType)
            .Map(dest => dest.S3Key, src => src.S3Key)
            .Map(dest => dest.ThumbKey, src => src.ThumbKey)
            .Map(dest => dest.Width, src => src.Width)
            .Map(dest => dest.Height, src => src.Height)
            .Map(dest => dest.Bytes, src => src.Bytes)
            .Map(dest => dest.ThumbnailUrl, src => string.Empty);
    }
}
