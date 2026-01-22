using FluentValidation;
using MentorPlatform.Application.Commons.ValidationMessages;
using MentorPlatform.Domain.Constants;

namespace MentorPlatform.Application.Commons.Models.Requests.CourseCategoryRequests;
public class UpdateCourseCategoryRequest
{
    public string Name { get; set; }
    public string Description { get; set; }
    public bool IsActive { get; set; }
}


public class UpdateCourseCategoryRequestValidator : AbstractValidator<UpdateCourseCategoryRequest>
{
    public UpdateCourseCategoryRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage(CourseCategoryModelsValidationMessages.NameNotEmpty)
            .MaximumLength(CourseCategoryConstants.NameMaxLength).WithMessage(CourseCategoryModelsValidationMessages.NameMaxLength);

        RuleFor(x => x.Description)
            .MaximumLength(CourseCategoryConstants.DescriptionMaxLength).WithMessage(CourseCategoryModelsValidationMessages.DescriptionMaxLength);

    }
}
