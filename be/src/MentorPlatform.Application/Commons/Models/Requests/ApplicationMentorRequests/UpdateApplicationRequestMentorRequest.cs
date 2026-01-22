using FluentValidation;
using MentorPlatform.Application.Commons.ValidationMessages;

namespace MentorPlatform.Application.Commons.Models.Requests.ApplicationMentorRequests;

public class UpdateApplicationRequestMentorRequest
{
    public Guid Id { get; set; }
    public string Education { get; set; } = default!;
    public string WorkExperience { get; set; } = default!;
    public List<string>? Certifications { get; set; } = default;
    public string Description { get; set; } = default;
    public List<ApplicationDocumentUpdateRequests>? ApplicationDocuments { get; set; } = default;
}

public class UpdateApplicationRequestMentorRequestValidator : AbstractValidator<UpdateApplicationRequestMentorRequest>
{
    public UpdateApplicationRequestMentorRequestValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().NotNull()
            .WithMessage(ApplicationRequestValidationMessages.ApplicationRequestIdMustBeNotEmpty);
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
    }
}