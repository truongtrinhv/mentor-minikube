namespace MentorPlatform.Application.Services.Caching;

/// <summary>
/// Centralized cache key management to ensure consistency
/// </summary>
public static class CacheKeys
{
    private const string Prefix = "MentorPlatform:";

    // Expertise cache keys
    public static string ExpertisesAll => $"{Prefix}expertises:all";
    public static string Expertise(Guid id) => $"{Prefix}expertise:{id}";

    // Course Category cache keys
    public static string CourseCategoriesAll => $"{Prefix}categories:all";
    public static string CourseCategoriesLookup => $"{Prefix}categories:lookup";
    public static string CourseCategory(Guid id) => $"{Prefix}category:{id}";
    public static string CourseCategoryPage(int page, int size, string? search) => 
        $"{Prefix}categories:page:{page}:{size}:{search ?? "all"}";

    // Course cache keys
    public static string Course(Guid id) => $"{Prefix}course:{id}";
    public static string CourseLookup => $"{Prefix}courses:lookup";
    public static string CoursePage(int page, int size, string? search) => 
        $"{Prefix}courses:page:{page}:{size}:{search ?? "all"}";
    public static string CoursesByMentor(Guid mentorId) => $"{Prefix}courses:mentor:{mentorId}";
    public static string CoursesByCategory(Guid categoryId) => $"{Prefix}courses:category:{categoryId}";

    // Resource cache keys
    public static string Resource(Guid id) => $"{Prefix}resource:{id}";
    public static string ResourcesByMentor(Guid mentorId) => $"{Prefix}resources:mentor:{mentorId}";
    public static string ResourcesByMentor(Guid mentorId, int page, int size, string? search, string? fileType) => 
        $"{Prefix}resources:mentor:{mentorId}:page:{page}:{size}:{search ?? "all"}:{fileType ?? "all"}";
    public static string ResourcesByLearner(Guid learnerId) => $"{Prefix}resources:learner:{learnerId}";
    public static string ResourcesByLearner(Guid learnerId, int page, int size, string? search, string? fileType) => 
        $"{Prefix}resources:learner:{learnerId}:page:{page}:{size}:{search ?? "all"}:{fileType ?? "all"}";
    public static string LearnerResources(Guid learnerId) => $"{Prefix}learner:{learnerId}:resources";

    // User cache keys
    public static string User(Guid id) => $"{Prefix}user:{id}";
    public static string UserProfile(Guid id) => $"{Prefix}user:{id}:profile";
    public static string UserByEmail(string email) => $"{Prefix}user:email:{email}";
    public static string UsersPage(int page, int size, string? search, string? roles) => 
        $"{Prefix}users:page:{page}:{size}:{search ?? "all"}:{roles ?? "all"}";
    public static string MentorsLookup(int page, int size, string? search) => 
        $"{Prefix}mentors:lookup:page:{page}:{size}:{search ?? "all"}";

    // Mentor cache keys
    public static string Mentor(Guid id) => $"{Prefix}mentor:{id}";
    public static string MentorPage(int page, int size) => $"{Prefix}mentors:page:{page}:{size}";
    public static string MentorStats(Guid id) => $"{Prefix}mentor:{id}:stats";
    public static string MentorsWithCoursesPage(int page, int size, string? search, Guid? categoryId) => 
        $"{Prefix}mentors:courses:page:{page}:{size}:{search ?? "all"}:{categoryId?.ToString() ?? "all"}";
    public static string MentorTopCourses(Guid mentorId, int count) => $"{Prefix}mentor:{mentorId}:top:{count}";

    // Session cache keys
    public static string Session(Guid id) => $"{Prefix}session:{id}";
    public static string SessionsByMentor(Guid mentorId) => $"{Prefix}sessions:mentor:{mentorId}";
    public static string SessionsByLearner(Guid learnerId) => $"{Prefix}sessions:learner:{learnerId}";

    // Dashboard cache keys
    public static string LearnerDashboard(Guid learnerId) => $"{Prefix}dashboard:learner:{learnerId}";
    public static string MentorDashboard(Guid mentorId) => $"{Prefix}dashboard:mentor:{mentorId}";

    // Schedule cache keys
    public static string Schedule(Guid id) => $"{Prefix}schedule:{id}";
    public static string SchedulesByMentor(Guid mentorId) => $"{Prefix}schedules:mentor:{mentorId}";
    public static string SchedulesByDateRange(Guid mentorId, DateTimeOffset startDate, DateTimeOffset endDate) => 
        $"{Prefix}schedules:mentor:{mentorId}:{startDate:yyyyMMdd}:{endDate:yyyyMMdd}";
    public static string AvailableSchedules(Guid mentorId) => $"{Prefix}schedules:available:mentor:{mentorId}";
    public static string AvailableSchedulesByDateRange(Guid mentorId, DateTimeOffset startDate, DateTimeOffset endDate) => 
        $"{Prefix}schedules:available:mentor:{mentorId}:{startDate:yyyyMMdd}:{endDate:yyyyMMdd}";

    // Cache invalidation prefixes
    public static string CoursesPrefix => $"{Prefix}courses:";
    public static string CategoriesPrefix => $"{Prefix}categories:";
    public static string ResourcesPrefix => $"{Prefix}resources:";
    public static string UsersPrefix => $"{Prefix}users:";
}
