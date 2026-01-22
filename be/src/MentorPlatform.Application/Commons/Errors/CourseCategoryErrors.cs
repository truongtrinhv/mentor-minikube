using MentorPlatform.Domain.Shared;

namespace MentorPlatform.Application.Commons.Errors;
public static class CourseCategoryErrorMessages
{
    public const string CourseCategoryNotExists = "Course Category does not exists";
    public const string CourseCategoryDuplicateName = "Course category name is duplicated";
    public const string CourseCategoryIsUsed = "Course category is currently used";
    public const string CourseCategoryCannotChangeStatus = "Can not change status of category, because it currently used";
}
public static class CourseCategoryErrors
{
    public static Error CourseCategoryNotExists => new(nameof(CourseCategoryNotExists),
        CourseCategoryErrorMessages.CourseCategoryNotExists);

    public static Error CourseCategoryDuplicateName => new(nameof(CourseCategoryDuplicateName),
        CourseCategoryErrorMessages.CourseCategoryDuplicateName);

    public static Error CourseCategoryIsUsed => new(nameof(CourseCategoryIsUsed),
       CourseCategoryErrorMessages.CourseCategoryIsUsed);

    public static Error CourseCategoryCannotChangeStatus => new(nameof(CourseCategoryCannotChangeStatus),
      CourseCategoryErrorMessages.CourseCategoryCannotChangeStatus);

}
