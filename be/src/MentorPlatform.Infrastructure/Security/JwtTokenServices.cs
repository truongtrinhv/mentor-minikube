using MentorPlatform.Application.Identity;
using MentorPlatform.Application.Services.Security;
using MentorPlatform.CrossCuttingConcerns.Caching;
using MentorPlatform.CrossCuttingConcerns.Exceptions;
using MentorPlatform.CrossCuttingConcerns.Helpers;
using MentorPlatform.Domain.Entities;
using MentorPlatform.Domain.Enums;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;

namespace MentorPlatform.Infrastructure.Security;

public class JwtTokenServices : IJwtTokenServices
{
    private readonly IExecutionContext _executionContext;
    private readonly JwtTokenOptions _jwtOptions;
    private readonly IMemoryCache _memoryCache;


    public JwtTokenServices(IOptions<JwtTokenOptions> jwtOptions, IMemoryCache memoryCache,
        IExecutionContext executionContext)
    {
        _memoryCache = memoryCache;
        _executionContext = executionContext;
        _jwtOptions = jwtOptions.Value;
    }

    public string GenerateAccessToken(User user, Guid refreshTokenId)
    {
        RSA rsa = RSA.Create();
        rsa.ImportRSAPrivateKey(Convert.FromBase64String(_jwtOptions.PrivateKey), out _);
        RsaSecurityKey key = new(rsa);
        SigningCredentials credentials = new(key, SecurityAlgorithms.RsaSha256);
        ClaimsIdentity claimsList = new(new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sid, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Jti, refreshTokenId.ToString()),
            new(ClaimTypes.Role, Enum.GetName(typeof(Role), (int)user.Role)!),
        });

        SecurityTokenDescriptor tokenDescriptor = new()
        {
            Subject = claimsList,
            Expires = DateTime.UtcNow.AddMinutes(_jwtOptions.ExpireTokenMinutes),
            Issuer = _jwtOptions.Issuer,
            Audience = _jwtOptions.Audience,
            SigningCredentials = credentials
        };
        JwtSecurityTokenHandler tokenHandler = new();
        SecurityToken? token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        byte[] randomBytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(randomBytes);
    }

    public void RecallAccessToken()
    {
        var key = StringHelper.ReplacePlaceholders(CacheKeyConstants.RecallTokenKey,
            _executionContext.GetUserId().ToString(),
            _executionContext.GetIdentityTokenId().ToString());
        _memoryCache.Set(key, nameof(CacheKeyConstants.RecallTokenKey),
            absoluteExpiration: DateTimeOffset.UtcNow.AddMinutes(_jwtOptions.ExpireTokenMinutes));
    }

    public ClaimsPrincipal ValidateAndDecode(string accessToken)
    {

        RSA rsa = RSA.Create();

        rsa.ImportRSAPublicKey(Convert.FromBase64String(_jwtOptions.PublicKey), out _);

        var key = new RsaSecurityKey(rsa);

        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = key,
            ValidateIssuer = _jwtOptions.ValidateIssuer,
            ValidateAudience = _jwtOptions.ValidateAudience,
            ValidIssuer = _jwtOptions.Issuer,
            ValidAudience = _jwtOptions.Audience,
            ValidateLifetime = false,
        };

        var tokenHandler = new JwtSecurityTokenHandler();

        try
        {
            var principal = tokenHandler.ValidateToken(accessToken, tokenValidationParameters, out SecurityToken validatedToken);
            if (validatedToken is JwtSecurityToken jwtToken && !jwtToken.Header.Alg.Equals(SecurityAlgorithms.RsaSha256, StringComparison.OrdinalIgnoreCase))
            {
                throw new SecurityTokenException(ApplicationExceptionMessage.SignatureAlgorithmJwtTokenInvalid);

            }
            return principal;
        }
        catch
        {
            throw new BadRequestException(ApplicationExceptionMessage.InvalidAccessToken);
        }
    }
}
