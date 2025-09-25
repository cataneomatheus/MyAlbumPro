using Xunit;
using Mapster;
using MapsterMapper;
using MyAlbumPro.Application.Mappings;

namespace MyAlbumPro.ApplicationTests;

public static class MapperFixture
{
    public static IMapper CreateMapper()
    {
        var config = TypeAdapterConfig.GlobalSettings.Clone();
        new ProjectMappingConfig().Register(config);
        return new Mapper(config);
    }
}

