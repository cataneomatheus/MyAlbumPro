namespace MyAlbumPro.Application.Abstractions.Observability;

public interface ICorrelationIdProvider
{
    string GetCorrelationId();
}
