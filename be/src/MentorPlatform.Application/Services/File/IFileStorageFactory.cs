
using MentorPlatform.Application.Services.FileStorage;

namespace MentorPlatform.Application.Services.File;

public interface IFileStorageFactory
{
    IFileStorageServices Get(string provider);
    IFileStorageServices Get();
}
