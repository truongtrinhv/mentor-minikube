namespace MentorPlatform.Application.Commons.ValidationMessages;

public static class ApplicationRequestValidationMessages
{
    public const string EducationNotEmpty = "Education must not be empty.";
    public const string EducationMinLength = "Education must be at least 10 characters.";
    public const string EducationMaxLength = "Education must be at most 2000 characters.";

    public const string WorkExperienceNotEmpty = "Work experience must not be empty.";
    public const string WorkExperienceMinLength = "Work experience must be at least 10 characters.";
    public const string WorkExperienceMaxLength = "Work experience must be at most 2000 characters.";

    public const string DescriptionNotEmpty = "Description must not be empty.";
    public const string DescriptionMaxLength = "Description must be at most 2000 characters.";

    public const string NoteMaxLength = "Note must be at most 2000 characters.";

    public const string StatusInvalid =
        "Status must be one of the following values: Pending, UnderReview, Approved, Rejected.";
    public const string FilePathNotEmpty = "FilePath must not be empty.";
    public const string FilePathMaxLength = "FilePath must be at most 1000 characters.";

    public const string FileNameNotEmpty = "FileName must not be empty.";
    public const string FileNameMaxLength = "FileName must be at most 1000 characters.";

    public const string FileContentNotNull = "FileContent must be provided.";
    public const string FileContentUnsupportedExtension = "File extension '{0}' is not supported. Allowed extensions: {1}.";

    public const string ApplicationRequestIdMustBeNotEmpty = "Application request id must be not empty";
    public const string NoteMustBeNotEmpty = "Note must be not empty";

    public const string NoteMustBeLessThanOrEqualMaxLength = "Note must be less than or equal 2000";
}
