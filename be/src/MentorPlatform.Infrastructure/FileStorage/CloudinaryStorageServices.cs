using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using MentorPlatform.Application.Commons.Enums;
using MentorPlatform.Application.Services.File;
using MentorPlatform.CrossCuttingConcerns.Exceptions;
using MentorPlatform.CrossCuttingConcerns.Options;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace MentorPlatform.Infrastructure.FileStorage;

public class CloudinaryStorageServices : INamedFileStorageServices
{
    private readonly FileStorageOptions _fileStorageOptions;
    private readonly CloudinaryStorageOptions _cloudinaryStorageOptions;
    private readonly Cloudinary _cloudinary;

    public CloudinaryStorageServices(IOptions<FileStorageOptions> fileStorageOptions, IOptions<CloudinaryStorageOptions> cloudinaryStorageOptions)
    {
        _fileStorageOptions = fileStorageOptions.Value;
        _cloudinaryStorageOptions = cloudinaryStorageOptions.Value;
        _cloudinary = SetupCloudinary();
    }
    public CloudinaryStorageServices(FileStorageOptions fileStorageOptions, CloudinaryStorageOptions cloudinaryStorageOptions)
    {
        _fileStorageOptions = fileStorageOptions;
        _cloudinaryStorageOptions = cloudinaryStorageOptions;
        _cloudinary = SetupCloudinary();
    }

    private Cloudinary SetupCloudinary()
    {
        var account = new Account(
            _cloudinaryStorageOptions.CloudName,
            _cloudinaryStorageOptions.ApiKey,
            _cloudinaryStorageOptions.ApiSecret);

        return new Cloudinary(account);
    }

    public async Task<string> UploadFileAsync(IFormFile fileUploadRequest, string type = UploadType.Default, CancellationToken token = default)
    {
        ValidateFile(fileUploadRequest);
        var uploadResult = await UploadMediaFileAsync(fileUploadRequest, type, token);
        if (type == UploadType.Private) return uploadResult.Format != null ? uploadResult.PublicId + "." + uploadResult.Format : uploadResult.PublicId;
        return uploadResult.SecureUrl.ToString();
    }

    private static void ValidateFile(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            throw new ArgumentException(ApplicationExceptionMessage.InvalidFile);
        }
    }

    public Task<string> GetPreSignedUrlFile(string filePath, CancellationToken token = default)
    {
        var expiresMinutes = _cloudinaryStorageOptions.ExpireSignatureMinutes;
        var expiresAt = DateTime.UtcNow.AddMinutes(expiresMinutes);
        var expiresAtUnixTimestamp = new DateTimeOffset(expiresAt).ToUnixTimeSeconds();

        var fileExtension = Path.GetExtension(filePath).ToLowerInvariant();
        var format = fileExtension.Replace(".", "");

        var resourceType = "raw";
        var publicId = filePath;
        if (_fileStorageOptions.MediaSettings?.Images?.AllowedExtensions != null &&
            _fileStorageOptions.MediaSettings.Images.AllowedExtensions.Contains(fileExtension))
        {
            resourceType = "image";
            publicId = filePath.Split(".").First();
        }
        else if (_fileStorageOptions.MediaSettings?.Videos?.AllowedExtensions != null &&
            _fileStorageOptions.MediaSettings.Videos.AllowedExtensions.Contains(fileExtension))
        {
            resourceType = "video";
            publicId = filePath.Split(".").First();
        }

        var res = _cloudinary.DownloadPrivate(publicId, attachment: true, resourceType: resourceType, format: format, expiresAt: expiresAtUnixTimestamp);
        return Task.FromResult(res);
    }

    public async Task DeleteFileAsync(string filePath, CancellationToken token = default)
    {
        ValidateFilePath(filePath);
        string publicId = ExtractPublicIdFromUrl(filePath);
        var deleteParams = new DeletionParams(publicId);
        var result = await _cloudinary.DestroyAsync(deleteParams);
        CheckErrorDeleteMediaFileResult(result);
    }

    public string GetOriginFilePathFromFileSignedPath(string filePathSigned)
    {
        return filePathSigned;
    }

    private static void ValidateFilePath(string filePath)
    {
        if (string.IsNullOrEmpty(filePath))
        {
            throw new ArgumentException(ApplicationExceptionMessage.InvalidFilePath);
        }
    }

    private Task<RawUploadResult> UploadMediaFileAsync(IFormFile file, string type = UploadType.Default, CancellationToken cancellationToken = default)
    {
        string fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (_fileStorageOptions.MediaSettings?.Images?.AllowedExtensions != null &&
            _fileStorageOptions.MediaSettings.Images.AllowedExtensions.Contains(fileExtension))
        {
            return UploadImageAsync(file, type, cancellationToken);
        }
        else if (_fileStorageOptions.MediaSettings?.Videos?.AllowedExtensions != null &&
                 _fileStorageOptions.MediaSettings.Videos.AllowedExtensions.Contains(fileExtension))
        {
            return UploadVideoAsync(file, type, cancellationToken);
        }
        else if (_fileStorageOptions.MediaSettings?.Documents?.AllowedExtensions != null &&
                _fileStorageOptions.MediaSettings.Documents.AllowedExtensions.Contains(fileExtension))
        {
            return UploadDocumentAsync(file, type, cancellationToken);
        }

        return Task.FromResult(new RawUploadResult());
    }

    private async Task<RawUploadResult> UploadImageAsync(IFormFile file, string type = UploadType.Default, CancellationToken cancellationToken = default)
    {
        var uploadParams = CreateUploadImageParams(file, type);
        var uploadResult = await _cloudinary.UploadAsync(uploadParams, cancellationToken);

        CheckErrorUploadMediaFileResult(uploadResult);

        return uploadResult;
    }
    private async Task<RawUploadResult> UploadVideoAsync(IFormFile file, string type = UploadType.Default, CancellationToken cancellationToken = default)
    {
        var uploadParams = CreateUploadVideoParams(file, type);
        var uploadResult = await _cloudinary.UploadAsync(uploadParams, cancellationToken);

        CheckErrorUploadMediaFileResult(uploadResult);

        return uploadResult;
    }
    private async Task<RawUploadResult> UploadDocumentAsync(IFormFile file, string type = UploadType.Default, CancellationToken cancellationToken = default)
    {
        var uploadParams = CreateUploadDocumentParams(file, type);
        var uploadResult = await _cloudinary.UploadAsync(uploadParams, cancellationToken: cancellationToken);

        CheckErrorUploadMediaFileResult(uploadResult);

        return uploadResult;
    }

    private static void CheckErrorUploadMediaFileResult(RawUploadResult uploadResult)
    {
        if (uploadResult.Error != null)
        {
            throw new UploadFileException(string.Format(ApplicationExceptionMessage.ErrorWhenUpload, uploadResult.Error.Message));
        }
    }
    private static void CheckErrorDeleteMediaFileResult(DeletionResult deleteResult)
    {
        if (deleteResult.Error != null)
        {
            throw new UploadFileException(string.Format(ApplicationExceptionMessage.ErrorWhenDeletingFile, deleteResult.Error.Message));
        }
    }
    private ImageUploadParams CreateUploadImageParams(IFormFile file, string type = UploadType.Default)
    {
        var uploadFolder = _fileStorageOptions.MediaSettings.Images.FolderPath;
        return new ImageUploadParams
        {
            File = new FileDescription(file.FileName, file.OpenReadStream()),
            Folder = uploadFolder,
            UseFilename = true,
            UniqueFilename = true,
            Overwrite = false,
            Type = type
        };
    }
    private VideoUploadParams CreateUploadVideoParams(IFormFile file, string type = UploadType.Default)
    {
        var uploadFolder = _fileStorageOptions.MediaSettings.Videos.FolderPath;
        return new VideoUploadParams
        {
            File = new FileDescription(file.FileName, file.OpenReadStream()),
            Folder = uploadFolder,
            UseFilename = true,
            UniqueFilename = true,
            Overwrite = false,
            Type = type
        };
    }
    private RawUploadParams CreateUploadDocumentParams(IFormFile file, string type = UploadType.Default)
    {
        var uploadFolder = _fileStorageOptions.MediaSettings.Documents.FolderPath;
        return new RawUploadParams
        {
            File = new FileDescription(file.FileName, file.OpenReadStream()),
            Folder = uploadFolder,
            UseFilename = true,
            UniqueFilename = true,
            Overwrite = false,
            Type = type
        };
    }
    private static string ExtractPublicIdFromUrl(string url)
    {
        try
        {
            var uri = new Uri(url);
            var pathSegments = uri.AbsolutePath.Split('/');

            int uploadIndex = Array.IndexOf(pathSegments, UploadType.Default);
            if (uploadIndex >= 0 && pathSegments.Length > uploadIndex + 1)
            {
                string fileName = Path.GetFileNameWithoutExtension(pathSegments[pathSegments.Length - 1]);

                var publicIdSegments = pathSegments
                    .Skip(uploadIndex + 1)
                    .Take(pathSegments.Length - uploadIndex - 2)
                    .ToList();

                publicIdSegments.Add(fileName);
                return string.Join("/", publicIdSegments);
            }
        }
        catch (Exception ex)
        {
            throw new ArgumentException(string.Format(ApplicationExceptionMessage.CouldNotExtractPublicId, url), ex);
        }

        throw new ArgumentException(string.Format(ApplicationExceptionMessage.CouldNotExtractPublicId, url));
    }



    public string ServiceName => nameof(CloudinaryStorageServices);
}