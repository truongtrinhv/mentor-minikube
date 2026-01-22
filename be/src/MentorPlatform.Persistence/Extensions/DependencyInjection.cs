
using MentorPlatform.Domain.Repositories;
using MentorPlatform.Persistence.Interceptors;
using MentorPlatform.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MentorPlatform.Persistence.Extensions;

public static class DependencyInjection
{
    public static IServiceCollection ConfigurePersistenceLayer(this IServiceCollection services, IConfiguration config)
    {
        services.ConfigureApplicationDbContext(config)
            .ConfigureRepositories();
        return services;
    }

    public static IServiceCollection ConfigureApplicationDbContext(this IServiceCollection services, IConfiguration config)
    {
        services.AddScoped<AuditableEntityInterceptor>();
        services.AddDbContext<ApplicationDbContext>((sp, options) =>
        {
            var auditableInterceptor = sp.GetRequiredService<AuditableEntityInterceptor>();
            options.UseSqlServer(config.GetConnectionString(nameof(ApplicationDbContext)));
            options.AddInterceptors(auditableInterceptor);
        });

        return services;
    }

    public static IServiceCollection ConfigureRepositories(this IServiceCollection services)
    {
        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<ApplicationDbContext>());
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped(typeof(IRepository<,>), typeof(Repository<,>));
        services.AddScoped<ICourseCategoryRepository, CourseCategoryRepository>();
        services.AddScoped<IApplicationRequestRepository, ApplicationRequestRepository>();
        services.AddScoped<ICourseRepository, CourseRepository>();
        services.AddScoped<IResourceRepository, ResourceRepository>();
        services.AddScoped<IMentoringSessionRepository, MentoringSessionRepository>();
        services.AddScoped<IScheduleRepository, ScheduleRepository>();
        services.AddScoped<ISessionRepository, SessionRepository>();
        services.AddScoped<INotificationRepository, NotificationRepository>();
        services.AddScoped<IConversationRepository, ConversationRepository>();
        services.AddScoped<IMessageRepository, MessageRepository>();
        return services;
    }
}
