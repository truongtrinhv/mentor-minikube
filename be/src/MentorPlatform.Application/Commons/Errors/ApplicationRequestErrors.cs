using MentorPlatform.Domain.Shared;

namespace MentorPlatform.Application.Commons.Errors;

public static class ApplicationRequestErrorMessages
{
    public const string NotFound = "Application request not found";
    public const string MentorCannotUpdateRequestIsNotUnderReview = "Mentor can not update request that has status is not under review";

    public const string AdminCannotRequestUpdateRequestIsUnderReview =
        "Admin can not update request that has status is under review";
        
    public const string AdminCannotApproveRequestIsUnderReview = 
        "Admin can not approve request that has status is under review";
        
    public const string AdminCannotRejectRequestIsUnderReview = 
        "Admin can not reject request that has status is under review";
        
    public const string CannotRejectApprovedRequest = 
        "Cannot reject an application that has already been approved";
    
    public const string UserAlreadyHasPendingApplication = 
        "You already have an application that is pending or under review. Please wait for it to be processed or check your application status.";
}
public static class ApplicationRequestErrors
{
    public static Error NotFound => new(nameof(NotFound), ApplicationRequestErrorMessages.NotFound);
    public static Error MentorCannotUpdateRequestIsNotUnderReview => new(nameof(MentorCannotUpdateRequestIsNotUnderReview),
        ApplicationRequestErrorMessages.MentorCannotUpdateRequestIsNotUnderReview);

    public static Error AdminCannotRequestUpdateRequestIsUnderReview => new(
        nameof(AdminCannotRequestUpdateRequestIsUnderReview),
        ApplicationRequestErrorMessages.AdminCannotRequestUpdateRequestIsUnderReview);
        
    public static Error AdminCannotApproveRequestIsUnderReview => new(
        nameof(AdminCannotApproveRequestIsUnderReview),
        ApplicationRequestErrorMessages.AdminCannotApproveRequestIsUnderReview);
        
    public static Error AdminCannotRejectRequestIsUnderReview => new(
        nameof(AdminCannotRejectRequestIsUnderReview),
        ApplicationRequestErrorMessages.AdminCannotRejectRequestIsUnderReview);
        
    public static Error CannotRejectApprovedRequest => new(
        nameof(CannotRejectApprovedRequest),
        ApplicationRequestErrorMessages.CannotRejectApprovedRequest);

    public static Error UserAlreadyHasPendingApplication => new(
        nameof(UserAlreadyHasPendingApplication),
        ApplicationRequestErrorMessages.UserAlreadyHasPendingApplication);
}
