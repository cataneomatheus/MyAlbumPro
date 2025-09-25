using Microsoft.AspNetCore.Http;
using MyAlbumPro.Application.Abstractions.Observability;

namespace MyAlbumPro.Infrastructure.Services;

public sealed class CorrelationIdProvider : ICorrelationIdProvider
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CorrelationIdProvider(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string GetCorrelationId()
    {
        var context = _httpContextAccessor.HttpContext;
        if (context is null)
        {
            return Guid.NewGuid().ToString();
        }

        if (context.Request.Headers.TryGetValue("X-Correlation-ID", out var values))
        {
            return values.ToString();
        }

        return context.TraceIdentifier;
    }
}
