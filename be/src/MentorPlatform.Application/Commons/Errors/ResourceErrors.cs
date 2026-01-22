using MentorPlatform.Domain.Shared;

namespace MentorPlatform.Application.Commons.Errors;

public static class ResourceErrorMessages
{
    public const string ResourceNotFound = "Resource not found";
    public const string ResourceNotBelongToUser = "Resource does not belong to the user";
    public const string ResourceNotExists = "Resource does not exists";
    public const string AdminCanNotViewResource = "Admin can not view resources";
    public const string MentorCanNotViewResource = "Mentor do not have permission to view this resource";
    public const string LearnerCanNotViewResource = "Learner have to join the course to see this resource";
    public const string ResourceTitleCannotBeEmpty = "Resource title cannot be empty";
    public const string ResourceTitleMinLength = "Resource title must be at least 3 characters long";
    public const string ResourceTitleMaxLength = "Resource title must be at most 100 characters long";
    public const string ResourceDescriptionCannotBeEmpty = "Resource description cannot be empty";
    public const string ResourceDescriptionMaxLength = "Resource description must be at most 2000 characters long";
    public const string ResourceFileCannotBeEmpty = "Resource file cannot be empty";
}

public static class ResourceErrors
{
    public static Error ResourceNotFound => new(nameof(ResourceNotFound), ResourceErrorMessages.ResourceNotFound);
    public static Error ResourceNotBelongToUser => new(nameof(ResourceNotBelongToUser), ResourceErrorMessages.ResourceNotBelongToUser);
    public static Error ResourceNotExists => new(nameof(ResourceNotExists),
        ResourceErrorMessages.ResourceNotExists);
    public static Error AdminCanNotViewResource => new(nameof(AdminCanNotViewResource),
        ResourceErrorMessages.AdminCanNotViewResource); 
    public static Error MentorCanNotViewResource => new(nameof(MentorCanNotViewResource),
        ResourceErrorMessages.MentorCanNotViewResource);

    public static Error LearnerCanNotViewResource => new(nameof(LearnerCanNotViewResource),
        ResourceErrorMessages.LearnerCanNotViewResource);
}
