using MentorPlatform.Application.Commons.CommandMessages;
using MentorPlatform.Application.Commons.Enums;
using MentorPlatform.Application.Commons.Errors;
using MentorPlatform.Application.Commons.Mappings;
using MentorPlatform.Application.Commons.Models.Query;
using MentorPlatform.Application.Commons.Models.Requests.ScheduleRequests;
using MentorPlatform.Application.Commons.Models.Responses.ScheduleResponses;
using MentorPlatform.Application.Identity;
using MentorPlatform.Application.Services.Caching;
using MentorPlatform.Domain.Entities;
using MentorPlatform.Domain.Enums;
using MentorPlatform.Domain.Repositories;
using MentorPlatform.Domain.Shared;

namespace MentorPlatform.Application.UseCases.ScheduleUseCases;

public class ScheduleServices : IScheduleServices
{
    private readonly IScheduleRepository _scheduleRepository;
    private readonly IExecutionContext _executionContext;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICacheService _cacheService;
    private readonly CacheInvalidationHelper _cacheInvalidation;

    public ScheduleServices(
        IScheduleRepository scheduleRepository,
        IExecutionContext executionContext,
        IUnitOfWork unitOfWork,
        IUserRepository userRepository,
        ICacheService cacheService,
        CacheInvalidationHelper cacheInvalidation
        )
    {
        _scheduleRepository = scheduleRepository;
        _executionContext = executionContext;
        _unitOfWork = unitOfWork;
        _cacheService = cacheService;
        _cacheInvalidation = cacheInvalidation;
    }

    public async Task<Result> GetSchedulesAsync(ScheduleQueryParameters queryParameters)
    {
        var userId = _executionContext.GetUserId();
        var currentUser = _executionContext.GetUser();

        if (currentUser == null || currentUser.Role != Role.Mentor)
        {
            return Result.Failure(ScheduleErrors.MentorAccessRequired);
        }

        var cacheKey = CacheKeys.SchedulesByDateRange(userId, queryParameters.StartDate, queryParameters.EndDate);
        
        var result = await _cacheService.GetOrSetScheduleAsync(
            cacheKey,
            async () =>
            {
                var allDates = Enumerable.Range(0, (int)(queryParameters.EndDate.Date - queryParameters.StartDate.Date).TotalDays + 1)
                    .Select(offset => queryParameters.StartDate.Date.AddDays(offset))
                    .ToList();

                var scheduleQuery = _scheduleRepository.GetQueryable()
                    .Where(s => s.MentorId == userId &&
                            s.StartTime >= queryParameters.StartDate &&
                            s.StartTime <= queryParameters.EndDate)
                    .Select(s => new TimeSlotResponse
                    {
                        Id = s.Id,
                        StartTime = s.StartTime,
                        EndTime = s.EndTime,
                        Status = s.MentoringSessions != null &&
                                s.MentoringSessions.Any(ms => ms.RequestStatus != RequestMentoringSessionStatus.Cancelled)
                                ? TimeSlotStatus.Unavailable
                                : TimeSlotStatus.Available
                    });

                var allSchedules = await _scheduleRepository.ToListAsync(scheduleQuery);

                var schedulesByDate = allSchedules
                    .GroupBy(s => s.StartTime.Date)
                    .ToDictionary(
                        g => g.Key,
                        g => new DayTimeSlotsResponse
                        {
                            Date = g.Key,
                            TimeSlots = g.OrderBy(s => s.StartTime).ToList()
                        }
                    );

                var response = allDates.Select(date =>
                    schedulesByDate.TryGetValue(date, out var daySchedule)
                        ? daySchedule
                        : new DayTimeSlotsResponse
                        {
                            Date = date,
                            TimeSlots = new List<TimeSlotResponse>()
                        }
                ).ToList();
                
                return response;
            });

        return Result<List<DayTimeSlotsResponse>>.Success(result);
    }

    public async Task<Result> AddScheduleAsync(CreateScheduleRequest request)
    {
        var userId = _executionContext.GetUserId();

        if (await IsScheduleViolated(request))
        {
            return Result.Failure(ScheduleErrors.TimeConflict);
        }

        var scheduleList = new List<Schedule>();
        if (request.IsRepeating)
        {
            foreach (var date in request.TimeBlocks)
            {

                for (int i = 0; i <= request.RepeatingWeeks; i++)
                {
                    var schedule = new Schedule
                    {
                        MentorId = userId,
                        StartTime = date.StartTime.AddDays(i * 7),
                        EndTime = date.EndTime.AddDays(i * 7),
                    };
                    scheduleList.Add(schedule);
                }
            }
        }
        else
        {
            foreach (var date in request.TimeBlocks)
            {
                var schedule = new Schedule
                {
                    MentorId = userId,
                    StartTime = date.StartTime,
                    EndTime = date.EndTime,
                };
                scheduleList.Add(schedule);
            }
        }

        _scheduleRepository.AddRange(scheduleList);
        await _unitOfWork.SaveChangesAsync();

        // Invalidate schedule caches using helper
        await Task.WhenAll(
            _cacheService.RemoveByPrefixAsync(CacheKeys.SchedulesByMentor(userId)),
            _cacheService.RemoveByPrefixAsync(CacheKeys.AvailableSchedules(userId))
        );

        return Result<string>.Success(ScheduleCommandMessages.CreateSuccessfully);
    }

    public async Task<Result> DeleteScheduleAsync(Guid scheduleId)
    {
        var userId = _executionContext.GetUserId();
        var schedule = await _scheduleRepository.GetByIdAsync(scheduleId, nameof(Schedule.MentoringSessions));

        if (schedule == null)
        {
            return Result.Failure(ScheduleErrors.ScheduleNotFound);
        }

        if (schedule.MentorId != userId)
        {
            return Result.Failure(ScheduleErrors.ScheduleNotBelongToMentor);
        }
        if (schedule.MentoringSessions?.Any(m => m.RequestStatus != RequestMentoringSessionStatus.Cancelled) == true &&
            schedule.StartTime >= DateTimeOffset.UtcNow)
        {
            return Result.Failure(ScheduleErrors.ScheduleHaveUpcomingSession);
        }

        _scheduleRepository.Remove(schedule);
        await _unitOfWork.SaveChangesAsync();

        // Invalidate schedule caches using helper
        await _cacheInvalidation.InvalidateScheduleCachesAsync(scheduleId, userId);

        return Result<string>.Success(ScheduleCommandMessages.DeleteSuccessfully);
    }

    public async Task<Result> UpdateScheduleAsync(Guid id, EditScheduleRequest request)
    {
        var userId = _executionContext.GetUserId();
        var selectedSchedule = await _scheduleRepository.GetByIdAsync(id, nameof(Schedule.MentoringSessions));

        if (selectedSchedule == null)
        {
            return Result.Failure(ScheduleErrors.ScheduleNotFound);
        }
        if (selectedSchedule.MentorId != userId)
        {
            return Result.Failure(ScheduleErrors.ScheduleNotBelongToMentor);
        }
        if (selectedSchedule.MentoringSessions?.Any(m => m.RequestStatus != RequestMentoringSessionStatus.Cancelled) == true)
        {
            return Result.Failure(ScheduleErrors.ScheduleHaveUpcomingSession);
        }
        if (await IsScheduleViolated(selectedSchedule, request.TimeBlock))
        {
            return Result.Failure(ScheduleErrors.TimeConflict);
        }

        selectedSchedule.StartTime = request.TimeBlock.StartTime;
        selectedSchedule.EndTime = request.TimeBlock.EndTime;
        _scheduleRepository.Update(selectedSchedule);
        await _unitOfWork.SaveChangesAsync();

        // Invalidate schedule caches using helper
        await _cacheInvalidation.InvalidateScheduleCachesAsync(id, userId);

        return Result<string>.Success(ScheduleCommandMessages.UpdateSuccessfully);
    }

    private async Task<bool> IsScheduleViolated(CreateScheduleRequest request)
    {
        var userId = _executionContext.GetUserId();
        var incomingSchedulesQuery = _scheduleRepository.GetQueryable()
            .Where(s => s.MentorId == userId)
            .Where(s => s.StartTime >= DateTimeOffset.UtcNow);
        var incomingSchedules = await _scheduleRepository
            .ToListAsync(incomingSchedulesQuery);

        foreach (var schedule in incomingSchedules)
        {
            if (request.TimeBlocks.Any(timeBlock => timeBlock.IsConflictedWith(new TimeBlock(schedule.StartTime.DateTime, schedule.EndTime.DateTime))))
            {
                return true; // Schedule conflicts with existed upcoming schedule
            }
        }

        return false;
    }

    private async Task<bool> IsScheduleViolated(Schedule schedule, TimeBlock timeBlock)
    {
        var userId = _executionContext.GetUserId();
        var conflictedSchedulesQuery = _scheduleRepository.GetQueryable()
            .Where(s => s.MentorId == userId)
            .Where(s => s.Id != schedule.Id &&
            ((timeBlock.StartTime < s.EndTime && timeBlock.StartTime >= s.StartTime)
            || (timeBlock.EndTime <= s.EndTime && timeBlock.EndTime > s.StartTime)));
        var conflictedSchedules = await _scheduleRepository.ToListAsync(conflictedSchedulesQuery);

        return conflictedSchedules.Any();
    }
}