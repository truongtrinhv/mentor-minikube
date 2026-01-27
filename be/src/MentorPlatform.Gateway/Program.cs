using System.Threading.RateLimiting;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Polly;
using Polly.CircuitBreaker;
using Polly.Extensions.Http;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Add Rate Limiting
var rateLimitConfig = builder.Configuration.GetSection("RateLimiting:FixedWindow");
builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
    {
        return RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = rateLimitConfig.GetValue<int>("PermitLimit", 100),
                Window = TimeSpan.Parse(rateLimitConfig.GetValue<string>("Window", "00:01:00")!),
                QueueLimit = rateLimitConfig.GetValue<int>("QueueLimit", 10),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst
            });
    });

    options.OnRejected = async (context, cancellationToken) =>
    {
        context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
        await context.HttpContext.Response.WriteAsync(
            "Too many requests. Please try again later.",
            cancellationToken);
    };
});

// Add Health Checks
builder.Services.AddHealthChecks();

// Add OpenTelemetry for observability
builder.Services.AddOpenTelemetry()
    .ConfigureResource(resource => resource.AddService("MentorPlatform.Gateway"))
    .WithMetrics(metrics =>
    {
        metrics
            .AddAspNetCoreInstrumentation()
            .AddHttpClientInstrumentation()
            .AddRuntimeInstrumentation()
            .AddPrometheusExporter();
    })
    .WithTracing(tracing =>
    {
        tracing
            .AddAspNetCoreInstrumentation()
            .AddHttpClientInstrumentation()
            .AddConsoleExporter();
    });

// Add HttpClient with Polly Circuit Breaker
var circuitBreakerConfig = builder.Configuration.GetSection("CircuitBreaker");
builder.Services.AddHttpClient("resilient-client")
    .AddPolicyHandler(GetCircuitBreakerPolicy(circuitBreakerConfig));

// Configure Kestrel
builder.WebHost.ConfigureKestrel(options =>
{
    options.AddServerHeader = false;
    options.Limits.MaxRequestBodySize = 52428800; // 50 MB
    options.Limits.MaxConcurrentConnections = 100;
    options.Limits.MaxConcurrentUpgradedConnections = 100;
    options.Limits.KeepAliveTimeout = TimeSpan.FromMinutes(2);
    options.Limits.RequestHeadersTimeout = TimeSpan.FromSeconds(30);
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

// Security Headers
app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["X-XSS-Protection"] = "1; mode=block";
    context.Response.Headers["Referrer-Policy"] = "no-referrer";
    context.Response.Headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()";
    await next();
});

// Enable CORS
app.UseCors();

// Enable Rate Limiting
app.UseRateLimiter();

// Health Check Endpoint
app.MapHealthChecks("/health");

// Prometheus Metrics Endpoint
app.MapPrometheusScrapingEndpoint();

// Map Reverse Proxy
app.MapReverseProxy(proxyPipeline =>
{
    // Add custom middleware to the proxy pipeline if needed
    proxyPipeline.Use(async (context, next) =>
    {
        var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
        logger.LogInformation("Proxying request to: {Path}", context.Request.Path);
        await next();
    });
});

app.Run();

// Helper method to create Circuit Breaker Policy
static IAsyncPolicy<HttpResponseMessage> GetCircuitBreakerPolicy(IConfigurationSection config)
{
    var failureThreshold = config.GetValue<double>("FailureThreshold", 0.5);
    var samplingDuration = TimeSpan.Parse(config.GetValue<string>("SamplingDuration", "00:00:30")!);
    var minimumThroughput = config.GetValue<int>("MinimumThroughput", 10);
    var breakDuration = TimeSpan.Parse(config.GetValue<string>("BreakDuration", "00:00:30")!);

    return HttpPolicyExtensions
        .HandleTransientHttpError()
        .OrResult(msg => msg.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
        .AdvancedCircuitBreakerAsync(
            failureThreshold: failureThreshold,
            samplingDuration: samplingDuration,
            minimumThroughput: minimumThroughput,
            durationOfBreak: breakDuration,
            onBreak: (result, duration) =>
            {
                Console.WriteLine($"Circuit breaker opened for {duration.TotalSeconds}s");
            },
            onReset: () =>
            {
                Console.WriteLine("Circuit breaker reset");
            },
            onHalfOpen: () =>
            {
                Console.WriteLine("Circuit breaker half-open");
            });
}
