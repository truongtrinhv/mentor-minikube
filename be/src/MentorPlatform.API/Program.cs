using MentorPlatform.Application.Services.Caching;
using MentorPlatform.Application.Services.Security;
using MentorPlatform.CrossCuttingConcerns.Options;
using MentorPlatform.WebApi.Extensions;
using MentorPlatform.WebApi.Hubs;
using MentorPlatform.WebApi.Middlewares;
using MentorPlatform.WebApi.OpenApi;
using MentorPlatform.WebApi.Options;
using MentorPlatform.WebApi.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using RazorLight;
using System.Reflection;
using System.Security.Cryptography;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddSwaggerGen(SwaggerGenOptionsConfig.ConfigureSwaggerGenOptions);
builder.Services.AddOpenApi();

builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.ConfigureEntireLayers(builder.Configuration);

var assembly = Assembly.GetExecutingAssembly();
builder.Services.AddSingleton<IRazorLightEngine>(provider =>
    new RazorLightEngineBuilder()
        .UseEmbeddedResourcesProject(assembly, "MentorPlatform.WebApi")
        .UseMemoryCachingProvider()
        .Build()
);
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;

}).AddJwtBearer(options =>
{
    var jwtTokenOptions = new JwtTokenOptions();
    builder.Configuration.GetRequiredSection(nameof(JwtTokenOptions)).Bind(jwtTokenOptions);
    var rsa = RSA.Create();
    rsa.ImportRSAPublicKey(Convert.FromBase64String(jwtTokenOptions.PublicKey), out _);

    options.RequireHttpsMetadata = jwtTokenOptions.RequireHttpsMetadata;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = jwtTokenOptions.ValidateIssuer,
        ValidateAudience = jwtTokenOptions.ValidateAudience,
        ValidIssuer = jwtTokenOptions.Issuer,
        ValidAudience = jwtTokenOptions.Audience,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new RsaSecurityKey(rsa),
        ClockSkew = TimeSpan.Zero
    };

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];

            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) &&
                (path.StartsWithSegments("/hubs/live")))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

var corsOptions = new CorsOptions();
builder.Configuration.GetRequiredSection(nameof(CorsOptions)).Bind(corsOptions);
builder.Services.AddCors(opt =>
{
    opt.AddPolicy(corsOptions.PolicyName!, p =>
    {
        p.WithOrigins(corsOptions.AllowedOrigins!)
            .AllowAnyHeader()
            .AllowAnyMethod();
        if (corsOptions.AllowCredentials)
            p.AllowCredentials();
        else
            p.DisallowCredentials();
    });
});
builder.Services.AddExceptionHandler<GlobalHandlingExceptionMiddleware>();

// Memory Cache
builder.Services.AddMemoryCache();

// Redis Distributed Cache
var redisEnabled = builder.Configuration.GetValue<bool>("RedisOptions:Enabled");
if (redisEnabled)
{
    var redisConnection = builder.Configuration.GetConnectionString("Redis");
    var instanceName = builder.Configuration.GetValue<string>("RedisOptions:InstanceName") ?? "MentorPlatform:";
    
    // Register ConnectionMultiplexer for advanced Redis operations
    builder.Services.AddSingleton<StackExchange.Redis.IConnectionMultiplexer>(sp =>
    {
        return StackExchange.Redis.ConnectionMultiplexer.Connect(redisConnection!);
    });
    
    builder.Services.AddStackExchangeRedisCache(options =>
    {
        options.Configuration = redisConnection;
        options.InstanceName = instanceName;
    });
}
else
{
    builder.Services.AddDistributedMemoryCache();
}

// Register distributed cache service
builder.Services.AddScoped<IDistributedCacheService, DistributedCacheService>();

// Configure Cache TTL Options
builder.Services.Configure<CacheTTLOptions>(builder.Configuration.GetSection("CacheTTLOptions"));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
var app = builder.Build();

// Initialize CacheConfiguration with options
var cacheTTLOptions = app.Services.GetRequiredService<IOptions<CacheTTLOptions>>();
CacheConfiguration.Initialize(cacheTTLOptions);

app.UseCors(corsOptions.PolicyName);

app.UseCors(corsOptions.PolicyName);
app.UseExceptionHandler((_) => { });

await app.InitializeDatabaseAsync();
app.MapOpenApi();
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Mentor Platform API Swagger");
    c.RoutePrefix = string.Empty;
});

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<ExecutionContextMiddleware>();
app.MapControllers();
app.MapHub<LiveHub>("/hubs/live");
await app.RunAsync();

