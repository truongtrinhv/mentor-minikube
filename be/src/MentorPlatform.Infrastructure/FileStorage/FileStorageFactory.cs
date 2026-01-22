
using MentorPlatform.Application.Services.File;
using MentorPlatform.Application.Services.FileStorage;
using MentorPlatform.CrossCuttingConcerns.Exceptions;
using MentorPlatform.CrossCuttingConcerns.Helpers;
using MentorPlatform.CrossCuttingConcerns.Options;
using Microsoft.Extensions.Options;

namespace MentorPlatform.Infrastructure.FileStorage;

public class FileStorageFactory : IFileStorageFactory
{
    private readonly IReadOnlyDictionary<string, IFileStorageServices> _map;
    private readonly FileStorageOptions _fileStorageOptions;
    public FileStorageFactory(IEnumerable<INamedFileStorageServices> services, IOptions<FileStorageOptions> fileStorageOptions)
    {
        _fileStorageOptions = fileStorageOptions.Value;
        _map = services
            .ToDictionary(s => s.ServiceName, s => (IFileStorageServices)s,
                StringComparer.OrdinalIgnoreCase);
    }

    public IFileStorageServices Get(string provider)
    {
        if (_map.TryGetValue(provider, out var svc))
            return svc;
        throw new ArgumentException(StringHelper.ReplacePlaceholders(
                            ApplicationExceptionMessage.UnknownStorageProvider, 
                            provider));
    }

    public IFileStorageServices Get()
    {
        if (_map.TryGetValue(_fileStorageOptions.FileStorageProvider, out var svc))
            return svc;
        throw new ArgumentException(StringHelper.ReplacePlaceholders(
            ApplicationExceptionMessage.UnknownStorageProvider,
            _fileStorageOptions.FileStorageProvider));
    }
}
