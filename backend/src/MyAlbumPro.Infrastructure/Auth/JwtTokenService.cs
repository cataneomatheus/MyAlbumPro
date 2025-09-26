using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using MyAlbumPro.Application.Abstractions.Auth;
using MyAlbumPro.Infrastructure.Configurations;

namespace MyAlbumPro.Infrastructure.Auth;

public sealed class JwtTokenService : ITokenService
{
    private readonly JwtOptions _options;
    private readonly byte[] _signingKey;

    public JwtTokenService(IOptions<JwtOptions> options)
    {
        _options = options.Value;
        _signingKey = Encoding.UTF8.GetBytes(_options.SigningKey);
    }

    public TokenResult Generate(Guid userId, string email, string name, string pictureUrl, IReadOnlyCollection<string> roles)
    {
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, email),
            new Claim(ClaimTypes.Email, email),
            new Claim(JwtRegisteredClaimNames.Name, name),
            new Claim(ClaimTypes.Name, name)
        };

        if (!string.IsNullOrWhiteSpace(pictureUrl))
        {
            claims.Add(new Claim("picture", pictureUrl));
        }

        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var credentials = new SigningCredentials(new SymmetricSecurityKey(_signingKey), SecurityAlgorithms.HmacSha256);
        var expires = DateTimeOffset.UtcNow.AddMinutes(_options.ExpiryMinutes);

        var token = new JwtSecurityToken(
            issuer: _options.Issuer,
            audience: _options.Audience,
            claims: claims,
            expires: expires.UtcDateTime,
            signingCredentials: credentials);

        var tokenValue = new JwtSecurityTokenHandler().WriteToken(token);

        return new TokenResult(tokenValue, expires);
    }
}
