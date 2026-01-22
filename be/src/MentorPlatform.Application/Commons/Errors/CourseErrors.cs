using MentorPlatform.Domain.Shared;

namespace MentorPlatform.Application.Commons.Errors;

public static class CourseErrorMessages
{
    public const string TitleNotEmpty = "Title cannot be empty";
    public const string TitleMinLength = "Title must be at least 3 characters long";
    public const string TitleMaxLength = "Title cannot exceed 100 characters";
    public const string DescriptionNotEmpty = "Description cannot be empty";
    public const string DescriptionMaxLength = "Description cannot exceed 2000 characters";
    public const string LevelInvalid = "Level must be between 0 and 2";
    public const string CourseCategoryNotExists = "Course category does not exists.";
    public const string CourseCategoryDeactivated = "Course category is deactivated. Please contact support.";
    public const string CourseNotExists = "Course does not exists";
    public const string CourseDuplicateName = "Course name is duplicated";
    public const string CourseIsUsed = "Course is currently used";
    public const string MentorCanNotViewCourse = "Mentor do not have permission to view this course";
    public const string MentorCanNotEditCourse = "Mentor do not have permission to edit this course";
    public const string MentorCanNotDeleteCourse = "Mentor do not have permission to delete this course";
    public const string CourseHasMentoringSession = "Course has mentoring session";
    public const string NotALearner = "Not a learner.";
}

public static class CourseErrors
{
    public static Error TitleNotEmpty => new(nameof(TitleNotEmpty), CourseErrorMessages.TitleNotEmpty);
    public static Error TitleMinLength => new(nameof(TitleMinLength), CourseErrorMessages.TitleMinLength);
    public static Error TitleMaxLength => new(nameof(TitleMaxLength), CourseErrorMessages.TitleMaxLength);
    public static Error DescriptionNotEmpty => new(nameof(DescriptionNotEmpty), CourseErrorMessages.DescriptionNotEmpty);
    public static Error DescriptionMaxLength => new(nameof(DescriptionMaxLength), CourseErrorMessages.DescriptionMaxLength);
    public static Error LevelInvalid => new(nameof(LevelInvalid), CourseErrorMessages.LevelInvalid);
    public static Error CourseCategoryNotExists => new(nameof(CourseCategoryNotExists), CourseErrorMessages.CourseCategoryNotExists);
    public static Error CourseCategoryDeactivated => new(nameof(CourseCategoryDeactivated),
        CourseErrorMessages.CourseCategoryDeactivated);
    public static Error CourseNotExists => new(nameof(CourseNotExists),
        CourseErrorMessages.CourseNotExists);

    public static Error CourseDuplicateName => new(nameof(CourseDuplicateName),
        CourseErrorMessages.CourseDuplicateName);

    public static Error CourseIsUsed => new(nameof(CourseIsUsed),
       CourseErrorMessages.CourseIsUsed);

    public static Error MentorCanNotViewCourse => new(nameof(MentorCanNotViewCourse),
       CourseErrorMessages.MentorCanNotViewCourse);

    public static Error MentorCanNotEditCourse => new(nameof(MentorCanNotEditCourse),
         CourseErrorMessages.MentorCanNotEditCourse);
    public static Error MentorCanNotDeleteCourse => new(nameof(MentorCanNotDeleteCourse),
            CourseErrorMessages.MentorCanNotDeleteCourse);

    public static Error CourseHasMentoringSession => new(nameof(CourseHasMentoringSession),
        CourseErrorMessages.CourseHasMentoringSession);
    public static Error NotALearner => new(nameof(NotALearner), CourseErrorMessages.NotALearner);

}