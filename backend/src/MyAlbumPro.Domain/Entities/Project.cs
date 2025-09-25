using MyAlbumPro.Domain.Common;
using MyAlbumPro.Domain.ValueObjects;

namespace MyAlbumPro.Domain.Entities;

public sealed class Project : Entity
{
    private readonly List<Page> _pages = new();
    private Project() : base(Guid.Empty) { }

    private Project(
        Guid id,
        Guid ownerId,
        string title,
        AlbumSize albumSize,
        IEnumerable<Page> pages)
        : base(id)
    {
        OwnerId = ownerId;
        Title = title;
        AlbumSize = albumSize;
        _pages.AddRange(pages);
        UpdatedAt = DateTimeOffset.UtcNow;
        CreatedAt = DateTimeOffset.UtcNow;
    }

    public Guid OwnerId { get; }

    public string Title { get; private set; } = string.Empty;

    public AlbumSize AlbumSize { get; private set; } = null!;

    public IReadOnlyCollection<Page> Pages => _pages.AsReadOnly();

    public DateTimeOffset CreatedAt { get; }

    public DateTimeOffset UpdatedAt { get; private set; }

    public static Project Create(Guid id, Guid ownerId, string title, AlbumSize albumSize, IEnumerable<Page> pages)
    {
        if (ownerId == Guid.Empty)
        {
            throw new ArgumentException("Owner id must be valid.", nameof(ownerId));
        }

        if (string.IsNullOrWhiteSpace(title))
        {
            throw new ArgumentException("Title must be provided", nameof(title));
        }

        return new Project(id, ownerId, title.Trim(), albumSize, pages);
    }

    public void Rename(string newTitle)
    {
        if (string.IsNullOrWhiteSpace(newTitle))
        {
            throw new ArgumentException("Title must be provided", nameof(newTitle));
        }

        Title = newTitle.Trim();
        Touch();
    }

    public void ChangeAlbumSize(AlbumSize albumSize)
    {
        AlbumSize = albumSize;
        Touch();
    }

    public void ReplacePages(IEnumerable<Page> pages)
    {
        _pages.Clear();
        _pages.AddRange(pages);
        Touch();
    }

    public Page? GetPage(Guid pageId) => _pages.FirstOrDefault(p => p.Id == pageId);

    private void Touch() => UpdatedAt = DateTimeOffset.UtcNow;
}


