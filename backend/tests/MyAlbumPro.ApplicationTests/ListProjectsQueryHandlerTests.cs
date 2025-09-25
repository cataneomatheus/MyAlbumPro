using Xunit;
using FluentAssertions;
using MapsterMapper;
using Moq;
using MyAlbumPro.Application.Abstractions.Auth;
using MyAlbumPro.Application.Abstractions.Persistence;
using MyAlbumPro.Application.Features.Projects.Queries;
using MyAlbumPro.Domain.Entities;
using MyAlbumPro.Domain.ValueObjects;

namespace MyAlbumPro.ApplicationTests;

public class ListProjectsQueryHandlerTests
{
    private readonly Mock<IProjectRepository> _projectRepository = new();
    private readonly Mock<ICurrentUserService> _currentUser = new();
    private readonly IMapper _mapper = MapperFixture.CreateMapper();

    public ListProjectsQueryHandlerTests()
    {
        _currentUser.SetupGet(x => x.UserId).Returns(Guid.NewGuid());
        var layout = Layout.CreatePreset(Guid.NewGuid(), "single", new[]
        {
            LayoutSlotDefinition.Create("slot", BoundingBox.Create(0, 0, 1, 1))
        });
        var page = Page.Create(Guid.NewGuid(), 0, layout.Id, layout.Slots.Select(s => s.SlotId));
        var project = Project.Create(Guid.NewGuid(), _currentUser.Object.UserId, "Album", AlbumSize.Presets.First(), new[] { page });
        _projectRepository.Setup(x => x.ListByOwnerAsync(_currentUser.Object.UserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Project> { project });
    }

    [Fact]
    public async Task Handle_ReturnsProjects()
    {
        var handler = new ListProjectsQueryHandler(_projectRepository.Object, _currentUser.Object, _mapper);
        var result = await handler.Handle(new ListProjectsQuery(), CancellationToken.None);
        result.Should().HaveCount(1);
    }
}

