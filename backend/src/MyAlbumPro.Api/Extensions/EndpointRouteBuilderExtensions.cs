using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Hosting;
using MyAlbumPro.Application.Abstractions.Auth;
using MyAlbumPro.Application.Abstractions.Storage;
using MyAlbumPro.Application.Common.Utilities;
using MyAlbumPro.Application.Features.Albums.Queries;
using MyAlbumPro.Application.Features.Assets.Commands;
using MyAlbumPro.Application.Features.Assets.Queries;
using MyAlbumPro.Application.Features.Auth.Commands;
using MyAlbumPro.Application.Features.Auth.Dtos;
using MyAlbumPro.Application.Features.Layouts.Queries;
using MyAlbumPro.Application.Features.Projects.Commands;
using MyAlbumPro.Application.Features.Projects.Queries;

namespace MyAlbumPro.Api.Extensions;

public static class EndpointRouteBuilderExtensions
{
    public static IEndpointRouteBuilder MapApiEndpoints(this IEndpointRouteBuilder builder, IWebHostEnvironment environment)
    {
        builder.MapPost("/auth/google/callback", async (GoogleSignInCommand command, IMediator mediator) =>
        {
            var response = await mediator.Send(command);
            return Results.Ok(response);
        });

        if (environment.IsDevelopment())
        {
            builder.MapPost("/auth/dev-login", (DevLoginRequest request, ITokenService tokenService) =>
            {
                var email = string.IsNullOrWhiteSpace(request.Email)
                    ? "dev@local.test"
                    : request.Email.Trim().ToLowerInvariant();

                var name = string.IsNullOrWhiteSpace(request.Name)
                    ? "Desenvolvedor"
                    : request.Name.Trim();

                var userId = DeterministicGuid.FromString(email);
                var token = tokenService.Generate(userId, email, name, string.Empty, Array.Empty<string>());

                return Results.Ok(new AuthResponse(userId, token.AccessToken, token.ExpiresAt, name, email, string.Empty));
            });
        }

        builder.MapPost("/auth/signout", () => Results.NoContent())
            .RequireAuthorization();

        builder.MapGet("/me", (ICurrentUserService currentUser) =>
        {
            if (!currentUser.IsAuthenticated)
            {
                return Results.Unauthorized();
            }

            return Results.Ok(new
            {
                currentUser.UserId,
                currentUser.Email,
                currentUser.Name,
                PictureUrl = currentUser.PictureUrl
            });
        }).RequireAuthorization();

        builder.MapGet("/albums/sizes", async (IMediator mediator) =>
        {
            var sizes = await mediator.Send(new GetAlbumSizesQuery());
            return Results.Ok(sizes);
        }).RequireAuthorization();

        builder.MapGet("/layouts", async (IMediator mediator) =>
        {
            var layouts = await mediator.Send(new GetLayoutsQuery());
            return Results.Ok(layouts);
        }).RequireAuthorization();

        builder.MapGroup("/projects")
            .RequireAuthorization()
            .MapProjectsEndpoints();

        builder.MapGroup("/assets")
            .RequireAuthorization()
            .MapAssetsEndpoints();

        builder.MapPost("/uploads/presign", async (RequestUploadCommand command, IMediator mediator) =>
        {
            var result = await mediator.Send(command);
            return Results.Ok(result);
        }).RequireAuthorization();

        builder.MapGet("/assets/{assetId:guid}/thumbnail", async (Guid assetId, IMediator mediator, IStorageService storageService, CancellationToken cancellationToken) =>
        {
            var assets = await mediator.Send(new ListAssetsQuery(), cancellationToken);
            var asset = assets.FirstOrDefault(a => a.AssetId == assetId);
            if (asset is null)
            {
                return Results.NotFound();
            }

            var url = await storageService.GetPresignedDownloadAsync(asset.ThumbKey, TimeSpan.FromMinutes(5), cancellationToken);
            return Results.Redirect(url);
        }).RequireAuthorization();

        return builder;
    }

    private static IEndpointRouteBuilder MapProjectsEndpoints(this IEndpointRouteBuilder builder)
    {
        builder.MapGet(string.Empty, async (IMediator mediator) =>
        {
            var items = await mediator.Send(new ListProjectsQuery());
            return Results.Ok(items);
        });

        builder.MapPost(string.Empty, async (CreateProjectCommand command, IMediator mediator) =>
        {
            var project = await mediator.Send(command);
            return Results.Created($"/projects/{project.ProjectId}", project);
        });

        builder.MapGet("/{projectId:guid}", async (Guid projectId, IMediator mediator) =>
        {
            var project = await mediator.Send(new GetProjectQuery(projectId));
            return Results.Ok(project);
        });

        builder.MapPut("/{projectId:guid}", async (Guid projectId, UpdateProjectCommand command, IMediator mediator) =>
        {
            if (projectId != command.ProjectId)
            {
                return Results.BadRequest("Mismatched project identifier");
            }

            var project = await mediator.Send(command);
            return Results.Ok(project);
        });

        builder.MapPost("/{projectId:guid}/autofill", async (Guid projectId, IMediator mediator) =>
        {
            var project = await mediator.Send(new AutofillProjectCommand(projectId));
            return Results.Ok(project);
        });

        return builder;
    }

    private static IEndpointRouteBuilder MapAssetsEndpoints(this IEndpointRouteBuilder builder)
    {
        builder.MapGet(string.Empty, async (IMediator mediator) =>
        {
            var items = await mediator.Send(new ListAssetsQuery());
            return Results.Ok(items);
        });

        builder.MapPost(string.Empty, async (IngestAssetCommand command, IMediator mediator) =>
        {
            var asset = await mediator.Send(command);
            return Results.Created($"/assets/{asset.AssetId}", asset);
        });

        return builder;
    }
}

public sealed record DevLoginRequest(string Email, string Name);
