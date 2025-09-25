namespace MyAlbumPro.Application.Features.Assets.Dtos;

public record PresignedUploadDto(string Url, IDictionary<string, string> Fields, DateTimeOffset ExpiresAt, string ObjectKey);
