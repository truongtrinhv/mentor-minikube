
namespace MentorPlatform.CrossCuttingConcerns.Caching;

public static class CacheKeyConstants
{
    public const string RecallTokenKey = "user_recall_accessToken_{userId}_{tokenId}";
    public const string VerifyEmailCode = "user_verify_email_{userId}";
    public const string ForgotPasswordCode = "user_forgot_password_email_{userId}";
    public const string ResourceUrl = "resource_url_{userId}";
}
