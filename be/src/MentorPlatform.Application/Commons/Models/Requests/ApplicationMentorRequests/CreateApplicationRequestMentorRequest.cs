
using FluentValidation;
using MentorPlatform.Application.Commons.ValidationMessages;
using MentorPlatform.Domain.Enums;

namespace MentorPlatform.Application.Commons.Models.Requests.ApplicationMentorRequests;

public class CreateApplicationRequestMentorRequest
{
    public string Education { get; set; } = default!;
    public string WorkExperience { get; set; } = default!;
    public List<string>? Certifications { get; set; } = default;
    public string Description { get; set; } = default;
    public ApplicationRequestStatus Status { get; set; } = ApplicationRequestStatus.Pending;
    public List<ApplicationDocumentRequests>? ApplicationDocuments { get; set; } = default;
}


public class CreateApplicationRequestMentorRequestValidator : AbstractValidator<CreateApplicationRequestMentorRequest>
{
    public CreateApplicationRequestMentorRequestValidator()
    {
        RuleFor(x => x.Education)
            .NotEmpty().WithMessage(ApplicationRequestValidationMessages.EducationNotEmpty)
            .MinimumLength(10).WithMessage(ApplicationRequestValidationMessages.EducationMinLength)
            .MaximumLength(2000).WithMessage(ApplicationRequestValidationMessages.EducationMaxLength);

        RuleFor(x => x.WorkExperience)
            .NotEmpty().WithMessage(ApplicationRequestValidationMessages.WorkExperienceNotEmpty)
            .MinimumLength(10).WithMessage(ApplicationRequestValidationMessages.WorkExperienceMinLength)
            .MaximumLength(2000).WithMessage(ApplicationRequestValidationMessages.WorkExperienceMaxLength);

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage(ApplicationRequestValidationMessages.DescriptionNotEmpty)
            .MaximumLength(2000).WithMessage(ApplicationRequestValidationMessages.DescriptionMaxLength);

        RuleFor(x => x.Status)
            .IsInEnum().WithMessage(ApplicationRequestValidationMessages.StatusInvalid);
        RuleForEach(x => x.ApplicationDocuments)
            .SetValidator(new ApplicationDocumentRequestsValidator());
    }
}

