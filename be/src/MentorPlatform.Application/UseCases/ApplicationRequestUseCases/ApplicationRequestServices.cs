using MentorPlatform.Application.Commons.CommandMessages;
using MentorPlatform.Application.Commons.Enums;
using MentorPlatform.Application.Commons.Errors;
using MentorPlatform.Application.Commons.Mappings;
using MentorPlatform.Application.Commons.Models.Mail;
using MentorPlatform.Application.Commons.Models.Query;
using MentorPlatform.Application.Commons.Models.Requests.ApplicationMentorRequests;
using MentorPlatform.Application.Commons.Models.Responses.ApplicationRequestResponses;
using MentorPlatform.Application.Identity;
using MentorPlatform.Application.Services.File;
using MentorPlatform.Application.Services.FileStorage;
using MentorPlatform.Application.Services.HostedServices;
using MentorPlatform.Application.Services.Mail;
using MentorPlatform.Application.Services.Messaging;
using MentorPlatform.Domain.Entities;
using MentorPlatform.Domain.Enums;
using MentorPlatform.Domain.Events;
using MentorPlatform.Domain.Repositories;
using MentorPlatform.Domain.Shared;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using RazorLight;

namespace MentorPlatform.Application.UseCases.ApplicationRequestUseCases;

public class ApplicationRequestServices : IApplicationRequestServices
{
    private readonly IFileStorageServices _fileStorageServices;
    private readonly IApplicationRequestRepository _applicationRequestRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserRepository _userRepository;
    private readonly IExecutionContext _executionContext;
    private readonly IBackgroundTaskQueue<Func<IServiceProvider, CancellationToken, ValueTask>> _mailQueue;
    private readonly IRazorLightEngine _razorLightEngine;
    private readonly IDomainEventDispatcher _eventDispatcher;
    private readonly ILogger<ApplicationRequestServices> _logger;
    
    public ApplicationRequestServices(IFileStorageFactory fileStorageServices,
        IApplicationRequestRepository applicationRequestRepository,
        IUnitOfWork unitOfWork,
        IExecutionContext executionContext,
        IBackgroundTaskQueue<Func<IServiceProvider, CancellationToken, ValueTask>> mailQueue,
        IRazorLightEngine razorLightEngine,
        IUserRepository userRepository,
        IDomainEventDispatcher eventDispatcher,
        ILogger<ApplicationRequestServices> logger)
    {
        _userRepository = userRepository;
        _razorLightEngine = razorLightEngine;
        _mailQueue = mailQueue;
        _executionContext = executionContext;
        _unitOfWork = unitOfWork;
        _fileStorageServices = fileStorageServices.Get();
        _applicationRequestRepository = applicationRequestRepository;
        _eventDispatcher = eventDispatcher;
        _logger = logger;
    }

    public async Task<Result> CreateAsync(CreateApplicationRequestMentorRequest createApplicationRequestMentorRequest)
    {
        var currentUserId = _executionContext.GetUserId();

        var existingApplicationQuery = _applicationRequestRepository.GetQueryable()
            .Where(x => x.MentorId == currentUserId &&
                       !x.IsDeleted &&
                       (x.Status == ApplicationRequestStatus.Pending || x.Status == ApplicationRequestStatus.UnderReview));

        var existingApplication = await _applicationRequestRepository.FirstOrDefaultAsync(existingApplicationQuery);

        if (existingApplication != null)
        {
            return Result.Failure(ApplicationRequestErrors.UserAlreadyHasPendingApplication);
        }

        var applicationRequest = createApplicationRequestMentorRequest.ToApplicationRequest();

        if (createApplicationRequestMentorRequest.ApplicationDocuments != null
            && createApplicationRequestMentorRequest.ApplicationDocuments.Count > 0)
        {
            var uploadApplicationDocumentTasks = createApplicationRequestMentorRequest.ApplicationDocuments
                .Select((x) => _fileStorageServices.UploadFileAsync(x.FileContent, UploadType.Default)).ToList();

            await Task.WhenAll(uploadApplicationDocumentTasks);

            var numberOfDocuments = createApplicationRequestMentorRequest.ApplicationDocuments.Count;

            var applicationDocuments = new List<ApplicationDocument>();
            for (var i = 0; i < numberOfDocuments; i++)
            {
                if (uploadApplicationDocumentTasks[i].IsCompleted)
                {
                    applicationDocuments.Add(new()
                    {
                        FilePath = uploadApplicationDocumentTasks[i].Result,
                        FileName = createApplicationRequestMentorRequest.ApplicationDocuments[i].FileName
                    });
                }
            }
            applicationRequest.ApplicationDocuments = applicationDocuments;
        }

        applicationRequest.MentorId = currentUserId;

        _applicationRequestRepository.Add(applicationRequest);
        await _unitOfWork.SaveChangesAsync();

        // Publish domain event to trigger saga orchestration
        var requestSubmittedEvent = new ApplicationRequestSubmittedEvent
        {
            RequestId = applicationRequest.Id,
            UserId = currentUserId,
            SubmittedAt = DateTime.UtcNow
        };

        try
        {
            await _eventDispatcher.DispatchAsync(requestSubmittedEvent);
            _logger.LogInformation("Domain event published: ApplicationRequestSubmitted for RequestId {RequestId}", applicationRequest.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to publish ApplicationRequestSubmitted event for RequestId {RequestId}", applicationRequest.Id);
            // Don't throw - request was created successfully, saga will eventually be triggered on retry
        }

        return Result<string>.Success(ApplicationRequestCommandMessages.CreateSuccessfully);
    }

    public async Task<Result> UpdateAsync(UpdateApplicationRequestMentorRequest updateApplicationRequestMentorRequest)
    {
        var applicationRequest =
            await _applicationRequestRepository.GetByIdAsync(updateApplicationRequestMentorRequest.Id,
                                                             nameof(ApplicationRequest.ApplicationDocuments));
        if (applicationRequest == null || applicationRequest.MentorId != _executionContext.GetUserId())
        {
            return Result.Failure(ApplicationRequestErrors.NotFound);
        }

        if (applicationRequest.Status != ApplicationRequestStatus.UnderReview)
        {
            return Result.Failure(ApplicationRequestErrors.MentorCannotUpdateRequestIsNotUnderReview);
        }

        var oldStatus = applicationRequest.Status;

        applicationRequest.ApplicationDocuments ??= new List<ApplicationDocument>();
        updateApplicationRequestMentorRequest.ApplicationDocuments?.ForEach(x =>
        {
            x.FilePath = _fileStorageServices.GetOriginFilePathFromFileSignedPath(x.FilePath);
        });

        if (applicationRequest.ApplicationDocuments != null && applicationRequest.ApplicationDocuments.Count > 0)
        {
            var documentRemoveTasks = applicationRequest.ApplicationDocuments
                .Where(x => !updateApplicationRequestMentorRequest.ApplicationDocuments?.Any(c => c.FilePath == x.FilePath) ?? false)
                .Select(x => _fileStorageServices.DeleteFileAsync(x.FilePath));

            await Task.WhenAll(documentRemoveTasks);

            applicationRequest.ApplicationDocuments = applicationRequest.ApplicationDocuments.Where(x =>
                updateApplicationRequestMentorRequest.ApplicationDocuments?.Any(c => c.FilePath == x.FilePath) ?? true)
                .ToList();
        }

        if (updateApplicationRequestMentorRequest.ApplicationDocuments != null && updateApplicationRequestMentorRequest.ApplicationDocuments.Count > 0)
        {
            var newApplicationDocument = updateApplicationRequestMentorRequest
                .ApplicationDocuments
                .Where(x => x.FileContent != null && x.FileContent.Length > 0).ToList();
            var uploadNewApplicationDocumentTasks = newApplicationDocument
                .Select(c => _fileStorageServices.UploadFileAsync(c.FileContent, UploadType.Default)).ToList();
            await Task.WhenAll(uploadNewApplicationDocumentTasks);

            for (var i = 0; i < newApplicationDocument.Count; i++)
            {
                applicationRequest.ApplicationDocuments!.Add(new()
                {
                    FilePath = uploadNewApplicationDocumentTasks[i].Result,
                    FileName = newApplicationDocument[i].FileName,
                });
            }
        }

        applicationRequest.Submitted = DateTime.UtcNow;
        applicationRequest.Description = updateApplicationRequestMentorRequest.Description;
        applicationRequest.Education = updateApplicationRequestMentorRequest.Education;
        applicationRequest.Certifications = updateApplicationRequestMentorRequest.Certifications;
        applicationRequest.WorkExperience = updateApplicationRequestMentorRequest.WorkExperience;

        applicationRequest.Status = ApplicationRequestStatus.Pending;
        applicationRequest.Note = null;

        _applicationRequestRepository.Update(applicationRequest);
        await _unitOfWork.SaveChangesAsync();

        await HandleSendMailWhenChangeStatusApplicationRequest(applicationRequest,
                                                               oldStatus,
                                                               ApplicationRequestStatus.Pending);

        return Result<string>.Success(ApplicationRequestCommandMessages.UpdateSuccessfully);
    }

    public async Task<Result> RequestUpdateAsync(RequestUpdateApplicationDocumentRequest requestUpdateApplicationDocumentRequest)
    {
        var applicationRequest = await _applicationRequestRepository.GetByIdAsync(requestUpdateApplicationDocumentRequest.Id);
        if (applicationRequest == null)
        {
            return Result.Failure(ApplicationRequestErrors.NotFound);
        }

        if (applicationRequest.Status == ApplicationRequestStatus.UnderReview)
        {
            return Result.Failure(ApplicationRequestErrors.AdminCannotRequestUpdateRequestIsUnderReview);
        }

        var oldStatus = applicationRequest.Status;
        applicationRequest.Status = ApplicationRequestStatus.UnderReview;
        applicationRequest.Note = requestUpdateApplicationDocumentRequest.Note;

        _applicationRequestRepository.Update(applicationRequest);
        await _unitOfWork.SaveChangesAsync();

        await HandleSendMailWhenChangeStatusApplicationRequest(applicationRequest,
                                                               oldStatus,
                                                               ApplicationRequestStatus.UnderReview);

        return Result.Success();
    }

    public async Task<Result<PaginationResult<ApplicationRequestResponse>>> GetAsync(ApplicationRequestQueryParameters applicationRequestQueryParameters)
    {
        var applicationRequestQuery = _applicationRequestRepository.GetQueryable();
        applicationRequestQuery = applicationRequestQuery
            .Where(u =>
                (string.IsNullOrEmpty(applicationRequestQueryParameters.Search)
                 || u.Mentor.UserDetail.FullName
                     .Contains(applicationRequestQueryParameters.Search)
                 || u.Mentor.Email
                     .Contains(applicationRequestQueryParameters.Search))
                && applicationRequestQueryParameters.ApplicationRequestStatuses.Contains((int)u.Status)
            );

        var totalCount = await _applicationRequestRepository.CountAsync(applicationRequestQuery);

        var applicationResponseQuery = applicationRequestQuery
        .Skip(applicationRequestQueryParameters.PageSize * (applicationRequestQueryParameters.PageNumber - 1))
        .Take(applicationRequestQueryParameters.PageSize)
        .Select(u => new ApplicationRequestResponse
        {
            Id = u.Id,
            Summitted = u.Submitted,
            Description = u.Description,
            Education = u.Education,
            WorkExperience = u.WorkExperience,
            Status = u.Status,
            FullName = u.Mentor.UserDetail.FullName,
        });
        var dataResponse = await _applicationRequestRepository.ToListAsync(applicationResponseQuery);

        return PaginationResult<ApplicationRequestResponse>.Create(applicationRequestQueryParameters.PageSize,
            applicationRequestQueryParameters.PageNumber,
            totalCount, dataResponse);
    }

    public async Task<Result<ApplicationRequestDetailResponse>> GetDetailAsync(Guid id)
    {
        var applicationDetailQuery = _applicationRequestRepository.GetQueryable().Where(u => u.Id == id)
        .Select(u => new ApplicationRequestDetailResponse
        {
            Id = u.Id,
            Summitted = u.Submitted,
            Description = u.Description,
            Education = u.Education,
            WorkExperience = u.WorkExperience,
            Status = u.Status,
            FullName = u.Mentor.UserDetail.FullName,
            Note = u.Note,
            MentorEmail = u.Mentor.Email,
            MentorExpertises = u.Mentor.UserExpertises != null ?
                u.Mentor.UserExpertises.Where(ue => !ue.IsDeleted)
                .Select(ue => ue.Expertise.Name).ToList() : null,
            MentorCertifications = u.Certifications,
            ApplicationRequestDocuments = u.ApplicationDocuments != null ? u.ApplicationDocuments
            .Select(ad => new ApplicationRequestDocumentResponse { FilePath = ad.FilePath, FileName = ad.FileName }).ToList() : default!,
            AvatarUrl = u.Mentor.UserDetail.AvatarUrl
        });

        var applicationDetailResponse = await _applicationRequestRepository.FirstOrDefaultAsync(applicationDetailQuery);

        if (applicationDetailResponse == null)
        {
            return default!;
        }

        return applicationDetailResponse;
    }

    private async Task HandleSendMailWhenChangeStatusApplicationRequest(ApplicationRequest applicationRequest,
        ApplicationRequestStatus oldStatus,
        ApplicationRequestStatus newStatus)
    {
        var mentorOfRequest = await _userRepository.GetByIdAsync(applicationRequest.MentorId, nameof(User.UserDetail));
        var oldStatusString = GetApplicationRequestStatusString(oldStatus);
        var newStatusString = GetApplicationRequestStatusString(newStatus);

        var mailContent = await GetChangeStatusApplicationRequestMailTemplate(mentorOfRequest, applicationRequest,
            oldStatusString, newStatusString);


        var mailData = new SendMailData
        {
            ToEmail = mentorOfRequest.Email,
            Body = mailContent,
            IsBodyHtml = true,
            Subject = MailInformationConstants.TitleUpdateApplicationStatusEmail
        };

        await AddEmailWorkItemIntoQueueAsync(mailData);
    }



    private async Task<string> GetChangeStatusApplicationRequestMailTemplate(User mentorOfRequest, ApplicationRequest applicationRequest, string oldStatus, string newStatus)
    {
        var emailMentorRequestStatusChangedModel = new EmailMentorRequestStatusChangedModel
        {
            RecipientName = mentorOfRequest.UserDetail.FullName,
            Note = applicationRequest.Note,
            OldStatus = oldStatus,
            NewStatus = newStatus
        };
        return await _razorLightEngine.CompileRenderAsync("Templates.ApplicationRequestStatusChangeMailTemplate", emailMentorRequestStatusChangedModel);
    }
    private static string GetApplicationRequestStatusString(ApplicationRequestStatus status)
        => Enum.GetName(typeof(ApplicationRequestStatus), status)
            ?? string.Empty;

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

    public async Task<Result> ApproveAsync(Guid id)
    {
        var applicationRequest = await _applicationRequestRepository.GetByIdAsync(id);
        if (applicationRequest == null)
        {
            return Result.Failure(ApplicationRequestErrors.NotFound);
        }

        if (applicationRequest.Status == ApplicationRequestStatus.UnderReview)
        {
            return Result.Failure(ApplicationRequestErrors.AdminCannotApproveRequestIsUnderReview);
        }

        var oldStatus = applicationRequest.Status;
        applicationRequest.Status = ApplicationRequestStatus.Approved;

        _applicationRequestRepository.Update(applicationRequest);
        await _unitOfWork.SaveChangesAsync();

        await HandleSendMailWhenChangeStatusApplicationRequest(applicationRequest,
                                                              oldStatus,
                                                              ApplicationRequestStatus.Approved);

        return Result.Success();
    }

    public async Task<Result> RejectAsync(Guid id, string note)
    {
        var applicationRequest = await _applicationRequestRepository.GetByIdAsync(id);
        if (applicationRequest == null)
        {
            return Result.Failure(ApplicationRequestErrors.NotFound);
        }

        if (applicationRequest.Status == ApplicationRequestStatus.UnderReview)
        {
            return Result.Failure(ApplicationRequestErrors.AdminCannotRejectRequestIsUnderReview);
        }

        if (applicationRequest.Status == ApplicationRequestStatus.Approved)
        {
            return Result.Failure(ApplicationRequestErrors.CannotRejectApprovedRequest);
        }

        var oldStatus = applicationRequest.Status;
        applicationRequest.Status = ApplicationRequestStatus.Rejected;
        applicationRequest.Note = note;

        _applicationRequestRepository.Update(applicationRequest);
        await _unitOfWork.SaveChangesAsync();

        await HandleSendMailWhenChangeStatusApplicationRequest(applicationRequest,
                                                              oldStatus,
                                                              ApplicationRequestStatus.Rejected);

        return Result.Success();
    }

    public async Task<Result<ApplicationRequestDetailResponse>> GetCurrentUserApplicationAsync()
    {
        var currentUserId = _executionContext.GetUserId();

        var applicationDetailQuery = _applicationRequestRepository.GetQueryable()
            .Where(u => u.MentorId == currentUserId && !u.IsDeleted)
            .OrderByDescending(u => u.Submitted)
            .Select(u => new ApplicationRequestDetailResponse
            {
                Id = u.Id,
                Summitted = u.Submitted,
                Description = u.Description,
                Education = u.Education,
                WorkExperience = u.WorkExperience,
                Status = u.Status,
                FullName = u.Mentor.UserDetail.FullName,
                Note = u.Note,
                MentorEmail = u.Mentor.Email,
                MentorExpertises = u.Mentor.UserExpertises != null ?
                    u.Mentor.UserExpertises.Where(ue => !ue.IsDeleted)
                    .Select(ue => ue.Expertise.Name).ToList() : null,
                MentorCertifications = u.Certifications,
                AvatarUrl = u.Mentor.UserDetail.AvatarUrl,
                ApplicationRequestDocuments = u.ApplicationDocuments != null ? u.ApplicationDocuments
                    .Select(ad => new ApplicationRequestDocumentResponse
                    {
                        FilePath = ad.FilePath,
                        FileName = ad.FileName
                    }).ToList() : default!
            });

        var applicationDetailResponse = await _applicationRequestRepository.FirstOrDefaultAsync(applicationDetailQuery);

        if (applicationDetailResponse == null)
        {
            return Result<ApplicationRequestDetailResponse>.Failure(new Error("ApplicationRequest.NotFound", "Application request not found"));
        }

        return Result<ApplicationRequestDetailResponse>.Success(applicationDetailResponse);
    }
}
