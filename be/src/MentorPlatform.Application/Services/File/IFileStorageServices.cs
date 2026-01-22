
using MentorPlatform.Application.Commons.Enums;
using Microsoft.AspNetCore.Http;

namespace MentorPlatform.Application.Services.FileStorage;

public interface IFileStorageServices
{
    Task<string> UploadFileAsync(IFormFile fileUploadRequest, string type = UploadType.Default, CancellationToken token = default);
    Task<string> GetPreSignedUrlFile(string filePath, CancellationToken token = default);
    Task DeleteFileAsync(string filePath, CancellationToken token = default);
    string GetOriginFilePathFromFileSignedPath(string filePathSigned);
}
