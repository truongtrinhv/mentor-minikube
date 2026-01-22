namespace MentorPlatform.CrossCuttingConcerns.Options;

public class CloudinaryStorageOptions
{
    public string CloudName { get; set; } = default!;
    public string ApiKey { get; set; } = default!;
    public string ApiSecret { get; set; } = default!;
    public int ExpireSignatureMinutes { get; set; }
}