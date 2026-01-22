using MentorPlatform.Application.Commons.Models.Query;
using MentorPlatform.Application.Commons.Models.Requests.ScheduleRequests;
using MentorPlatform.Domain.Shared;

namespace MentorPlatform.Application.UseCases.ScheduleUseCases;
public interface IScheduleServices
{
    public Task<Result> GetSchedulesAsync(ScheduleQueryParameters queryParameters);
    public Task<Result> AddScheduleAsync(CreateScheduleRequest request);
    public Task<Result> UpdateScheduleAsync(Guid id, EditScheduleRequest request);
    public Task<Result> DeleteScheduleAsync(Guid scheduleId);
}
