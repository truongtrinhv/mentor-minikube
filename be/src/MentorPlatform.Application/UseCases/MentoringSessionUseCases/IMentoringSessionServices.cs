using MentorPlatform.Application.Commons.Models.Query;
using MentorPlatform.Application.Commons.Models.Requests.MentoringSessionRequest;
using MentorPlatform.Domain.Shared;

namespace MentorPlatform.Application.UseCases.MentoringSessionUseCases;

public interface IMentoringSessionServices
{
    public Task<Result> GetAvailableSchedulesAsync(ScheduleQueryParameters queryParameters);
    public Task<Result> CreateAsync(CreateSessionRequest sessionRequest);
    public Task<Result> GetAllMentoringSessionsAsync(MentoringSessionParameters query);
    public Task<Result> ApproveAsync(Guid sessionId);
    public Task<Result> RejectAsync(Guid sessionId);
    public Task<Result> RescheduleAsync(Guid sessionId, RescheduleSessionRequest rescheduleSessionRequest);
    public Task<Result> CompleteAsync(Guid sessionId);
}
