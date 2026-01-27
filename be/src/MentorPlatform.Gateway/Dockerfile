# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project file
COPY MentorPlatform.Gateway/MentorPlatform.Gateway.csproj MentorPlatform.Gateway/

# Restore dependencies
RUN dotnet restore "MentorPlatform.Gateway/MentorPlatform.Gateway.csproj"

# Copy source code
COPY MentorPlatform.Gateway/ MentorPlatform.Gateway/

# Build
WORKDIR /src/MentorPlatform.Gateway
RUN dotnet build "MentorPlatform.Gateway.csproj" -c Release -o /app/build

# Stage 2: Publish
FROM build AS publish
RUN dotnet publish "MentorPlatform.Gateway.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r appuser --gid=1000 && useradd -r -g appuser --uid=1000 --home-dir=/app --shell=/bin/bash appuser

WORKDIR /app

# Copy published files
COPY --from=publish /app/publish .

# Change ownership to non-root user
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080 \
    ASPNETCORE_HTTP_PORTS=8080 \
    DOTNET_RUNNING_IN_CONTAINER=true \
    DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false

# Entry point
ENTRYPOINT ["dotnet", "MentorPlatform.Gateway.dll"]
