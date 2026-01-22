
namespace MentorPlatform.Application.Commons.ValidationMessages;

public static class AuthModelsValidationMessages
{
    public const string UserExpertiseInvalid = "Areas of expertise have invalid value.";
    public const string PreferredTeachingStyleInvalid = "Preferred teaching style is invalid.";
    public const string PreferredLearningStyleInvalid = "Preferred learning style is invalid.";
    public const string PreferredSessionIsInvalid = "Preferred session frequency is invalid.";
    public const string GoalsMustLessThanMaxLength = "Goals must be 200 characters max.";
    public const string AvailabilityInvalid = "Availability is invalid, please choose a valid value.";
    public const string PreferredCommunicationInvalid =
        "Preferred communication method is invalid, please choose a valid value.";
    public const string IndustryExperienceShouldLessThanMaxLength = "Industry experience must be 200 characters max.";
    public const string ProfessionalSkillShouldLessThanMaxLength = "Professional skill should less than 2000 characters";
    public const string BioShouldLessThanMaxLength = "Bio must be 2000 characters max.";
    public const string FullNameNotEmpty = "Full name must not be empty";
    public const string FullNameMustBeInRange = "Full name must be 3 - 200 characters.";
    public const string RoleIsInvalid = "Role is invalid, please choose a valid value.";
    public const string EmailNotEmpty = "Email must not be empty.";
    public const string PasswordNotEmpty = "Password must not be empty.";
    public const string FormatEmailInvalid = "Email must be 8–50 characters and be valid format";
    public const string FormatPasswordInvalid = "Password must be 8–32 characters and include uppercase, lowercase, number & special characters.";
    public const string AvatarShouldLessThanMaxLength = "Image must less than or equal {maxLength} mb.";
    public const string AccessTokenRequired = "Access token is required.";
    public const string RefreshTokenRequired = "Refresh token is required";
    public const string CodeNotEmpty = "Code is required.";
    public const string FormatCodeInvalid = "Code must consist of exactly 6 digits.";
}
