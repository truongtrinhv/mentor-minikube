using FluentValidation;
using MentorPlatform.Application.Commons.Errors;
using Microsoft.AspNetCore.Http;

namespace MentorPlatform.Application.Commons.Models.Requests.ResourseRequests;

public class CreateResourceRequest
{
    public string Title { get; set; }
    public string? Description { get; set; }
    public IFormFile File { get; set; }
}

public class CreateResourceRequestValidator : AbstractValidator<CreateResourceRequest>
{
    public CreateResourceRequestValidator()
    {
        RuleFor(x => x.Title.Trim())
            .NotEmpty().WithMessage(ResourceErrorMessages.ResourceTitleCannotBeEmpty)
            .MinimumLength(3).WithMessage(ResourceErrorMessages.ResourceTitleMinLength)
            .MaximumLength(100).WithMessage(ResourceErrorMessages.ResourceTitleMaxLength);

        RuleFor(x => x.Description.Trim().Replace(Environment.NewLine, " "))
            .MaximumLength(2000)
            .WithMessage(ResourceErrorMessages.ResourceDescriptionMaxLength);

        RuleFor(x => x.File)
            .NotNull().WithMessage(ResourceErrorMessages.ResourceFileCannotBeEmpty)
            .Must(file => file.Length > 0).WithMessage(ResourceErrorMessages.ResourceFileCannotBeEmpty);
    }
}
