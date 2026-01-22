# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy project files
COPY ["MentorPlatform.API/MentorPlatform.WebApi.csproj", "MentorPlatform.API/"]
COPY ["MentorPlatform.Application/MentorPlatform.Application.csproj", "MentorPlatform.Application/"]
COPY ["MentorPlatform.CrossCuttingConcerns/MentorPlatform.CrossCuttingConcerns.csproj", "MentorPlatform.CrossCuttingConcerns/"]
COPY ["MentorPlatform.Infrastructure/MentorPlatform.Infrastructure.csproj", "MentorPlatform.Infrastructure/"]
COPY ["MentorPlatform.Persistence/MentorPlatform.Persistence.csproj", "MentorPlatform.Persistence/"]
COPY ["MentorPlatform.Domain/MentorPlatform.Domain.csproj", "MentorPlatform.Domain/"]

# Restore dependencies with retry logic
RUN dotnet nuget locals all --clear || true
RUN for i in 1 2 3; do dotnet restore "MentorPlatform.API/MentorPlatform.WebApi.csproj" --disable-parallel && break || sleep 5; done

# Copy all source code
COPY . .

# Build the application
WORKDIR "/src/MentorPlatform.API"
RUN dotnet build "MentorPlatform.WebApi.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "MentorPlatform.WebApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Copy published app
COPY --from=publish /app/publish .

# Change ownership
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

ENTRYPOINT ["dotnet", "MentorPlatform.WebApi.dll"]
