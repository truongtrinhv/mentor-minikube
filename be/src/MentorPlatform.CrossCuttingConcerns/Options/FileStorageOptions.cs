
namespace MentorPlatform.CrossCuttingConcerns.Options;

public class FileStorageOptions
{
    public string FileStorageProvider { get; set; } = default!;
    public MediaSettings MediaSettings { get; set; } = default!;
    public AWSS3StorageOptions? AWSS3StorageOptions { get; set; } = default;
    public CloudinaryStorageOptions? CloudinaryStorageOptions { get; set; } = default;

}

public class MediaSettings
{
    public ImageSettings Images { get; set; } = default!;
    public VideoSettings Videos { get; set; } = default!;
    public DocumentSettings Documents { get; set; } = default!;
}

public class ImageSettings
{
    public string[] AllowedExtensions { get; set; } = default!;
    public long MaxSizeBytes { get; set; } = default!;
    public string FolderPath { get; set; } = default!;
}

public class VideoSettings
{
    public string[] AllowedExtensions { get; set; } = default!;
    public long MaxSizeBytes { get; set; } = default!;
    public string FolderPath { get; set; } = default!;
}

public class DocumentSettings
{
    public string[] AllowedExtensions { get; set; } = default!;
    public long MaxSizeBytes { get; set; } = default!;
    public string FolderPath { get; set; } = default!;
}