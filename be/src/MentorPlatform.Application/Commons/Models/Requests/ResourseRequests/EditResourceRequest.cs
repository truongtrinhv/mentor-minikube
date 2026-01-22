using FluentValidation;
using MentorPlatform.Application.Commons.Errors;

namespace MentorPlatform.Application.Commons.Models.Requests.ResourseRequests;
public class EditResourceRequest
{
    public string Title { get; set; }
    public string Description { get; set; }
}

public class EditResourceRequestValidator : AbstractValidator<EditResourceRequest>
{
    public EditResourceRequestValidator()
    {
        RuleFor(x => x.Title.Trim())
            .NotEmpty().WithMessage(ResourceErrorMessages.ResourceTitleCannotBeEmpty)
            .MinimumLength(3).WithMessage(ResourceErrorMessages.ResourceTitleMinLength)
            .MaximumLength(100).WithMessage(ResourceErrorMessages.ResourceTitleMaxLength);

        RuleFor(x => x.Description.Trim())
            .MaximumLength(2000).WithMessage(ResourceErrorMessages.ResourceDescriptionMaxLength);
    }
}
