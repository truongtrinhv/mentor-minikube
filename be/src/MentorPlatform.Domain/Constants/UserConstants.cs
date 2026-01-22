
namespace MentorPlatform.Domain.Constants;

public static class UserConstants
{
    public const int MaxLengthGmail = 50;
    public const int MinLengthGmail = 8;
    public const int MaxLengthPasswordHash = 500;
    public const int MaxLengthPassword = 32;
    public const int MinLengthPassword = 8;
    public const int MaxLengthFullName = 200;
    public const int MinLengthFullName = 3;
    public const int MaxLengthProfessionalSkills = 200;
    public const int MaxLengthBio = 2000;
    public const int MaxLengthAvatarUrl = 1000;
    public const int MaxSizeAvatarMb = 5;
    public const string ImageUrlDefault = "default-image-avatar";
    public const int MaxLengthIndustryExperience = 200;
    public const int MaxLengthGoals = 200;
    public const int MaxLengthLearningStyle = 200;
    public const string FullNameRegexPattern = @"^[A-Za-z._-]+(?:\s[A-Za-z._-]+)*$";
    public const string EmailRegexPattern = @"^(?=.{8,50}$)[A-Za-z0-9]+(?:\.[A-Za-z0-9]+)*@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$";
    public const string PasswordRegexPattern = @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,32}$";
    public const string CodeRegexPattern = @"^\d{6}$";
}
