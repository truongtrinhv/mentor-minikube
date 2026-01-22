
using MentorPlatform.Application.Services.FileStorage;

namespace MentorPlatform.Application.Services.File;

public interface INamedFileStorageServices : IFileStorageServices
{
    string ServiceName { get; }
}
