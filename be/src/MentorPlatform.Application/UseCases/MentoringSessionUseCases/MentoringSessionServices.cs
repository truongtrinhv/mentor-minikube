using MentorPlatform.Application.Commons.CommandMessages;
using MentorPlatform.Application.Commons.Errors;
using MentorPlatform.Application.Commons.Mappings;
using MentorPlatform.Application.Commons.Models.Lookup;
using MentorPlatform.Application.Commons.Models.Mail;
using MentorPlatform.Application.Commons.Models.Query;
using MentorPlatform.Application.Commons.Models.Requests.MentoringSessionRequest;
using MentorPlatform.Application.Commons.Models.Responses.MentoringSessionResponses;
using MentorPlatform.Application.Identity;
using MentorPlatform.Application.Services.HostedServices;
using MentorPlatform.Application.Services.Mail;
using MentorPlatform.Domain.Entities;
using MentorPlatform.Domain.Enums;
using MentorPlatform.Domain.Repositories;
using MentorPlatform.Domain.Shared;
using Microsoft.Extensions.DependencyInjection;
using RazorLight;

namespace MentorPlatform.Application.UseCases.MentoringSessionUseCases;

public class MentoringSessionServices : IMentoringSessionServices
{
    private readonly IMentoringSessionRepository _mentoringSessionRepository;
    private readonly ICourseRepository _courseRepository;
    private readonly IUserRepository _userRepository;
    private readonly IRepository<Schedule, Guid> _scheduleRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IExecutionContext _executionContext;
    private readonly IBackgroundTaskQueue<Func<IServiceProvider, CancellationToken, ValueTask>> _mailQueue;
    private readonly IRazorLightEngine _razorLightEngine;
    public MentoringSessionServices(IMentoringSessionRepository mentoringSessionRepository,
                                    IUnitOfWork unitOfWork,
                                    IExecutionContext executionContext,
                                    IRepository<Schedule, Guid> scheduleRepository,
                                    IUserRepository userRepository,
                                    ICourseRepository courseRepository,
                                    IBackgroundTaskQueue<Func<IServiceProvider, CancellationToken, ValueTask>> mailQueue,
                                    IRazorLightEngine razorLightEngine)
    {
        _mentoringSessionRepository = mentoringSessionRepository;
        _unitOfWork = unitOfWork;
        _executionContext = executionContext;
        _scheduleRepository = scheduleRepository;
        _userRepository = userRepository;
        _courseRepository = courseRepository;
        _mailQueue = mailQueue;
        _razorLightEngine = razorLightEngine;
    }

    public async Task<Result> GetAvailableSchedulesAsync(ScheduleQueryParameters queryParameters)
    {
        var queryCheckMentor = _userRepository.GetQueryable()
                                                .Where(x => x.Id == queryParameters.MentorId && x.Role == Role.Mentor);
        if (!await _userRepository.AnyAsync(queryCheckMentor))
        {
            return Result.Failure(404, MentoringSessionErrors.MentorNotExists);
        }
        var querySchedules = _scheduleRepository.GetQueryable()
                                                .Where(x => x.MentorId == queryParameters.MentorId
                                                            && x.StartTime >= queryParameters.StartDate && x.StartTime <= queryParameters.EndDate
                                                            && (x.MentoringSessions == null || x.MentoringSessions.All(y => y.RequestStatus == RequestMentoringSessionStatus.Cancelled)));


        var selectedSchedules = await _scheduleRepository.ToListAsync(querySchedules);
        var res = selectedSchedules.Select(x => new ScheduleLookup
        {
            Id = x.Id,
            StartTime = x.StartTime,
            EndTime = x.EndTime
        }).ToList();

        return Result<List<ScheduleLookup>>.Success(res);
    }

    public async Task<Result> CreateAsync(CreateSessionRequest sessionRequest)
    {
        var selectedUser = _executionContext.GetUser();
        if (selectedUser!.Role != Role.Learner)
        {
            return Result.Failure(MentoringSessionErrors.OnlyLeanerCanCreateRequest);
        }
        var selectedSchedule = await _scheduleRepository.GetByIdAsync(sessionRequest.ScheduleId, [nameof(Schedule.MentoringSessions)]);
        if (selectedSchedule == null)
        {
            return Result.Failure(404, MentoringSessionErrors.ScheduleNotExists);
        }
        if (selectedSchedule.StartTime < DateTime.UtcNow)
        {
            return Result.Failure(MentoringSessionErrors.ScheduleDateIsInThePast);
        }
        if (selectedSchedule.MentoringSessions != null && selectedSchedule.MentoringSessions.Any(x => x.RequestStatus != RequestMentoringSessionStatus.Cancelled))
        {
            return Result.Failure(MentoringSessionErrors.ScheduleIsAlreadyBooked);
        }
        var selectedCourse = await _courseRepository.GetByIdAsync(sessionRequest.CourseId);
        if (selectedCourse == null)
        {
            return Result.Failure(CourseErrors.CourseNotExists);
        }
        if (selectedCourse.MentorId != selectedSchedule.MentorId)
        {
            return Result.Failure(MentoringSessionErrors.ScheduleIsNotBelongToThisMentor);
        }
        var mentoringSession = new MentoringSession
        {
            LearnerId = selectedUser.Id,
            CourseId = selectedCourse.Id,
            ScheduleId = selectedSchedule.Id,
            SessionType = sessionRequest.SessionType,
            Notes = string.Empty,
            RequestStatus = RequestMentoringSessionStatus.Pending
        };
        _mentoringSessionRepository.Add(mentoringSession);
        await _unitOfWork.SaveChangesAsync();
        await SendBookingConfirmationEmailAsync(selectedSchedule.MentorId, selectedUser.Id, selectedSchedule, selectedCourse, mentoringSession.SessionType);
        return Result<string>.Success(MentoringSessionCommandMessages.CreateSuccessfully, 201);
    }

    private async Task SendBookingConfirmationEmailAsync(Guid mentorId, Guid learnerId, Schedule schedule, Course course, SessionType sessionType)
    {
        var mentor = await _userRepository.GetByIdAsync(mentorId, [nameof(User.UserDetail)]);
        var learner = await _userRepository.GetByIdAsync(learnerId, [nameof(User.UserDetail)]);
        var emailConfirmationModel = new EmailBookingConfirmationModel()
        {
            MentorName = mentor!.UserDetail.FullName,
            LearnerName = learner!.UserDetail.FullName,
            CourseName = course.Title,
            StartTime = schedule.StartTime.ToString("MM/dd/yyyy - HH:mm:ss UTC zzz"),
            EndTime = schedule.EndTime.ToString("MM/dd/yyyy - HH:mm:ss UTC zzz"),
            SessionTypeName = sessionType switch
            {
                SessionType.InPerson => "In person",
                SessionType.Onsite => "On site",
                SessionType.Virtual => "Virtual",
                _ => ""
            }
        };
        var learnerMailContent = await _razorLightEngine.CompileRenderAsync("Templates.LearnerBookingConfirmationMailTemplate", emailConfirmationModel);
        var sendMailLearnerData = new SendMailData
        {
            ToEmail = learner.Email,
            Subject = MailInformationConstants.TitleBookingSesionConfirmationEmail,
            Body = learnerMailContent,
        };
        await AddEmailWorkItemIntoQueueAsync(sendMailLearnerData);

        var mentorMailContent = await _razorLightEngine.CompileRenderAsync("Templates.MentorBookingConfirmationMailTemplate", emailConfirmationModel);
        var sendMailMentorData = new SendMailData
        {
            ToEmail = mentor.Email,
            Subject = MailInformationConstants.TitleBookingSesionConfirmationEmail,
            Body = mentorMailContent,
        };
        await AddEmailWorkItemIntoQueueAsync(sendMailMentorData);
    }

    private async Task SendApprovalEmailAsync(Guid mentorId, Guid learnerId, Schedule schedule, Course course, SessionType sessionType, string notes)
    {
        var mentor = await _userRepository.GetByIdAsync(mentorId, [nameof(User.UserDetail)]);
        var learner = await _userRepository.GetByIdAsync(learnerId, [nameof(User.UserDetail)]);
        
        var emailApprovalModel = new EmailSessionApprovalModel()
        {
            MentorName = mentor!.UserDetail.FullName,
            LearnerName = learner!.UserDetail.FullName,
            CourseName = course.Title,
            StartTime = schedule.StartTime.ToString("MM/dd/yyyy - HH:mm:ss UTC zzz"),
            EndTime = schedule.EndTime.ToString("MM/dd/yyyy - HH:mm:ss UTC zzz"),
            SessionTypeName = sessionType switch
            {
                SessionType.InPerson => "In person",
                SessionType.Onsite => "On site",
                SessionType.Virtual => "Virtual",
                _ => ""
            },
            Notes = notes
        };
        
        var learnerMailContent = await _razorLightEngine.CompileRenderAsync("Templates.LearnerSessionApprovalMailTemplate", emailApprovalModel);
        var sendMailLearnerData = new SendMailData
        {
            ToEmail = learner.Email,
            Subject = MailInformationConstants.TitleSessionApprovalEmail,
            Body = learnerMailContent,
        };
        await AddEmailWorkItemIntoQueueAsync(sendMailLearnerData);

        var mentorMailContent = await _razorLightEngine.CompileRenderAsync("Templates.MentorSessionApprovalMailTemplate", emailApprovalModel);
        var sendMailMentorData = new SendMailData
        {
            ToEmail = mentor.Email,
            Subject = MailInformationConstants.TitleSessionApprovalEmail,
            Body = mentorMailContent,
        };
        await AddEmailWorkItemIntoQueueAsync(sendMailMentorData);
    }
    
    private async Task SendRescheduleEmailAsync(Guid mentorId, Guid learnerId, Schedule oldSchedule, Schedule newSchedule, Course course, SessionType sessionType, string notes)
    {
        var mentor = await _userRepository.GetByIdAsync(mentorId, [nameof(User.UserDetail)]);
        var learner = await _userRepository.GetByIdAsync(learnerId, [nameof(User.UserDetail)]);
        
        var emailRescheduleModel = new EmailSessionRescheduleModel()
        {
            MentorName = mentor!.UserDetail.FullName,
            LearnerName = learner!.UserDetail.FullName,
            CourseName = course.Title,
            OldStartTime = oldSchedule.StartTime.ToString("MM/dd/yyyy - HH:mm:ss UTC zzz"),
            OldEndTime = oldSchedule.EndTime.ToString("MM/dd/yyyy - HH:mm:ss UTC zzz"),
            NewStartTime = newSchedule.StartTime.ToString("MM/dd/yyyy - HH:mm:ss UTC zzz"),
            NewEndTime = newSchedule.EndTime.ToString("MM/dd/yyyy - HH:mm:ss UTC zzz"),
            SessionTypeName = sessionType switch
            {
                SessionType.InPerson => "In person",
                SessionType.Onsite => "On site",
                SessionType.Virtual => "Virtual",
                _ => ""
            },
            Notes = notes
        };
        
        var learnerMailContent = await _razorLightEngine.CompileRenderAsync("Templates.LearnerSessionRescheduleMailTemplate", emailRescheduleModel);
        var sendMailLearnerData = new SendMailData
        {
            ToEmail = learner.Email,
            Subject = MailInformationConstants.TitleSessionRescheduleEmail,
            Body = learnerMailContent,
        };
        await AddEmailWorkItemIntoQueueAsync(sendMailLearnerData);

        var mentorMailContent = await _razorLightEngine.CompileRenderAsync("Templates.MentorSessionRescheduleMailTemplate", emailRescheduleModel);
        var sendMailMentorData = new SendMailData
        {
            ToEmail = mentor.Email,
            Subject = MailInformationConstants.TitleSessionRescheduleEmail,
            Body = mentorMailContent,
        };
        await AddEmailWorkItemIntoQueueAsync(sendMailMentorData);
    }
    
    private async Task SendCompletionEmailAsync(Guid mentorId, Guid learnerId, Schedule schedule, Course course, SessionType sessionType)
    {
        var mentor = await _userRepository.GetByIdAsync(mentorId, [nameof(User.UserDetail)]);
        var learner = await _userRepository.GetByIdAsync(learnerId, [nameof(User.UserDetail)]);
        
        var emailCompletionModel = new EmailSessionCompletionModel()
        {
            MentorName = mentor!.UserDetail.FullName,
            LearnerName = learner!.UserDetail.FullName,
            CourseName = course.Title,
            StartTime = schedule.StartTime.ToString("MM/dd/yyyy - HH:mm:ss UTC zzz"),
            EndTime = schedule.EndTime.ToString("MM/dd/yyyy - HH:mm:ss UTC zzz"),
            SessionTypeName = sessionType switch
            {
                SessionType.InPerson => "In person",
                SessionType.Onsite => "On site",
                SessionType.Virtual => "Virtual",
                _ => ""
            }
        };
        
        var learnerMailContent = await _razorLightEngine.CompileRenderAsync("Templates.LearnerSessionCompletionMailTemplate", emailCompletionModel);
        var sendMailLearnerData = new SendMailData
        {
            ToEmail = learner.Email,
            Subject = MailInformationConstants.TitleSessionCompletionEmail,
            Body = learnerMailContent,
        };
        await AddEmailWorkItemIntoQueueAsync(sendMailLearnerData);

        var mentorMailContent = await _razorLightEngine.CompileRenderAsync("Templates.MentorSessionCompletionMailTemplate", emailCompletionModel);
        var sendMailMentorData = new SendMailData
        {
            ToEmail = mentor.Email,
            Subject = MailInformationConstants.TitleSessionCompletionEmail,
            Body = mentorMailContent,
        };
        await AddEmailWorkItemIntoQueueAsync(sendMailMentorData);
    }
    
    private async Task SendRejectionEmailAsync(Guid mentorId, Guid learnerId, Schedule schedule, Course course, SessionType sessionType, string notes)
    {
        var mentor = await _userRepository.GetByIdAsync(mentorId, [nameof(User.UserDetail)]);
        var learner = await _userRepository.GetByIdAsync(learnerId, [nameof(User.UserDetail)]);
        
        var emailRejectionModel = new EmailSessionRejectionModel()
        {
            MentorName = mentor!.UserDetail.FullName,
            LearnerName = learner!.UserDetail.FullName,
            CourseName = course.Title,
            StartTime = schedule.StartTime.ToString("MM/dd/yyyy - HH:mm:ss UTC zzz"),
            EndTime = schedule.EndTime.ToString("MM/dd/yyyy - HH:mm:ss UTC zzz"),
            SessionTypeName = sessionType switch
            {
                SessionType.InPerson => "In person",
                SessionType.Onsite => "On site",
                SessionType.Virtual => "Virtual",
                _ => ""
            },
            Notes = notes
        };
        
        var learnerMailContent = await _razorLightEngine.CompileRenderAsync("Templates.LearnerSessionRejectionMailTemplate", emailRejectionModel);
        var sendMailLearnerData = new SendMailData
        {
            ToEmail = learner.Email,
            Subject = MailInformationConstants.TitleSessionRejectionEmail,
            Body = learnerMailContent,
        };
        await AddEmailWorkItemIntoQueueAsync(sendMailLearnerData);
        
        var mentorMailContent = await _razorLightEngine.CompileRenderAsync("Templates.MentorSessionRejectionMailTemplate", emailRejectionModel);
        var sendMailMentorData = new SendMailData
        {
            ToEmail = mentor.Email,
            Subject = MailInformationConstants.TitleSessionRejectionEmail,
            Body = mentorMailContent,
        };
        await AddEmailWorkItemIntoQueueAsync(sendMailMentorData);
    }

    private async Task AddEmailWorkItemIntoQueueAsync(SendMailData sendMailData)
    {
        await _mailQueue.QueueBackgroundWorkItemAsync(async (sp, cancellationToken) =>
        {
            var mailServices = sp.GetRequiredService<IApplicationMailServices>();
            await mailServices.SendMailAsync(
                sendMailData,
                cancellationToken: cancellationToken
            );
        });
    }

    public async Task<Result> GetAllMentoringSessionsAsync(MentoringSessionParameters query)
    {
        User requestingUser = _executionContext.GetUser()!;

        if (query.SessionStatus != null && !Enum.IsDefined(typeof(RequestMentoringSessionStatus), query.SessionStatus))
        {
            return Result.Failure(400, MentoringSessionErrors.InvalidMentoringSessionStatus);
        }

        if (query.From != null && query.To != null && query.From >= query.To)
        {
            return Result.Failure(400, MentoringSessionErrors.InvalidStartAndEndDates);
        }

        if (query.CourseId != null)
        {
            Course? course = await _courseRepository.GetByIdAsync((Guid)query.CourseId);

            if (course == null)
            {
                return Result.Failure(400, CourseErrors.CourseNotExists);
            }

            if (requestingUser.Role == Role.Mentor && course.MentorId != requestingUser.Id)
            {
                return Result.Failure(403, MentoringSessionErrors.NotYourCourse);
            }
        }

        var queryable = _mentoringSessionRepository.GetQueryable();

        if (requestingUser.Role == Role.Learner)
        {
            queryable = queryable.Where(ms => ms.LearnerId == requestingUser.Id);
        }

        if (requestingUser.Role == Role.Mentor)
        {
            queryable = queryable.Where(ms => ms.Schedule.MentorId == requestingUser.Id);
        }

        if (query.CourseId != null)
        {
            queryable = queryable.Where(ms => ms.CourseId == query.CourseId);
        }

        if (query.SessionStatus != null)
        {
            queryable = queryable.Where(ms => ms.RequestStatus == (RequestMentoringSessionStatus)query.SessionStatus);
        }

        if (query.From != null)
        {
            queryable = queryable.Where(ms => ms.Schedule.StartTime >= query.From);
        }

        if (query.To != null)
        {
            queryable = queryable.Where(ms => ms.Schedule.StartTime <= query.To);
        }

        var resultPage = queryable.Skip((query.PageNumber - 1) * query.PageSize)
                        .Take(query.PageSize);

        var result = await _mentoringSessionRepository.ToListAsync(
            resultPage,
            nameof(MentoringSession.Learner),
            $"{nameof(MentoringSession.Learner)}.{nameof(MentoringSession.Learner.UserDetail)}",
            nameof(MentoringSession.Schedule),
            nameof(MentoringSession.OldSchedule),
            nameof(MentoringSession.Course),
            $"{nameof(MentoringSession.Schedule)}.{nameof(MentoringSession.Schedule.Mentor)}",
            $"{nameof(MentoringSession.Schedule)}.{nameof(MentoringSession.Schedule.Mentor)}.{nameof(MentoringSession.Schedule.Mentor.UserDetail)}"
        );

        int count = await _mentoringSessionRepository.CountAsync(queryable);

        if (requestingUser.Role == Role.Learner)
        {
            var transformedResult = result.Select(ms => ms.ToMentoringSessionResponseForLearner()).ToList();
            var response = PaginationResult<MentoringSessionResponseForLearner>.Create(data: transformedResult,
                                                                        totalCount: count,
                                                                        pageNumber: query.PageNumber,
                                                                        pageSize: query.PageSize);
            return Result<PaginationResult<MentoringSessionResponseForLearner>>.Success(response);
        }
        else
        {
            var transformedResult = result.Select(ms => ms.ToMentoringSessionResponseForMentor()).ToList();
            var response = PaginationResult<MentoringSessionResponseForMentor>.Create(data: transformedResult,
                                                                        totalCount: count,
                                                                        pageNumber: query.PageNumber,
                                                                        pageSize: query.PageSize);
            return Result<PaginationResult<MentoringSessionResponseForMentor>>.Success(response);
        }
    }

    public async Task<Result> ApproveAsync(Guid sessionId)
    {
        User requestingUser = _executionContext.GetUser()!;

        MentoringSession? session = await _mentoringSessionRepository.GetByIdAsync(sessionId, 
            nameof(MentoringSession.Schedule),
            nameof(MentoringSession.Course));

        if (session == null)
        {
            return Result.Failure(404, MentoringSessionErrors.MentoringSessionNotExists);
        }

        if ((requestingUser.Role == Role.Learner && session.LearnerId != requestingUser.Id) ||
            (requestingUser.Role == Role.Mentor && session.Schedule.MentorId != requestingUser.Id))
        {
            return Result.Failure(403, MentoringSessionErrors.DoNotHavePermission);
        }

        if (requestingUser.Role == Role.Learner && session.RequestStatus != RequestMentoringSessionStatus.Rescheduling)
        {
            return Result.Failure(409, MentoringSessionErrors.LearnersCanOnlyApproveIfRescheduling);
        }

        if (requestingUser.Role == Role.Mentor && session.RequestStatus != RequestMentoringSessionStatus.Pending)
        {
            return Result.Failure(409, MentoringSessionErrors.MentorsCanOnlyApproveIfPending);
        }

        session.RequestStatus = RequestMentoringSessionStatus.Scheduled;
        await _unitOfWork.SaveChangesAsync();
        
        // Send email notification approval
        await SendApprovalEmailAsync(
            session.Schedule.MentorId, 
            session.LearnerId, 
            session.Schedule, 
            session.Course, 
            session.SessionType, 
            session.Notes);
            
        return Result<string>.Success(MentoringSessionCommandMessages.UpdateSuccessfully, 200);
    }

    public async Task<Result> RejectAsync(Guid sessionId)
    {
        User requestingUser = _executionContext.GetUser()!;

        MentoringSession? session = await _mentoringSessionRepository.GetByIdAsync(sessionId, 
            nameof(MentoringSession.Schedule),
            nameof(MentoringSession.Course));

        if (session == null)
        {
            return Result.Failure(404, MentoringSessionErrors.MentoringSessionNotExists);
        }

        if (session.LearnerId != requestingUser.Id)
        {
            return Result.Failure(403, MentoringSessionErrors.DoNotHavePermission);
        }

        if (session.RequestStatus != RequestMentoringSessionStatus.Rescheduling)
        {
            return Result.Failure(409, MentoringSessionErrors.LearnersCanOnlyRejectIfRescheduling);
        }

        session.RequestStatus = RequestMentoringSessionStatus.Cancelled;
        await _unitOfWork.SaveChangesAsync();
        
        // Send email notification rejection
        await SendRejectionEmailAsync(
            session.Schedule.MentorId, 
            session.LearnerId, 
            session.Schedule, 
            session.Course, 
            session.SessionType, 
            session.Notes);
            
        return Result<string>.Success(MentoringSessionCommandMessages.UpdateSuccessfully, 200);
    }

    public async Task<Result> RescheduleAsync(Guid sessionId, RescheduleSessionRequest rescheduleSessionRequest)
    {
        User requestingUser = _executionContext.GetUser()!;

        MentoringSession? session = await _mentoringSessionRepository.GetByIdAsync(sessionId, 
            nameof(MentoringSession.Schedule),
            nameof(MentoringSession.Course));

        if (session == null)
        {
            return Result.Failure(404, MentoringSessionErrors.MentoringSessionNotExists);
        }
        if (session.Schedule.MentorId != requestingUser.Id)
        {
            return Result.Failure(403, MentoringSessionErrors.DoNotHavePermission);
        }
        if (session.RequestStatus != RequestMentoringSessionStatus.Pending)
        {
            return Result.Failure(409, MentoringSessionErrors.MentorCanOnlyReschedulePendingSessions);
        }

        Schedule? oldSchedule = session.Schedule;
        Schedule? newSchedule = await _scheduleRepository.GetByIdAsync(rescheduleSessionRequest.NewScheduleId, nameof(Schedule.MentoringSessions));

        if (newSchedule == null)
        {
            return Result.Failure(404, MentoringSessionErrors.ScheduleNotExists);
        }
        if (newSchedule.StartTime < DateTime.UtcNow)
        {
            return Result.Failure(MentoringSessionErrors.ScheduleDateIsInThePast);
        }
        if (newSchedule.Id != session.ScheduleId &&
            newSchedule.MentoringSessions != null &&
            newSchedule.MentoringSessions.Any(x => x.RequestStatus != RequestMentoringSessionStatus.Cancelled))
        {
            return Result.Failure(MentoringSessionErrors.ScheduleIsAlreadyBooked);
        }
        if (newSchedule.MentorId != requestingUser.Id)
        {
            return Result.Failure(MentoringSessionErrors.ScheduleIsNotBelongToThisMentor);
        }

        session.RequestStatus = RequestMentoringSessionStatus.Rescheduling;
        session.Notes = rescheduleSessionRequest.Notes.Trim();
        session.OldScheduleId = session.ScheduleId;
        session.ScheduleId = rescheduleSessionRequest.NewScheduleId;

        await _unitOfWork.SaveChangesAsync();
        
        // Send email notification reschedule
        await SendRescheduleEmailAsync(
            session.Schedule.MentorId, 
            session.LearnerId, 
            oldSchedule, 
            newSchedule, 
            session.Course, 
            session.SessionType, 
            session.Notes);
            
        return Result<string>.Success(MentoringSessionCommandMessages.UpdateSuccessfully, 200);
    }

    public async Task<Result> CompleteAsync(Guid sessionId)
    {
        User requestingUser = _executionContext.GetUser()!;

        MentoringSession? session = await _mentoringSessionRepository.GetByIdAsync(sessionId, 
            nameof(MentoringSession.Schedule),
            nameof(MentoringSession.Course));

        if (session == null)
        {
            return Result.Failure(404, MentoringSessionErrors.MentoringSessionNotExists);
        }

        if (session.Schedule.MentorId != requestingUser.Id)
        {
            return Result.Failure(403, MentoringSessionErrors.DoNotHavePermission);
        }

        if (session.RequestStatus != RequestMentoringSessionStatus.Scheduled)
        {
            return Result.Failure(409, MentoringSessionErrors.MentorsCanOnlyCompleteIfScheduled);
        }

        session.RequestStatus = RequestMentoringSessionStatus.Completed;
        await _unitOfWork.SaveChangesAsync();
        
        // Send email notification completion
        await SendCompletionEmailAsync(
            session.Schedule.MentorId, 
            session.LearnerId, 
            session.Schedule, 
            session.Course, 
            session.SessionType);
            
        return Result<string>.Success(MentoringSessionCommandMessages.UpdateSuccessfully, 200);
    }
}
