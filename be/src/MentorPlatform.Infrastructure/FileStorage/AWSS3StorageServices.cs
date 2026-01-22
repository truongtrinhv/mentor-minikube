using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using MentorPlatform.Application.Commons.Enums;
using MentorPlatform.Application.Services.File;
using MentorPlatform.CrossCuttingConcerns.Exceptions;
using MentorPlatform.CrossCuttingConcerns.Options;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace MentorPlatform.Infrastructure.FileStorage;

public class AWSS3StorageServices : INamedFileStorageServices
{
    private readonly AWSS3StorageOptions _awsS3StorageOptions;
    private readonly IAmazonS3? _s3;
    private readonly ILogger<AWSS3StorageServices> _logger;

    public AWSS3StorageServices(IAmazonS3? s3, ILogger<AWSS3StorageServices> logger, AWSS3StorageOptions awsS3StorageOptions)
    {
        _s3 = s3;
        _logger = logger;
        _awsS3StorageOptions = awsS3StorageOptions;
    }
    public AWSS3StorageServices(IAmazonS3? s3, ILogger<AWSS3StorageServices> logger, IOptions<AWSS3StorageOptions> awsS3StorageOptions)
    {
        _s3 = s3;
        _logger = logger;
        _awsS3StorageOptions = awsS3StorageOptions.Value;
    }
    public async Task<string> UploadFileAsync(IFormFile fileUploadRequest, string type = UploadType.Default, CancellationToken token = default)
    {
        CheckS3Initialized();

        if (fileUploadRequest == null || fileUploadRequest.Length == 0)
            throw new ArgumentException(ApplicationExceptionMessage.InvalidFile);

        string folderName = GetFolderNameFromFieldName(fileUploadRequest.Name);
        string fileName = Guid.NewGuid() + Path.GetExtension(fileUploadRequest.FileName);
        string keyName = $"{folderName}/{fileName}";

        try
        {
            using var newMemoryStream = new MemoryStream();
            await fileUploadRequest.CopyToAsync(newMemoryStream, token);

            var uploadRequest = new PutObjectRequest
            {
                InputStream = newMemoryStream,
                Key = keyName,
                BucketName = _awsS3StorageOptions.BucketName,
                ContentType = fileUploadRequest.ContentType
            };

            await _s3.PutObjectAsync(uploadRequest, token);

            return keyName;
        }
        catch (AmazonS3Exception ex)
        {
            _logger.LogError(ex, ApplicationExceptionMessage.AWSS3Error);
            return string.Empty;
        }
        catch (AmazonClientException ex)
        {
            _logger.LogError(ex, ApplicationExceptionMessage.AWSClientError);
            return string.Empty;
        }
        catch (AmazonServiceException ex)
        {
            _logger.LogError(ex, ApplicationExceptionMessage.AWSServerError);
            return string.Empty;
        }
    }

    private static string GetFolderNameFromFieldName(string fieldName)
    {
        // TODO: Add folder name logic.
        return fieldName;
    }

    public async Task<string> GetPreSignedUrlFile(string filePath, CancellationToken token = default)
    {
        CheckS3Initialized();

        try
        {
            var urlRequest = new GetPreSignedUrlRequest
            {
                BucketName = _awsS3StorageOptions.BucketName,
                Key = filePath,
            };

            return await _s3.GetPreSignedURLAsync(urlRequest);
        }
        catch (AmazonS3Exception ex)
        {
            _logger.LogError(ex, ApplicationExceptionMessage.AWSS3Error);
            return string.Empty;
        }
        catch (AmazonClientException ex)
        {
            _logger.LogError(ex, ApplicationExceptionMessage.AWSClientError);
            return string.Empty;
        }
        catch (AmazonServiceException ex)
        {
            _logger.LogError(ex, ApplicationExceptionMessage.AWSServerError);
            return string.Empty;
        }
    }

    public async Task DeleteFileAsync(string filePath, CancellationToken token = default)
    {
        CheckS3Initialized();

        try
        {
            var deleteRequest = new DeleteObjectRequest
            {
                BucketName = _awsS3StorageOptions.BucketName,
                Key = filePath
            };

            await _s3.DeleteObjectAsync(deleteRequest, token);
        }
        catch (AmazonS3Exception ex)
        {
            _logger.LogError(ex, ApplicationExceptionMessage.AWSS3Error);
        }
        catch (AmazonClientException ex)
        {
            _logger.LogError(ex, ApplicationExceptionMessage.AWSClientError);
        }
        catch (AmazonServiceException ex)
        {
            _logger.LogError(ex, ApplicationExceptionMessage.AWSServerError);
        }
    }

    public string GetOriginFilePathFromFileSignedPath(string filePathSigned)
    {
        return filePathSigned;
    }

    private void CheckS3Initialized()
    {
        if (_s3 == null)
        {
            throw new ArgumentNullException(ApplicationExceptionMessage.AWSS3UninitializedError);
        }
    }

    public string GenerateSignedDeliveryUrl(string publicId)
    {
        throw new NotImplementedException();
    }

    public string ServiceName => nameof(AWSS3StorageServices);
}
