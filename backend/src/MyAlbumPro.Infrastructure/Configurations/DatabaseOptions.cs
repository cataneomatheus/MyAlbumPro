﻿namespace MyAlbumPro.Infrastructure.Configurations;

public sealed class DatabaseOptions
{
    public const string SectionName = "Database";

    public string ConnectionString { get; set; } = string.Empty;
}
